<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Feedback;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Feedback>
 */
class FeedbackRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Feedback::class);
    }

    public function getAverageRating(string $targetType, ?int $targetId = null): float
    {
        $qb = $this->createQueryBuilder('f')
            ->select('COALESCE(AVG(f.rating), 0)')
            ->where('f.targetType = :type')
            ->setParameter('type', $targetType);

        if ($targetId !== null) {
            $qb->andWhere('f.targetId = :id')->setParameter('id', $targetId);
        }

        return (float) $qb->getQuery()->getSingleScalarResult();
    }
}
