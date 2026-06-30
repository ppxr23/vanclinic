<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Product;
use App\Enum\ProductCategory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    /**
     * @return Product[]
     */
    public function findActiveByCategory(?ProductCategory $category = null): array
    {
        $qb = $this->createQueryBuilder('p')
            ->where('p.isActive = true')
            ->orderBy('p.name', 'ASC');

        if ($category) {
            $qb->andWhere('p.category = :cat')->setParameter('cat', $category);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @return Product[]
     */
    public function findLowStock(): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.stockQuantity <= p.stockAlertThreshold')
            ->andWhere('p.isActive = true')
            ->getQuery()
            ->getResult();
    }
}
