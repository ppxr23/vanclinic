<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Appointment;
use App\Entity\Notification;
use App\Entity\Order;
use App\Entity\Payment;
use App\Entity\User;
use App\Enum\PaymentStatus;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class NotificationService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MailerInterface $mailer,
        private readonly SmsService $smsService,
        private readonly LoggerInterface $logger,
        private readonly string $mailerFrom,
        private readonly string $mailerFromName,
    ) {
    }

    public function notifyAppointmentScheduled(Appointment $appointment): void
    {
        $patient = $appointment->getPatient();
        $user = $patient->getUser();
        $date = $appointment->getScheduledAt()->format('d/m/Y à H:i');

        $this->send(
            user: $user,
            type: Notification::TYPE_APPOINTMENT_REMINDER,
            title: 'Rendez-vous enregistré',
            message: "Votre rendez-vous du {$date} a bien été enregistré. Nous vous confirmons rapidement.",
            channels: [Notification::CHANNEL_IN_APP, Notification::CHANNEL_EMAIL, Notification::CHANNEL_SMS],
            data: ['appointment_id' => $appointment->getId()],
        );
    }

    public function notifyAppointmentConfirmed(Appointment $appointment): void
    {
        $user = $appointment->getPatient()->getUser();
        $date = $appointment->getScheduledAt()->format('d/m/Y à H:i');
        $location = $appointment->getLocation() ?? 'à distance';

        $this->send(
            user: $user,
            type: Notification::TYPE_APPOINTMENT_CONFIRMED,
            title: 'Rendez-vous confirmé',
            message: "Votre rendez-vous du {$date} ({$location}) est confirmé. À bientôt !",
            channels: [Notification::CHANNEL_IN_APP, Notification::CHANNEL_EMAIL, Notification::CHANNEL_SMS],
            data: ['appointment_id' => $appointment->getId()],
        );
    }

    public function notifyAppointmentCancelled(Appointment $appointment): void
    {
        $user = $appointment->getPatient()->getUser();
        $date = $appointment->getScheduledAt()->format('d/m/Y à H:i');

        $this->send(
            user: $user,
            type: Notification::TYPE_APPOINTMENT_CANCELLED,
            title: 'Rendez-vous annulé',
            message: "Votre rendez-vous du {$date} a été annulé. Vous pouvez en prendre un nouveau à tout moment.",
            channels: [Notification::CHANNEL_IN_APP, Notification::CHANNEL_SMS],
            data: ['appointment_id' => $appointment->getId()],
        );
    }

    public function notifyAppointmentReminder(Appointment $appointment): void
    {
        $user = $appointment->getPatient()->getUser();
        $date = $appointment->getScheduledAt()->format('d/m/Y à H:i');

        $this->send(
            user: $user,
            type: Notification::TYPE_APPOINTMENT_REMINDER,
            title: 'Rappel de rendez-vous',
            message: "Rappel : votre rendez-vous est prévu le {$date}. Merci de vous présenter 15 minutes en avance.",
            channels: [Notification::CHANNEL_SMS, Notification::CHANNEL_IN_APP],
            data: ['appointment_id' => $appointment->getId()],
        );
    }

    public function notifyOrderStatusChange(Order $order): void
    {
        $user = $order->getPatient()->getUser();
        $statusLabel = $order->getStatus()->getLabel();

        $typeMap = [
            'paid' => Notification::TYPE_ORDER_CONFIRMED,
            'shipped' => Notification::TYPE_ORDER_SHIPPED,
            'delivered' => Notification::TYPE_ORDER_DELIVERED,
        ];

        $this->send(
            user: $user,
            type: $typeMap[$order->getStatus()->value] ?? Notification::TYPE_ORDER_CONFIRMED,
            title: "Commande {$order->getOrderNumber()} : {$statusLabel}",
            message: "Le statut de votre commande {$order->getOrderNumber()} est maintenant : {$statusLabel}.",
            channels: [Notification::CHANNEL_IN_APP, Notification::CHANNEL_EMAIL],
            data: ['order_id' => $order->getId()],
        );
    }

    public function notifyPaymentResult(Payment $payment): void
    {
        $user = $payment->getPayer();
        $success = $payment->getStatus() === PaymentStatus::SUCCEEDED;

        $this->send(
            user: $user,
            type: $success ? Notification::TYPE_PAYMENT_SUCCESS : Notification::TYPE_PAYMENT_FAILED,
            title: $success ? 'Paiement réussi' : 'Paiement échoué',
            message: $success
                ? "Votre paiement de {$payment->getAmountMga()} MGA a été confirmé (réf. {$payment->getReference()})."
                : "Votre paiement a échoué. Raison : " . ($payment->getFailureReason() ?? 'inconnue'),
            channels: [Notification::CHANNEL_IN_APP, Notification::CHANNEL_SMS, Notification::CHANNEL_EMAIL],
            data: ['payment_id' => $payment->getId()],
        );
    }

    /**
     * @param array<string> $channels
     * @param array<string, mixed>|null $data
     */
    public function send(
        User $user,
        string $type,
        string $title,
        string $message,
        array $channels = [Notification::CHANNEL_IN_APP],
        ?array $data = null,
    ): void {
        foreach ($channels as $channel) {
            $notification = new Notification();
            $notification->setUser($user)
                ->setType($type)
                ->setChannel($channel)
                ->setTitle($title)
                ->setMessage($message)
                ->setData($data);

            $this->em->persist($notification);

            try {
                switch ($channel) {
                    case Notification::CHANNEL_EMAIL:
                        $this->sendEmail($user, $title, $message);
                        $notification->markAsSent();
                        break;

                    case Notification::CHANNEL_SMS:
                        $this->smsService->send($user->getPhone(), $message);
                        $notification->markAsSent();
                        break;

                    case Notification::CHANNEL_IN_APP:
                        $notification->markAsSent(); // Considéré envoyé dès qu'il est en base
                        break;
                }
            } catch (\Throwable $e) {
                $this->logger->error('Erreur d\'envoi de notification', [
                    'channel' => $channel,
                    'user_id' => $user->getId(),
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->em->flush();
    }

    private function sendEmail(User $user, string $subject, string $body): void
    {
        $email = (new Email())
            ->from(sprintf('%s <%s>', $this->mailerFromName, $this->mailerFrom))
            ->to($user->getEmail())
            ->subject('[VanClinic] ' . $subject)
            ->html($this->renderEmailBody($user, $subject, $body));

        $this->mailer->send($email);
    }

    private function renderEmailBody(User $user, string $subject, string $body): string
    {
        $name = htmlspecialchars($user->getFirstName() ?? '', ENT_QUOTES);
        $bodyHtml = nl2br(htmlspecialchars($body, ENT_QUOTES));

        return <<<HTML
        <!DOCTYPE html>
        <html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">VanClinic</h1>
                <p style="margin: 5px 0 0;">Votre santé visuelle, partout à Madagascar</p>
            </div>
            <div style="padding: 20px; background: #f5f5f5;">
                <p>Bonjour {$name},</p>
                <h2 style="color: #1e3a8a;">{$subject}</h2>
                <p>{$bodyHtml}</p>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                    Cet email vous a été envoyé automatiquement par VanClinic.
                    Pour toute question, contactez-nous à support@vanclinic.mg.
                </p>
            </div>
        </body></html>
        HTML;
    }
}
