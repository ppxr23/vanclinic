<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notification>
 */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    public function findUnreadForUser(User $user, int $limit = 50): array
    {
        return $this->createQueryBuilder('n')
            ->where('n.user = :u')
            ->andWhere('n.isRead = false')
            ->andWhere('n.channel = :channel')
            ->setParameter('u', $user)
            ->setParameter('channel', Notification::CHANNEL_IN_APP)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countUnread(User $user): int
    {
        return (int) $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->where('n.user = :u')
            ->andWhere('n.isRead = false')
            ->andWhere('n.channel = :channel')
            ->setParameter('u', $user)
            ->setParameter('channel', Notification::CHANNEL_IN_APP)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
