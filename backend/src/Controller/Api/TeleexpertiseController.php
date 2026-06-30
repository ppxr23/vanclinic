<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\TeleexpertiseRequest;
use App\Entity\User;
use App\Repository\MedicalRecordRepository;
use App\Repository\TeleexpertiseRequestRepository;
use App\Service\TeleexpertiseService;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/teleexpertise', name: 'api_teleexpertise_')]
#[OA\Tag(name: 'Teleexpertise')]
#[Security(name: 'Bearer')]
#[IsGranted('ROLE_OPHTALMOLOGUE')]
class TeleexpertiseController extends AbstractController
{
    public function __construct(
        private readonly TeleexpertiseService $service,
        private readonly TeleexpertiseRequestRepository $requestRepository,
        private readonly MedicalRecordRepository $recordRepository,
    ) {
    }

    #[Route('/pending', name: 'pending', methods: ['GET'])]
    #[OA\Get(summary: 'Liste des demandes en attente')]
    public function pending(#[CurrentUser] User $user): JsonResponse
    {
        $requests = $this->requestRepository->findPendingForUser($user);
        return $this->json(array_map([$this, 'serialize'], $requests));
    }

    #[Route('/record/{recordId}', name: 'create', methods: ['POST'], requirements: ['recordId' => '\d+'])]
    #[OA\Post(
        summary: 'Demander une téléexpertise sur un dossier médical',
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                required: ['question'],
                properties: [
                    new OA\Property(property: 'question', type: 'string'),
                    new OA\Property(property: 'urgency', type: 'string', enum: ['low', 'normal', 'high', 'urgent']),
                ]
            )
        )
    )]
    public function create(int $recordId, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $record = $this->recordRepository->find($recordId);
        if (!$record) {
            return $this->json(['error' => 'Dossier introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $teleRequest = $this->service->createRequest(
            $record,
            $user,
            $data['question'] ?? '',
            $data['urgency'] ?? 'normal'
        );

        return $this->json($this->serialize($teleRequest), 201);
    }

    #[Route('/{id}/respond', name: 'respond', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[OA\Post(summary: 'Répondre à une demande de téléexpertise')]
    public function respond(TeleexpertiseRequest $req, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $this->service->respond($req, $user, $data['response'] ?? '');
        return $this->json($this->serialize($req));
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(TeleexpertiseRequest $r): array
    {
        $record = $r->getMedicalRecord();
        return [
            'id' => $r->getId(),
            'patient' => [
                'fullName' => $record?->getPatient()?->getUser()?->getFullName() ?? '—',
            ],
            'question' => $r->getQuestion(),
            'urgency' => $r->getUrgency(),
            'status' => $r->getStatus(),
            'response' => $r->getResponse(),
            'requestedBy' => ['fullName' => $r->getRequestedBy()?->getFullName() ?? '—'],
            'assignedTo' => $r->getAssignedTo() ? ['fullName' => $r->getAssignedTo()->getFullName()] : null,
            'respondedAt' => $r->getRespondedAt()?->format(\DateTimeInterface::ATOM),
            'createdAt' => $r->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
