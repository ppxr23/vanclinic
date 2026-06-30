<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Patient;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Patient>
 */
class PatientRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Patient::class);
    }

    public function findByPatientNumber(string $number): ?Patient
    {
        return $this->findOneBy(['patientNumber' => $number]);
    }

    public function generateNextPatientNumber(): string
    {
        $year = date('Y');
        $count = (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.patientNumber LIKE :pattern')
            ->setParameter('pattern', "VC-{$year}-%")
            ->getQuery()
            ->getSingleScalarResult();

        return sprintf('VC-%s-%06d', $year, $count + 1);
    }
}
