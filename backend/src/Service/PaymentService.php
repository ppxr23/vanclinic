<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Order;
use App\Entity\Payment;
use App\Entity\User;
use App\Enum\OrderStatus;
use App\Enum\PaymentMethod;
use App\Enum\PaymentStatus;
use App\Repository\PaymentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Gestion des paiements via Mobile Money (Orange Money, Airtel Money, Mvola)
 * et carte bancaire (Visa).
 */
class PaymentService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly PaymentRepository $paymentRepository,
        private readonly NotificationService $notificationService,
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        /** @var array<string, array<string, string>> */
        private readonly array $providerConfigs,
        private readonly string $environment,
    ) {
    }

    /**
     * Initie un paiement pour une commande.
     *
     * @param array<string, mixed> $paymentData
     * @return array{payment: Payment, redirectUrl?: string, instructions?: string}
     */
    public function initiateOrderPayment(Order $order, User $payer, PaymentMethod $method, array $paymentData = []): array
    {
        $payment = new Payment();
        $payment->setReference($this->paymentRepository->generateNextReference())
            ->setOrder($order)
            ->setPayer($payer)
            ->setAmountMga($order->getTotalMga())
            ->setMethod($method)
            ->setStatus(PaymentStatus::PROCESSING)
            ->setPayerPhone($paymentData['payerPhone'] ?? $payer->getPhone());

        $this->em->persist($payment);
        $this->em->flush();

        // Appel au provider
        $result = match ($method) {
            PaymentMethod::ORANGE_MONEY => $this->processOrangeMoney($payment),
            PaymentMethod::AIRTEL_MONEY => $this->processAirtelMoney($payment),
            PaymentMethod::MVOLA => $this->processMvola($payment),
            PaymentMethod::VISA => $this->processVisa($payment, $paymentData),
            PaymentMethod::CASH => $this->processCash($payment),
        };

        $this->em->flush();

        return array_merge(['payment' => $payment], $result);
    }

    /**
     * Confirme un paiement (appelé par les webhooks des providers).
     *
     * @param array<string, mixed> $providerData
     */
    public function confirmPayment(string $externalTransactionId, array $providerData = []): ?Payment
    {
        $payment = $this->paymentRepository->findByExternalId($externalTransactionId);
        if (!$payment) {
            $this->logger->warning('Tentative de confirmation d\'un paiement inconnu', ['ext_id' => $externalTransactionId]);
            return null;
        }

        $payment->setStatus(PaymentStatus::SUCCEEDED);
        $payment->setCompletedAt(new \DateTime());
        $payment->setProviderResponse($providerData);

        if ($payment->getOrder()) {
            $payment->getOrder()->setStatus(OrderStatus::PAID);
        }

        $this->em->flush();

        $this->notificationService->notifyPaymentResult($payment);
        if ($payment->getOrder()) {
            $this->notificationService->notifyOrderStatusChange($payment->getOrder());
        }

        return $payment;
    }

    public function markAsFailed(Payment $payment, string $reason): void
    {
        $payment->setStatus(PaymentStatus::FAILED);
        $payment->setFailureReason($reason);
        $this->em->flush();
        $this->notificationService->notifyPaymentResult($payment);
    }

    /** @return array<string, string> */
    private function processOrangeMoney(Payment $payment): array
    {
        if ($this->environment !== 'prod') {
            $payment->setExternalTransactionId('OM-MOCK-' . uniqid());
            return ['instructions' => "Composez #144# puis suivez les instructions pour valider le paiement de {$payment->getAmountMga()} MGA. Référence : {$payment->getReference()}."];
        }

        try {
            $response = $this->httpClient->request('POST', $this->providerConfigs['orange']['url'] . '/webpayment', [
                'auth_bearer' => $this->providerConfigs['orange']['merchant_key'],
                'json' => [
                    'merchant_key' => $this->providerConfigs['orange']['merchant_key'],
                    'currency' => 'MGA',
                    'order_id' => $payment->getReference(),
                    'amount' => $payment->getAmountMga(),
                    'return_url' => 'https://vanclinic.mg/payment/return',
                    'cancel_url' => 'https://vanclinic.mg/payment/cancel',
                    'notif_url' => 'https://api.vanclinic.mg/api/payments/webhook/orange',
                ],
                'timeout' => 15,
            ]);

            $data = $response->toArray();
            $payment->setExternalTransactionId($data['pay_token'] ?? '');
            return ['redirectUrl' => $data['payment_url'] ?? ''];
        } catch (\Throwable $e) {
            $this->markAsFailed($payment, 'Erreur Orange Money: ' . $e->getMessage());
            return ['instructions' => 'Erreur lors de l\'initialisation du paiement Orange Money.'];
        }
    }

    /** @return array<string, string> */
    private function processAirtelMoney(Payment $payment): array
    {
        if ($this->environment !== 'prod') {
            $payment->setExternalTransactionId('AM-MOCK-' . uniqid());
            return ['instructions' => "Composez *436# puis suivez les instructions pour valider le paiement de {$payment->getAmountMga()} MGA. Référence : {$payment->getReference()}."];
        }
        // En prod : appel à l'API Airtel
        $payment->setExternalTransactionId('AM-' . uniqid());
        return ['instructions' => 'Confirmez la transaction via Airtel Money.'];
    }

    /** @return array<string, string> */
    private function processMvola(Payment $payment): array
    {
        if ($this->environment !== 'prod') {
            $payment->setExternalTransactionId('MVOLA-MOCK-' . uniqid());
            return ['instructions' => "Composez #111# puis suivez les instructions pour valider le paiement de {$payment->getAmountMga()} MGA via Mvola. Référence : {$payment->getReference()}."];
        }
        // En prod : appel à l'API Mvola
        $payment->setExternalTransactionId('MVOLA-' . uniqid());
        return ['instructions' => 'Confirmez la transaction via Mvola.'];
    }

    /**
     * @param array<string, mixed> $paymentData
     * @return array<string, string>
     */
    private function processVisa(Payment $payment, array $paymentData): array
    {
        // Intégration avec un PSP (Stripe, Adyen, ou banque locale)
        $payment->setExternalTransactionId('VISA-' . uniqid());
        return ['redirectUrl' => '/payment/visa/confirm/' . $payment->getReference()];
    }

    /** @return array<string, string> */
    private function processCash(Payment $payment): array
    {
        // Paiement en espèces via agent relais : reste en attente jusqu'à confirmation manuelle
        return ['instructions' => "Présentez la référence {$payment->getReference()} à un agent relais VanClinic pour régler en espèces."];
    }
}
