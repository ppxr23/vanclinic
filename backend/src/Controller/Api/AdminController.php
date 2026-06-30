<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Enum\UserRole;
use App\Entity\MobileClinicSession;
use App\Entity\Product;
use App\Enum\ProductCategory;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\AppointmentRepository;
use App\Repository\MobileClinicSessionRepository;
use App\Repository\OrderRepository;
use App\Repository\PatientRepository;
use App\Repository\ProductRepository;
use App\Repository\UserRepository;
use App\Service\AppointmentService;
use App\Service\AuthService;
use App\Service\DashboardService;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin', name: 'api_admin_')]
#[OA\Tag(name: 'Dashboard')]
#[Security(name: 'Bearer')]
class AdminController extends AbstractController
{
    public function __construct(
        private readonly DashboardService $dashboardService,
        private readonly AuthService $authService,
        private readonly UserRepository $userRepository,
        private readonly PatientRepository $patientRepository,
        private readonly AppointmentRepository $appointmentRepository,
        private readonly AppointmentService $appointmentService,
        private readonly OrderRepository $orderRepository,
        private readonly ProductRepository $productRepository,
        private readonly MobileClinicSessionRepository $sessionRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('/dashboard', name: 'dashboard', methods: ['GET'])]
    #[OA\Get(summary: 'Tableau de bord coordinateur (indicateurs clés)')]
    public function dashboard(): JsonResponse
    {
        return $this->json($this->dashboardService->getCoordinatorDashboard());
    }

    #[Route('/nav-counts', name: 'nav_counts', methods: ['GET'])]
    #[OA\Get(summary: 'Compteurs pour les badges du menu de navigation')]
    public function navCounts(): JsonResponse
    {
        return $this->json($this->dashboardService->getNavCounts());
    }

