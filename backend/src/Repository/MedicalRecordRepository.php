<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\MedicalRecord;
use App\Entity\Patient;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MedicalRecord>
 */
class MedicalRecordRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MedicalRecord::class);
    }

    /**
     * @return MedicalRecord[]
     */
    public function findByPatient(Patient $patient): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.patient = :p')
            ->setParameter('p', $patient)
            ->orderBy('m.consultationDate', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
