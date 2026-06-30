<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Order;
use App\Entity\Patient;
use App\Enum\OrderStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Order>
 */
class OrderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Order::class);
    }

    public function findByPatient(Patient $patient): array
    {
        return $this->createQueryBuilder('o')
            ->where('o.patient = :p')
            ->setParameter('p', $patient)
            ->orderBy('o.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function generateNextOrderNumber(): string
    {
        $year = date('Y');
        $count = (int) $this->createQueryBuilder('o')
            ->select('COUNT(o.id)')
            ->where('o.orderNumber LIKE :pattern')
            ->setParameter('pattern', "VC-ORD-{$year}-%")
            ->getQuery()
            ->getSingleScalarResult();

        return sprintf('VC-ORD-%s-%06d', $year, $count + 1);
    }

    public function countByStatus(OrderStatus $status): int
    {
        return (int) $this->createQueryBuilder('o')
            ->select('COUNT(o.id)')
            ->where('o.status = :status')
            ->setParameter('status', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getTotalRevenue(?\DateTimeInterface $from = null, ?\DateTimeInterface $to = null): int
    {
        $qb = $this->createQueryBuilder('o')
            ->select('COALESCE(SUM(o.totalMga), 0)')
            ->where('o.status IN (:statuses)')
            ->setParameter('statuses', [OrderStatus::PAID, OrderStatus::SHIPPED, OrderStatus::DELIVERED]);

        if ($from) {
            $qb->andWhere('o.createdAt >= :from')->setParameter('from', $from);
        }
        if ($to) {
            $qb->andWhere('o.createdAt <= :to')->setParameter('to', $to);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
