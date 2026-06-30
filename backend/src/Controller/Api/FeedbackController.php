<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Feedback;
use App\Entity\User;
use App\Repository\FeedbackRepository;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/feedback', name: 'api_feedback_')]
#[OA\Tag(name: 'Feedback')]
#[Security(name: 'Bearer')]
class FeedbackController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FeedbackRepository $repository,
    ) {
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[OA\Post(
        summary: 'Soumettre un avis',
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                required: ['targetType', 'rating'],
                properties: [
                    new OA\Property(property: 'targetType', type: 'string', enum: ['consultation', 'product', 'platform', 'agent']),
                    new OA\Property(property: 'targetId', type: 'integer'),
                    new OA\Property(property: 'rating', type: 'integer', minimum: 1, maximum: 5),
                    new OA\Property(property: 'comment', type: 'string'),
                    new OA\Property(property: 'isPublic', type: 'boolean'),
                ]
            )
        )
    )]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $feedback = new Feedback();
        $feedback->setAuthor($user)
            ->setTargetType($data['targetType'] ?? Feedback::TARGET_PLATFORM)
            ->setTargetId($data['targetId'] ?? null)
            ->setRating((int) ($data['rating'] ?? 5))
            ->setComment($data['comment'] ?? null)
            ->setIsPublic((bool) ($data['isPublic'] ?? false));

        $this->em->persist($feedback);
        $this->em->flush();

        return $this->json([
            'id' => $feedback->getId(),
            'message' => 'Merci pour votre retour !',
        ], 201);
    }

    #[Route('/stats/{targetType}', name: 'stats', methods: ['GET'])]
    #[OA\Get(summary: 'Statistiques (note moyenne) sur une cible')]
    public function stats(string $targetType, Request $request): JsonResponse
    {
        $targetId = $request->query->getInt('targetId') ?: null;
        return $this->json([
            'targetType' => $targetType,
            'targetId' => $targetId,
            'averageRating' => round($this->repository->getAverageRating($targetType, $targetId), 2),
        ]);
    }
}
