<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Appointment;
use App\Entity\Patient;
use App\Entity\User;
use App\Repository\AppointmentRepository;
use App\Repository\PatientRepository;
use App\Service\AppointmentService;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/appointments', name: 'api_appointments_')]
#[OA\Tag(name: 'Appointments')]
#[Security(name: 'Bearer')]
class AppointmentController extends AbstractController
{
    public function __construct(
        private readonly AppointmentService $appointmentService,
        private readonly AppointmentRepository $appointmentRepository,
        private readonly PatientRepository $patientRepository,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[OA\Get(summary: "Liste des rendez-vous de l'utilisateur courant")]
    public function list(#[CurrentUser] User $user, Request $request): JsonResponse
    {
        $patient = $this->patientRepository->findOneBy(['user' => $user]);
        if (!$patient) {
            return $this->json([], 200);
        }

        $upcoming = $request->query->has('upcoming') ? $request->query->getBoolean('upcoming') : null;
        $appointments = $this->appointmentRepository->findByPatient($patient, $upcoming);

        return $this->json(array_map([$this, 'serialize'], $appointments));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[OA\Post(
        summary: 'Créer un nouveau rendez-vous',
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                required: ['scheduledAt'],
                properties: [
                    new OA\Property(property: 'scheduledAt', type: 'string', format: 'date-time'),
                    new OA\Property(property: 'durationMinutes', type: 'integer', default: 30),
                    new OA\Property(property: 'type', type: 'string', enum: ['on_site', 'teleexpertise', 'follow_up', 'screening']),
                    new OA\Property(property: 'reason', type: 'string'),
                    new OA\Property(property: 'location', type: 'string'),
                    new OA\Property(property: 'ophthalmologistId', type: 'integer'),
                    new OA\Property(property: 'clinicSessionId', type: 'integer'),
                ]
            )
        )
    )]
    public function create(#[CurrentUser] User $user, Request $request): JsonResponse
    {
        $patient = $this->patientRepository->findOneBy(['user' => $user]);
        if (!$patient) {
            return $this->json(['error' => 'Profil patient introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $appointment = $this->appointmentService->createAppointment($patient, $data);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json($this->serialize($appointment), 201);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Get(summary: "Détail d'un rendez-vous")]
    public function show(Appointment $appointment): JsonResponse
    {
        return $this->json($this->serialize($appointment));
    }

    #[Route('/{id}/confirm', name: 'confirm', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[OA\Post(summary: 'Confirmer un rendez-vous')]
    public function confirm(Appointment $appointment): JsonResponse
    {
        $this->appointmentService->confirm($appointment);
        return $this->json($this->serialize($appointment));
    }

    #[Route('/{id}/cancel', name: 'cancel', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[OA\Post(summary: 'Annuler un rendez-vous')]
    public function cancel(Appointment $appointment, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $this->appointmentService->cancel($appointment, $data['reason'] ?? null);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json($this->serialize($appointment));
    }

    #[Route('/{id}/reschedule', name: 'reschedule', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[OA\Post(summary: 'Reprogrammer un rendez-vous')]
    public function reschedule(Appointment $appointment, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        if (empty($data['scheduledAt'])) {
            return $this->json(['error' => 'Date manquante'], 400);
        }

        try {
            $this->appointmentService->reschedule($appointment, new \DateTime($data['scheduledAt']));
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json($this->serialize($appointment));
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Appointment $a): array
    {
        return [
            'id' => $a->getId(),
            'patient' => [
                'id' => $a->getPatient()?->getId(),
                'patientNumber' => $a->getPatient()?->getPatientNumber(),
                'fullName' => $a->getPatient()?->getUser()?->getFullName(),
            ],
            'ophthalmologist' => $a->getOphthalmologist() ? [
                'id' => $a->getOphthalmologist()->getId(),
                'fullName' => $a->getOphthalmologist()->getFullName(),
            ] : null,
            'scheduledAt' => $a->getScheduledAt()?->format(\DateTimeInterface::ATOM),
            'durationMinutes' => $a->getDurationMinutes(),
            'type' => $a->getType()->value,
            'typeLabel' => $a->getType()->getLabel(),
            'status' => $a->getStatus()->value,
            'statusLabel' => $a->getStatus()->getLabel(),
            'reason' => $a->getReason(),
            'location' => $a->getLocation(),
            'notes' => $a->getNotes(),
            'createdAt' => $a->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
