<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\TeleexpertiseRequest;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TeleexpertiseRequest>
 */
class TeleexpertiseRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TeleexpertiseRequest::class);
    }

    public function findPendingForUser(User $user): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.assignedTo = :u OR t.assignedTo IS NULL')
            ->andWhere('t.status = :status')
            ->setParameter('u', $user)
            ->setParameter('status', TeleexpertiseRequest::STATUS_PENDING)
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