    #[Route('/users', name: 'list_users', methods: ['GET'])]
    #[OA\Get(summary: 'Liste des utilisateurs', parameters: [
        new OA\Parameter(name: 'role', in: 'query', schema: new OA\Schema(type: 'string')),
    ])]
    public function listUsers(Request $request): JsonResponse
    {
        $roleParam = $request->query->get('role');
        $role = $roleParam ? UserRole::tryFrom($roleParam) : null;
        $users = $role ? $this->userRepository->findByRole($role) : $this->userRepository->findAll();

        return $this->json(array_map(fn($u) => [
            'id' => $u->getId(),
            'fullName' => $u->getFullName(),
            'email' => $u->getEmail(),
            'phone' => $u->getPhone(),
            'roles' => $u->getRoles(),
            'isActive' => $u->isActive(),
            'lastLoginAt' => $u->getLastLoginAt()?->format(\DateTimeInterface::ATOM),
            'createdAt' => $u->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], $users));
    }

    #[Route('/users/staff', name: 'create_staff', methods: ['POST'])]
    #[OA\Post(summary: 'Créer un compte staff')]
    #[IsGranted('ROLE_COORDINATEUR')]
    public function createStaff(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $role = UserRole::tryFrom($data['role'] ?? '');

        if (!$role || $role === UserRole::PATIENT) {
            return $this->json(['error' => 'Rôle invalide pour un compte staff'], 400);
        }

        try {
            $user = $this->authService->createStaffAccount($data, $role);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'fullName' => $user->getFullName(),
            'roles' => $user->getRoles(),
        ], 201);
    }

    #[Route('/patients', name: 'list_patients', methods: ['GET'])]
    #[OA\Get(summary: 'Liste complète des patients')]
    public function listPatients(): JsonResponse
    {
        $patients = $this->patientRepository->findAll();

        return $this->json(array_map(fn($p) => [
            'id' => $p->getId(),
            'patientNumber' => $p->getPatientNumber(),
            'fullName' => $p->getUser()?->getFullName(),
            'email' => $p->getUser()?->getEmail(),
            'phone' => $p->getUser()?->getPhone(),
            'city' => $p->getUser()?->getCity(),
            'district' => $p->getUser()?->getDistrict(),
            'gender' => $p->getGender(),
            'birthDate' => $p->getUser()?->getBirthDate()?->format('Y-m-d'),
            'isActive' => $p->getUser()?->isActive(),
            'appointmentCount' => $p->getAppointments()->count(),
            'createdAt' => $p->getUser()?->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], $patients));
    }

    #[Route('/appointments', name: 'list_appointments', methods: ['GET'])]
    #[OA\Get(summary: 'Liste de tous les rendez-vous')]
    public function listAppointments(): JsonResponse
    {
        $appointments = $this->appointmentRepository->findBy([], ['scheduledAt' => 'DESC']);

        return $this->json(array_map(fn($a) => [
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
            'type' => $a->getType()->value,
            'typeLabel' => $a->getType()->getLabel(),
            'status' => $a->getStatus()->value,
            'statusLabel' => $a->getStatus()->getLabel(),
            'reason' => $a->getReason(),
            'location' => $a->getLocation(),
            'createdAt' => $a->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], $appointments));
    }

    #[Route('/appointments', name: 'create_appointment', methods: ['POST'])]
    #[OA\Post(summary: 'Créer un rendez-vous pour un patient (admin)')]
    public function createAppointment(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $patientId = $data['patientId'] ?? null;
        if (!$patientId) {
            return $this->json(['error' => 'patientId requis'], 400);
        }

        $patient = $this->patientRepository->find($patientId);
        if (!$patient) {
            return $this->json(['error' => 'Patient introuvable'], 404);
        }

        try {
            $appointment = $this->appointmentService->createAppointment($patient, $data);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json([
            'id' => $appointment->getId(),
            'patient' => ['id' => $appointment->getPatient()?->getId(), 'fullName' => $appointment->getPatient()?->getUser()?->getFullName()],
            'scheduledAt' => $appointment->getScheduledAt()?->format(\DateTimeInterface::ATOM),
            'status' => $appointment->getStatus()->value,
        ], 201);
    }

    #[Route('/orders', name: 'list_orders', methods: ['GET'])]
    #[OA\Get(summary: 'Liste de toutes les commandes')]
    public function listOrders(): JsonResponse
    {
        $orders = $this->orderRepository->findBy([], ['createdAt' => 'DESC']);

        return $this->json(array_map(fn($o) => [
            'id' => $o->getId(),
            'orderNumber' => $o->getOrderNumber(),
            'patientName' => $o->getPatient()?->getUser()?->getFullName(),
            'status' => $o->getStatus()->value,
            'statusLabel' => $o->getStatus()->getLabel(),
            'totalMga' => $o->getTotalMga(),
            'items' => array_map(fn($i) => [
                'productName' => $i->getProductNameSnapshot(),
                'quantity' => $i->getQuantity(),
            ], $o->getItems()->toArray()),
            'createdAt' => $o->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], $orders));
    }

    #[Route('/low-stock', name: 'low_stock', methods: ['GET'])]
    #[OA\Get(summary: 'Produits en stock bas')]
    public function lowStock(): JsonResponse
    {
        $products = $this->productRepository->findLowStock();

        return $this->json(array_map(fn($p) => [
            'id' => $p->getId(),
            'name' => $p->getName(),
            'stockQuantity' => $p->getStockQuantity(),
            'category' => $p->getCategory()->value,
        ], $products));
    }

    #[Route('/products', name: 'create_product', methods: ['POST'])]
    #[OA\Post(summary: 'Créer un produit')]
    #[IsGranted('ROLE_COORDINATEUR')]
    public function createProduct(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['sku']) || empty($data['name']) || empty($data['category']) || !isset($data['priceMga'])) {
            return $this->json(['error' => 'sku, name, category et priceMga sont requis'], 400);
        }

        $category = ProductCategory::tryFrom($data['category']);
        if (!$category) {
            return $this->json(['error' => 'Catégorie invalide'], 400);
        }

        try {
            $product = new Product();
            $product->setSku($data['sku'])
                ->setName($data['name'])
                ->setDescription($data['description'] ?? null)
                ->setCategory($category)
                ->setBrand($data['brand'] ?? null)
                ->setPriceMga((int) $data['priceMga'])
                ->setStockQuantity((int) ($data['stockQuantity'] ?? 0))
                ->setIsActive(true);

            $this->em->persist($product);
            $this->em->flush();
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json([
            'id' => $product->getId(),
            'sku' => $product->getSku(),
            'name' => $product->getName(),
            'category' => $product->getCategory()->value,
            'priceMga' => $product->getPriceMga(),
            'stockQuantity' => $product->getStockQuantity(),
        ], 201);
    }

    #[Route('/sessions', name: 'list_sessions', methods: ['GET'])]
    #[OA\Get(summary: 'Liste des sessions clinique mobile')]
    public function listSessions(): JsonResponse
    {
        $sessions = $this->sessionRepository->findBy([], ['startDate' => 'ASC']);

        return $this->json(array_map(fn($s) => [
            'id' => $s->getId(),
            'locationName' => $s->getLocationName(),
            'district' => $s->getDistrict(),
            'commune' => $s->getCommune(),
            'startDate' => $s->getStartDate()?->format(\DateTimeInterface::ATOM),
            'endDate' => $s->getEndDate()?->format(\DateTimeInterface::ATOM),
            'status' => $s->getStatus(),
            'maxAppointments' => $s->getMaxAppointments(),
            'appointmentCount' => $s->getAppointments()->count(),
            'availableSlots' => $s->getAvailableSlots(),
            'leadOphthalmologist' => $s->getLeadOphthalmologist() ? [
                'id' => $s->getLeadOphthalmologist()->getId(),
                'fullName' => $s->getLeadOphthalmologist()->getFullName(),
            ] : null,
            'notes' => $s->getNotes(),
            'createdAt' => $s->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], $sessions));
    }

    #[Route('/sessions', name: 'create_session', methods: ['POST'])]
    #[OA\Post(summary: 'Planifier une session clinique mobile')]
    #[IsGranted('ROLE_COORDINATEUR')]
    public function createSession(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['locationName']) || empty($data['district']) || empty($data['startDate']) || empty($data['endDate'])) {
            return $this->json(['error' => 'locationName, district, startDate et endDate sont requis'], 400);
        }

        try {
            $session = new MobileClinicSession();
            $session->setLocationName($data['locationName'])
                ->setDistrict($data['district'])
                ->setCommune($data['commune'] ?? null)
                ->setStartDate(new \DateTime($data['startDate']))
                ->setEndDate(new \DateTime($data['endDate']))
                ->setMaxAppointments((int) ($data['maxAppointments'] ?? 50))
                ->setNotes($data['notes'] ?? null);

            if (!empty($data['leadOphthalmologistId'])) {
                $ophtalmo = $this->userRepository->find((int) $data['leadOphthalmologistId']);
                if ($ophtalmo) {
                    $session->setLeadOphthalmologist($ophtalmo);
                }
            }

            $this->em->persist($session);
            $this->em->flush();
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json([
            'id' => $session->getId(),
            'locationName' => $session->getLocationName(),
            'district' => $session->getDistrict(),
            'startDate' => $session->getStartDate()?->format(\DateTimeInterface::ATOM),
            'endDate' => $session->getEndDate()?->format(\DateTimeInterface::ATOM),
            'status' => $session->getStatus(),
            'maxAppointments' => $session->getMaxAppointments(),
        ], 201);
    }

    #[Route('/sessions/{id}/status', name: 'update_session_status', methods: ['PATCH'])]
    #[OA\Patch(summary: 'Mettre à jour le statut d\'une session mobile')]
    #[IsGranted('ROLE_COORDINATEUR')]
    public function updateSessionStatus(int $id, Request $request): JsonResponse
    {
        $session = $this->sessionRepository->find($id);
        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $validStatuses = [MobileClinicSession::STATUS_PLANNED, MobileClinicSession::STATUS_ACTIVE, MobileClinicSession::STATUS_COMPLETED, MobileClinicSession::STATUS_CANCELLED];

        if (empty($data['status']) || !in_array($data['status'], $validStatuses)) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }

        $session->setStatus($data['status']);
        $this->em->flush();

        return $this->json(['id' => $session->getId(), 'status' => $session->getStatus()]);
    }
}
