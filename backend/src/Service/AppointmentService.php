<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Appointment;
use App\Entity\MobileClinicSession;
use App\Entity\Patient;
use App\Entity\User;
use App\Enum\AppointmentStatus;
use App\Enum\AppointmentType;
use App\Repository\AppointmentRepository;
use Doctrine\ORM\EntityManagerInterface;

class AppointmentService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly AppointmentRepository $appointmentRepository,
        private readonly NotificationService $notificationService,
    ) {
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createAppointment(Patient $patient, array $data): Appointment
    {
        $appointment = new Appointment();
        $appointment->setPatient($patient)
            ->setScheduledAt(new \DateTime($data['scheduledAt']))
            ->setDurationMinutes($data['durationMinutes'] ?? 30)
            ->setType(AppointmentType::from($data['type'] ?? AppointmentType::ON_SITE->value))
            ->setReason($data['reason'] ?? null)
            ->setLocation($data['location'] ?? null);

        // Si un ophtalmologue est spécifié, vérifier les conflits
        if (!empty($data['ophthalmologistId'])) {
            $doc = $this->em->getRepository(User::class)->find($data['ophthalmologistId']);
            if ($doc) {
                if ($this->appointmentRepository->hasConflict(
                    $doc,
                    $appointment->getScheduledAt(),
                    $appointment->getDurationMinutes()
                )) {
                    throw new \DomainException('Conflit de créneau pour cet ophtalmologue.');
                }
                $appointment->setOphthalmologist($doc);
            }
        }

        // Si une session de clinique mobile est spécifiée
        if (!empty($data['clinicSessionId'])) {
            $session = $this->em->getRepository(MobileClinicSession::class)->find($data['clinicSessionId']);
            if ($session) {
                if ($session->getAvailableSlots() <= 0) {
                    throw new \DomainException('Aucune place disponible pour cette session.');
                }
                $appointment->setClinicSession($session);
                $appointment->setLocation($session->getLocationName());
            }
        }

        $this->em->persist($appointment);
        $this->em->flush();

        $this->notificationService->notifyAppointmentScheduled($appointment);

        return $appointment;
    }

    public function confirm(Appointment $appointment): Appointment
    {
        $appointment->setStatus(AppointmentStatus::CONFIRMED);
        $appointment->setConfirmedAt(new \DateTime());
        $this->em->flush();

        $this->notificationService->notifyAppointmentConfirmed($appointment);

        return $appointment;
    }

    public function cancel(Appointment $appointment, ?string $reason = null): Appointment
    {
        if ($appointment->getStatus() === AppointmentStatus::COMPLETED) {
            throw new \DomainException('Impossible d\'annuler un rendez-vous terminé.');
        }

        $appointment->setStatus(AppointmentStatus::CANCELLED);
        $appointment->setCancelledAt(new \DateTime());
        $appointment->setCancellationReason($reason);
        $this->em->flush();

        $this->notificationService->notifyAppointmentCancelled($appointment);

        return $appointment;
    }

    /**
     * Reschedule a un nouveau créneau.
     */
    public function reschedule(Appointment $appointment, \DateTimeInterface $newDateTime): Appointment
    {
        if ($appointment->getOphthalmologist()
            && $this->appointmentRepository->hasConflict(
                $appointment->getOphthalmologist(),
                $newDateTime,
                $appointment->getDurationMinutes(),
                $appointment->getId()
            )) {
            throw new \DomainException('Conflit de créneau au nouvel horaire demandé.');
        }

        $appointment->setScheduledAt($newDateTime);
        $appointment->setStatus(AppointmentStatus::SCHEDULED);
        $this->em->flush();

        return $appointment;
    }

    /**
     * Envoie les rappels pour les rendez-vous à venir dans les prochaines 24h.
     */
    public function sendUpcomingReminders(): int
    {
        $appointments = $this->appointmentRepository->findUpcomingForReminders(new \DateInterval('P1D'));
        $count = 0;

        foreach ($appointments as $appointment) {
            $this->notificationService->notifyAppointmentReminder($appointment);
            $count++;
        }

        return $count;
    }
}
