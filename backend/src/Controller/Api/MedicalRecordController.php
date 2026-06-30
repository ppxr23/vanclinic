<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\MedicalRecord;
use App\Entity\Patient;
use App\Entity\User;
use App\Repository\MedicalRecordRepository;
use App\Repository\PatientRepository;
use App\Service\MedicalRecordService;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/medical/records', name: 'api_medical_records_')]
#[OA\Tag(name: 'MedicalRecords')]
#[Security(name: 'Bearer')]
class MedicalRecordController extends AbstractController
{
    public function __construct(
        private readonly MedicalRecordRepository $recordRepository,
        private readonly MedicalRecordService $recordService,
        private readonly PatientRepository $patientRepository,
    ) {
    }

    #[Route('/my', name: 'my_records', methods: ['GET'])]
    #[OA\Get(summary: 'Mon dossier médical (en tant que patient)')]
    public function myRecords(#[CurrentUser] User $user): JsonResponse
    {
        $patient = $this->patientRepository->findOneBy(['user' => $user]);
        if (!$patient) {
            return $this->json([], 200);
        }

        $records = $this->recordRepository->findByPatient($patient);
        return $this->json(array_map([$this, 'serialize'], $records));
    }

    #[Route('/patient/{patientId}', name: 'by_patient', methods: ['GET'], requirements: ['patientId' => '\d+'])]
    #[IsGranted('ROLE_OPHTALMOLOGUE')]
    #[OA\Get(summary: 'Dossiers médicaux d\'un patient (réservé aux soignants)')]
    public function byPatient(int $patientId): JsonResponse
    {
        $patient = $this->patientRepository->find($patientId);
        if (!$patient) {
            return $this->json(['error' => 'Patient introuvable'], 404);
        }

        $records = $this->recordRepository->findByPatient($patient);
        return $this->json(array_map([$this, 'serialize'], $records));
    }

    #[Route('/patient/{patientId}', name: 'create', methods: ['POST'], requirements: ['patientId' => '\d+'])]
    #[IsGranted('ROLE_OPHTALMOLOGUE')]
    #[OA\Post(
        summary: 'Créer un nouveau dossier médical',
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'chiefComplaint', type: 'string'),
                    new OA\Property(property: 'observations', type: 'string'),
                    new OA\Property(property: 'diagnosis', type: 'string'),
                    new OA\Property(property: 'treatment', type: 'string'),
                    new OA\Property(property: 'prescription', type: 'string'),
                    new OA\Property(property: 'consultationDate', type: 'string', format: 'date'),
                    new OA\Property(property: 'rightEye', type: 'object'),
                    new OA\Property(property: 'leftEye', type: 'object'),
                    new OA\Property(property: 'pupillaryDistance', type: 'number'),
                ]
            )
        )
    )]
    public function create(int $patientId, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $patient = $this->patientRepository->find($patientId);
        if (!$patient) {
            return $this->json(['error' => 'Patient introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $record = $this->recordService->createRecord($patient, $user, $data);

        return $this->json($this->serialize($record), 201);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(MedicalRecord $record, #[CurrentUser] User $user): JsonResponse
    {
        // Un patient ne peut voir que ses propres dossiers
        $isOwner = $record->getPatient()?->getUser()?->getId() === $user->getId();
        $isStaff = in_array('ROLE_OPHTALMOLOGUE', $user->getRoles(), true);

        if (!$isOwner && !$isStaff) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        return $this->json($this->serialize($record));
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(MedicalRecord $r): array
    {
        return [
            'id' => $r->getId(),
            'consultationDate' => $r->getConsultationDate()?->format('Y-m-d'),
            'chiefComplaint' => $r->getChiefComplaint(),
            'observations' => $r->getObservations(),
            'diagnosis' => $r->getDiagnosis(),
            'treatment' => $r->getTreatment(),
            'prescription' => $r->getPrescription(),
            'recommendations' => $r->getRecommendations(),
            'nextVisitDate' => $r->getNextVisitDate()?->format('Y-m-d'),
            'rightEye' => [
                'visionUncorrected' => $r->getRightEyeVisionUncorrected(),
                'visionCorrected' => $r->getRightEyeVisionCorrected(),
                'sphere' => $r->getRightEyeSphere(),
                'cylinder' => $r->getRightEyeCylinder(),
                'axis' => $r->getRightEyeAxis(),
            ],
            'leftEye' => [
                'visionUncorrected' => $r->getLeftEyeVisionUncorrected(),
                'visionCorrected' => $r->getLeftEyeVisionCorrected(),
                'sphere' => $r->getLeftEyeSphere(),
                'cylinder' => $r->getLeftEyeCylinder(),
                'axis' => $r->getLeftEyeAxis(),
            ],
            'pupillaryDistance' => $r->getPupillaryDistance(),
            'createdBy' => $r->getCreatedBy()?->getFullName(),
            'createdAt' => $r->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
