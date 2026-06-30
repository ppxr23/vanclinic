<?php

declare(strict_types=1);

namespace App\Service;

use App\Enum\AppointmentStatus;
use App\Enum\OrderStatus;
use App\Enum\PaymentStatus;
use App\Enum\UserRole;
use App\Repository\AppointmentRepository;
use App\Repository\OrderRepository;
use App\Repository\PaymentRepository;
use App\Repository\ProductRepository;
use App\Repository\UserRepository;

class DashboardService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly AppointmentRepository $appointmentRepository,
        private readonly OrderRepository $orderRepository,
        private readonly PaymentRepository $paymentRepository,
        private readonly ProductRepository $productRepository,
    ) {
    }

    /**
     * @return array<string, int>
     */
    public function getNavCounts(): array
    {
        return [
            'patients'     => $this->userRepository->countByRole(UserRole::PATIENT),
            'appointments' => $this->appointmentRepository->countByStatus(AppointmentStatus::SCHEDULED)
                            + $this->appointmentRepository->countByStatus(AppointmentStatus::CONFIRMED),
            'orders'       => $this->orderRepository->countByStatus(OrderStatus::PENDING),
            'lowStock'     => count($this->productRepository->findLowStock()),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function getCoordinatorDashboard(): array
    {
        $now = new \DateTime();
        $thirtyDaysAgo = (clone $now)->modify('-30 days');

        return [
            'users' => [
                'patients' => $this->userRepository->countByRole(UserRole::PATIENT),
                'agents' => $this->userRepository->countByRole(UserRole::AGENT_RELAIS),
                'ophtalmologues' => $this->userRepository->countByRole(UserRole::OPHTALMOLOGUE),
            ],
            'appointments' => [
                'scheduled' => $this->appointmentRepository->countByStatus(AppointmentStatus::SCHEDULED),
                'confirmed' => $this->appointmentRepository->countByStatus(AppointmentStatus::CONFIRMED),
                'completed' => $this->appointmentRepository->countByStatus(AppointmentStatus::COMPLETED),
                'cancelled' => $this->appointmentRepository->countByStatus(AppointmentStatus::CANCELLED),
            ],
            'revenue' => [
                'last_30_days_mga' => $this->orderRepository->getTotalRevenue($thirtyDaysAgo, $now),
                'all_time_mga' => $this->orderRepository->getTotalRevenue(),
            ],
            'payments' => [
                'succeeded' => $this->paymentRepository->countByStatus(PaymentStatus::SUCCEEDED),
                'pending' => $this->paymentRepository->countByStatus(PaymentStatus::PENDING),
                'failed' => $this->paymentRepository->countByStatus(PaymentStatus::FAILED),
            ],
            'inventory' => [
                'low_stock_count' => count($this->productRepository->findLowStock()),
            ],
        ];
    }
}
