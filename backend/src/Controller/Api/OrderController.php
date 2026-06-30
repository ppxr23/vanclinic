<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Order;
use App\Entity\User;
use App\Enum\OrderStatus;
use App\Repository\OrderRepository;
use App\Repository\PatientRepository;
use App\Service\OrderService;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/orders', name: 'api_orders_')]
#[OA\Tag(name: 'Shop')]
#[Security(name: 'Bearer')]
class OrderController extends AbstractController
{
    public function __construct(
        private readonly OrderRepository $orderRepository,
        private readonly OrderService $orderService,
        private readonly PatientRepository $patientRepository,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[OA\Get(summary: 'Mes commandes')]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        $patient = $this->patientRepository->findOneBy(['user' => $user]);
        if (!$patient) {
            return $this->json([]);
        }

        $orders = $this->orderRepository->findByPatient($patient);
        return $this->json(array_map([$this, 'serialize'], $orders));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[OA\Post(
        summary: 'Créer une commande',
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                required: ['items', 'delivery'],
                properties: [
                    new OA\Property(
                        property: 'items',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'productId', type: 'integer'),
                                new OA\Property(property: 'quantity', type: 'integer'),
                            ]
                        )
                    ),
                    new OA\Property(
                        property: 'delivery',
                        properties: [
                            new OA\Property(property: 'address', type: 'string'),
                            new OA\Property(property: 'district', type: 'string'),
                            new OA\Property(property: 'phone', type: 'string'),
                            new OA\Property(property: 'notes', type: 'string'),
                        ]
                    ),
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
            $order = $this->orderService->createOrder(
                $patient,
                $data['items'] ?? [],
                $data['delivery'] ?? []
            );
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json($this->serialize($order), 201);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(Order $order): JsonResponse
    {
        return $this->json($this->serialize($order));
    }

    #[Route('/{id}/cancel', name: 'cancel', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[OA\Post(summary: 'Annuler une commande')]
    public function cancel(Order $order): JsonResponse
    {
        try {
            $this->orderService->cancel($order);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json($this->serialize($order));
    }

    #[Route('/{id}/status', name: 'update_status', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_COORDINATEUR')]
    #[OA\Patch(summary: 'Changer le statut d\'une commande (admin)')]
    public function updateStatus(Order $order, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $status = OrderStatus::tryFrom($data['status'] ?? '');

        if (!$status) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }

        $this->orderService->updateStatus($order, $status);
        return $this->json($this->serialize($order));
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Order $o): array
    {
        return [
            'id' => $o->getId(),
            'orderNumber' => $o->getOrderNumber(),
            'status' => $o->getStatus()->value,
            'statusLabel' => $o->getStatus()->getLabel(),
            'subtotalMga' => $o->getSubtotalMga(),
            'shippingFeeMga' => $o->getShippingFeeMga(),
            'totalMga' => $o->getTotalMga(),
            'items' => array_map(fn($i) => [
                'id' => $i->getId(),
                'productId' => $i->getProduct()?->getId(),
                'productName' => $i->getProductNameSnapshot(),
                'quantity' => $i->getQuantity(),
                'unitPriceMga' => $i->getUnitPriceMga(),
                'lineTotalMga' => $i->getLineTotalMga(),
            ], $o->getItems()->toArray()),
            'delivery' => [
                'address' => $o->getDeliveryAddress(),
                'district' => $o->getDeliveryDistrict(),
                'phone' => $o->getDeliveryPhone(),
                'notes' => $o->getDeliveryNotes(),
            ],
            'shippedAt' => $o->getShippedAt()?->format(\DateTimeInterface::ATOM),
            'deliveredAt' => $o->getDeliveredAt()?->format(\DateTimeInterface::ATOM),
            'createdAt' => $o->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
