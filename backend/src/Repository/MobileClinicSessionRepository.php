<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\MobileClinicSession;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MobileClinicSession>
 */
class MobileClinicSessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MobileClinicSession::class);
    }

    public function findUpcoming(): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.startDate >= :now')
            ->andWhere('s.status IN (:statuses)')
            ->setParameter('now', new \DateTime())
            ->setParameter('statuses', [MobileClinicSession::STATUS_PLANNED, MobileClinicSession::STATUS_ACTIVE])
            ->orderBy('s.startDate', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
