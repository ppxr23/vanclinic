<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\EducationalContent;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<EducationalContent>
 */
class EducationalContentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EducationalContent::class);
    }

    public function findPublished(string $language = 'fr', int $limit = 20): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.isPublished = true')
            ->andWhere('c.language = :lang')
            ->setParameter('lang', $language)
            ->orderBy('c.publishedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
