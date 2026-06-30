<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Appointment;
use App\Entity\Patient;
use App\Entity\User;
use App\Enum\AppointmentStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Appointment>
 */
class AppointmentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Appointment::class);
    }

    /**
     * Retourne les rendez-vous d'un patient.
     *
     * @return Appointment[]
     */
    public function findByPatient(Patient $patient, ?bool $upcoming = null): array
    {
        $qb = $this->createQueryBuilder('a')
            ->where('a.patient = :p')
            ->setParameter('p', $patient)
            ->orderBy('a.scheduledAt', 'DESC');

        if ($upcoming === true) {
            $qb->andWhere('a.scheduledAt >= :now')
                ->setParameter('now', new \DateTime());
        } elseif ($upcoming === false) {
            $qb->andWhere('a.scheduledAt < :now')
                ->setParameter('now', new \DateTime());
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Vérifie s'il existe un conflit pour un ophtalmologue à un créneau donné.
     */
    public function hasConflict(
        User $ophthalmologist,
        \DateTimeInterface $start,
        int $durationMinutes,
        ?int $excludeAppointmentId = null
    ): bool {
        $end = (clone $start)->modify('+' . $durationMinutes . ' minutes');

        $qb = $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->where('a.ophthalmologist = :doc')
            ->andWhere('a.status NOT IN (:cancelled, :noShow)')
            ->andWhere('a.scheduledAt < :end')
            ->setParameter('doc', $ophthalmologist)
            ->setParameter('cancelled', AppointmentStatus::CANCELLED)
            ->setParameter('noShow', AppointmentStatus::NO_SHOW)
            ->setParameter('end', $end);

        if ($excludeAppointmentId !== null) {
            $qb->andWhere('a.id != :excludeId')
                ->setParameter('excludeId', $excludeAppointmentId);
        }

        // PostgreSQL: pour les sessions Doctrine, on charge tout et on filtre en PHP
        // l'overlap exact (scheduledAt + duration > start). Approche simple ici.
        $candidates = $qb->getQuery()->getResult();
        return $candidates[0] > 0 ? $this->hasOverlap($ophthalmologist, $start, $end, $excludeAppointmentId) : false;
    }

    private function hasOverlap(User $doc, \DateTimeInterface $start, \DateTimeInterface $end, ?int $excludeId): bool
    {
        $qb = $this->createQueryBuilder('a')
            ->where('a.ophthalmologist = :doc')
            ->andWhere('a.status NOT IN (:cancelled, :noShow)')
            ->andWhere('a.scheduledAt < :end')
            ->setParameter('doc', $doc)
            ->setParameter('cancelled', AppointmentStatus::CANCELLED)
            ->setParameter('noShow', AppointmentStatus::NO_SHOW)
            ->setParameter('end', $end);

        if ($excludeId) {
            $qb->andWhere('a.id != :id')->setParameter('id', $excludeId);
        }

        foreach ($qb->getQuery()->getResult() as $appt) {
            /** @var Appointment $appt */
            if ($appt->getEndsAt() > $start) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return Appointment[]
     */
    public function findUpcomingForReminders(\DateInterval $interval): array
    {
        $from = new \DateTime();
        $to = (clone $from)->add($interval);

        return $this->createQueryBuilder('a')
            ->where('a.scheduledAt BETWEEN :from AND :to')
            ->andWhere('a.status IN (:statuses)')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->setParameter('statuses', [AppointmentStatus::SCHEDULED, AppointmentStatus::CONFIRMED])
            ->getQuery()
            ->getResult();
    }

    public function countByStatus(AppointmentStatus $status): int
    {
        return (int) $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->where('a.status = :s')
            ->setParameter('s', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
