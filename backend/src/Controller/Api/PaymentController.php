<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\User;
use App\Enum\PaymentMethod;
use App\Repository\OrderRepository;
use App\Service\PaymentService;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/payments', name: 'api_payments_')]
#[OA\Tag(name: 'Payments')]
class PaymentController extends AbstractController
{
    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly OrderRepository $orderRepository,
    ) {
    }

    #[Route('/order/{orderId}', name: 'pay_order', methods: ['POST'], requirements: ['orderId' => '\d+'])]
    #[Security(name: 'Bearer')]
    #[OA\Post(
        summary: 'Initier le paiement d\'une commande',
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                required: ['method'],
                properties: [
                    new OA\Property(property: 'method', type: 'string', enum: ['orange_money', 'airtel_money', 'mvola', 'visa', 'cash']),
                    new OA\Property(property: 'payerPhone', type: 'string', description: 'Numéro Mobile Money (optionnel)'),
                ]
            )
        )
    )]
    public function payOrder(int $orderId, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $order = $this->orderRepository->find($orderId);
        if (!$order) {
            return $this->json(['error' => 'Commande introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $method = PaymentMethod::tryFrom($data['method'] ?? '');

        if (!$method) {
            return $this->json(['error' => 'Méthode de paiement invalide'], 400);
        }

        try {
            $result = $this->paymentService->initiateOrderPayment($order, $user, $method, $data);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json([
            'payment' => [
                'reference' => $result['payment']->getReference(),
                'amountMga' => $result['payment']->getAmountMga(),
                'method' => $result['payment']->getMethod()->value,
                'status' => $result['payment']->getStatus()->value,
            ],
            'redirectUrl' => $result['redirectUrl'] ?? null,
            'instructions' => $result['instructions'] ?? null,
        ]);
    }

    #[Route('/webhook/{provider}', name: 'webhook', methods: ['POST'], requirements: ['provider' => 'orange|airtel|mvola|visa'])]
    #[OA\Post(summary: 'Webhook de confirmation paiement (appelé par les providers)')]
    public function webhook(string $provider, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $extId = $data['transaction_id'] ?? $data['pay_token'] ?? $data['reference'] ?? null;

        if (!$extId) {
            return $this->json(['error' => 'Identifiant manquant'], 400);
        }

        $payment = $this->paymentService->confirmPayment((string) $extId, $data);
        if (!$payment) {
            return $this->json(['error' => 'Paiement introuvable'], 404);
        }

        return $this->json(['status' => 'ok']);
    }
}
