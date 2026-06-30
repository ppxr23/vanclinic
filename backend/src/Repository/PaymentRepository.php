<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Payment;
use App\Enum\PaymentStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Payment>
 */
class PaymentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Payment::class);
    }

    public function findByExternalId(string $extId): ?Payment
    {
        return $this->findOneBy(['externalTransactionId' => $extId]);
    }

    public function generateNextReference(): string
    {
        $year = date('Y');
        $count = (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.reference LIKE :pattern')
            ->setParameter('pattern', "VC-PAY-{$year}-%")
            ->getQuery()
            ->getSingleScalarResult();

        return sprintf('VC-PAY-%s-%06d', $year, $count + 1);
    }

    public function countByStatus(PaymentStatus $status): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.status = :s')
            ->setParameter('s', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
