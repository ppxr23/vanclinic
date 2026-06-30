<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Patient;
use App\Entity\User;
use App\Repository\PatientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/patients', name: 'api_patients_')]
#[OA\Tag(name: 'Patients')]
#[Security(name: 'Bearer')]
class PatientController extends AbstractController
{
    public function __construct(
        private readonly PatientRepository $patientRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    #[OA\Get(summary: 'Profil patient de l\'utilisateur courant')]
    public function me(#[CurrentUser] User $user): JsonResponse
    {
        $patient = $this->patientRepository->findOneBy(['user' => $user]);
        if (!$patient) {
            return $this->json(['error' => 'Profil patient introuvable'], 404);
        }

        return $this->json($this->serialize($patient));
    }

    #[Route('/me', name: 'update_me', methods: ['PUT', 'PATCH'])]
    #[OA\Put(summary: 'Mettre à jour son profil patient')]
    public function updateMe(#[CurrentUser] User $user, Request $request): JsonResponse
    {
        $patient = $this->patientRepository->findOneBy(['user' => $user]);
        if (!$patient) {
            return $this->json(['error' => 'Profil introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        // Mise à jour du User
        if (isset($data['firstName'])) $user->setFirstName($data['firstName']);
        if (isset($data['lastName'])) $user->setLastName($data['lastName']);
        if (isset($data['address'])) $user->setAddress($data['address']);
        if (isset($data['city'])) $user->setCity($data['city']);
        if (isset($data['district'])) $user->setDistrict($data['district']);
        if (isset($data['preferredLanguage'])) $user->setPreferredLanguage($data['preferredLanguage']);

        // Mise à jour du Patient
        if (isset($data['gender'])) $patient->setGender($data['gender']);
        if (isset($data['occupation'])) $patient->setOccupation($data['occupation']);
        if (isset($data['medicalHistory'])) $patient->setMedicalHistory($data['medicalHistory']);
        if (isset($data['allergies'])) $patient->setAllergies($data['allergies']);
        if (isset($data['currentMedications'])) $patient->setCurrentMedications($data['currentMedications']);
        if (isset($data['emergencyContactName'])) $patient->setEmergencyContactName($data['emergencyContactName']);
        if (isset($data['emergencyContactPhone'])) $patient->setEmergencyContactPhone($data['emergencyContactPhone']);

        $this->em->flush();

        return $this->json($this->serialize($patient));
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_OPHTALMOLOGUE')]
    #[OA\Get(summary: 'Détails d\'un patient (réservé aux soignants)')]
    public function show(Patient $patient): JsonResponse
    {
        return $this->json($this->serialize($patient));
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Patient $p): array
    {
        $u = $p->getUser();
        return [
            'id' => $p->getId(),
            'patientNumber' => $p->getPatientNumber(),
            'firstName' => $u?->getFirstName(),
            'lastName' => $u?->getLastName(),
            'fullName' => $u?->getFullName(),
            'email' => $u?->getEmail(),
            'phone' => $u?->getPhone(),
            'birthDate' => $u?->getBirthDate()?->format('Y-m-d'),
            'gender' => $p->getGender(),
            'occupation' => $p->getOccupation(),
            'address' => $u?->getAddress(),
            'city' => $u?->getCity(),
            'district' => $u?->getDistrict(),
            'medicalHistory' => $p->getMedicalHistory(),
            'allergies' => $p->getAllergies(),
            'currentMedications' => $p->getCurrentMedications(),
            'emergencyContact' => [
                'name' => $p->getEmergencyContactName(),
                'phone' => $p->getEmergencyContactPhone(),
            ],
        ];
    }
}
