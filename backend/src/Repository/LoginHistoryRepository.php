<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\LoginHistory;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LoginHistory>
 */
class LoginHistoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LoginHistory::class);
    }

    public function findRecentForUser(User $user, int $limit = 20): array
    {
        return $this->createQueryBuilder('l')
            ->where('l.user = :u')
            ->setParameter('u', $user)
            ->orderBy('l.loggedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
