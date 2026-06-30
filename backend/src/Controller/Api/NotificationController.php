<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/notifications', name: 'api_notifications_')]
#[OA\Tag(name: 'Notifications')]
#[Security(name: 'Bearer')]
class NotificationController extends AbstractController
{
    public function __construct(
        private readonly NotificationRepository $repository,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[OA\Get(summary: 'Mes notifications non lues')]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        $notifications = $this->repository->findUnreadForUser($user);
        return $this->json([
            'count' => count($notifications),
            'items' => array_map([$this, 'serialize'], $notifications),
        ]);
    }

    #[Route('/count', name: 'count', methods: ['GET'])]
    #[OA\Get(summary: 'Nombre de notifications non lues')]
    public function count(#[CurrentUser] User $user): JsonResponse
    {
        return $this->json(['count' => $this->repository->countUnread($user)]);
    }

    #[Route('/{id}/read', name: 'mark_read', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[OA\Post(summary: 'Marquer une notification comme lue')]
    public function markRead(Notification $notification, #[CurrentUser] User $user): JsonResponse
    {
        if ($notification->getUser()?->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $notification->markAsRead();
        $this->em->flush();

        return $this->json(['message' => 'Notification marquée comme lue']);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Notification $n): array
    {
        return [
            'id' => $n->getId(),
            'type' => $n->getType(),
            'channel' => $n->getChannel(),
            'title' => $n->getTitle(),
            'message' => $n->getMessage(),
            'data' => $n->getData(),
            'isRead' => $n->isRead(),
            'createdAt' => $n->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
