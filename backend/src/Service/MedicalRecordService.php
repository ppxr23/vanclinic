<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\MedicalRecord;
use App\Entity\Patient;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class MedicalRecordService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createRecord(Patient $patient, User $createdBy, array $data): MedicalRecord
    {
        $record = new MedicalRecord();
        $record->setPatient($patient)
            ->setCreatedBy($createdBy)
            ->setChiefComplaint($data['chiefComplaint'] ?? null)
            ->setObservations($data['observations'] ?? null)
            ->setDiagnosis($data['diagnosis'] ?? null)
            ->setTreatment($data['treatment'] ?? null)
            ->setPrescription($data['prescription'] ?? null)
            ->setRecommendations($data['recommendations'] ?? null);

        if (!empty($data['consultationDate'])) {
            $record->setConsultationDate(new \DateTime($data['consultationDate']));
        }

        if (!empty($data['nextVisitDate'])) {
            $record->setNextVisitDate(new \DateTime($data['nextVisitDate']));
        }

        // Mesures œil droit
        if (isset($data['rightEye'])) {
            $record->setRightEyeVisionUncorrected($data['rightEye']['visionUncorrected'] ?? null)
                ->setRightEyeVisionCorrected($data['rightEye']['visionCorrected'] ?? null)
                ->setRightEyeSphere($data['rightEye']['sphere'] ?? null)
                ->setRightEyeCylinder($data['rightEye']['cylinder'] ?? null)
                ->setRightEyeAxis($data['rightEye']['axis'] ?? null);
        }

        // Mesures œil gauche
        if (isset($data['leftEye'])) {
            $record->setLeftEyeVisionUncorrected($data['leftEye']['visionUncorrected'] ?? null)
                ->setLeftEyeVisionCorrected($data['leftEye']['visionCorrected'] ?? null)
                ->setLeftEyeSphere($data['leftEye']['sphere'] ?? null)
                ->setLeftEyeCylinder($data['leftEye']['cylinder'] ?? null)
                ->setLeftEyeAxis($data['leftEye']['axis'] ?? null);
        }

        if (!empty($data['pupillaryDistance'])) {
            $record->setPupillaryDistance((string) $data['pupillaryDistance']);
        }

        $this->em->persist($record);
        $this->em->flush();

        return $record;
    }
}
