<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Patient;
use App\Entity\Product;
use App\Enum\OrderStatus;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;

class OrderService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OrderRepository $orderRepository,
        private readonly ProductRepository $productRepository,
        private readonly NotificationService $notificationService,
    ) {
    }

    /**
     * Crée une nouvelle commande pour un patient.
     *
     * @param array<int, array{productId: int, quantity: int}> $items
     * @param array<string, mixed> $deliveryData
     */
    public function createOrder(Patient $patient, array $items, array $deliveryData): Order
    {
        if (empty($items)) {
            throw new \InvalidArgumentException('La commande doit contenir au moins un produit.');
        }

        $order = new Order();
        $order->setPatient($patient)
            ->setOrderNumber($this->orderRepository->generateNextOrderNumber())
            ->setDeliveryAddress($deliveryData['address'])
            ->setDeliveryDistrict($deliveryData['district'] ?? null)
            ->setDeliveryPhone($deliveryData['phone'])
            ->setDeliveryNotes($deliveryData['notes'] ?? null)
            ->setShippingFeeMga($this->calculateShippingFee($deliveryData['district'] ?? null));

        foreach ($items as $itemData) {
            $product = $this->productRepository->find($itemData['productId']);
            if (!$product || !$product->isActive()) {
                throw new \DomainException("Produit indisponible : {$itemData['productId']}.");
            }

            $quantity = (int) $itemData['quantity'];
            if ($product->getStockQuantity() < $quantity) {
                throw new \DomainException("Stock insuffisant pour : {$product->getName()}.");
            }

            $orderItem = new OrderItem();
            $orderItem->setProduct($product)->setQuantity($quantity);
            $order->addItem($orderItem);

            $product->decreaseStock($quantity);
        }

        $order->recalculateTotals();

        $this->em->persist($order);
        $this->em->flush();

        return $order;
    }

    public function updateStatus(Order $order, OrderStatus $newStatus): Order
    {
        $order->setStatus($newStatus);

        if ($newStatus === OrderStatus::SHIPPED) {
            $order->setShippedAt(new \DateTime());
        } elseif ($newStatus === OrderStatus::DELIVERED) {
            $order->setDeliveredAt(new \DateTime());
        }

        $this->em->flush();

        $this->notificationService->notifyOrderStatusChange($order);

        return $order;
    }

    public function cancel(Order $order): Order
    {
        if (in_array($order->getStatus(), [OrderStatus::DELIVERED, OrderStatus::CANCELLED], true)) {
            throw new \DomainException('Cette commande ne peut plus être annulée.');
        }

        // Remettre les produits en stock
        foreach ($order->getItems() as $item) {
            $item->getProduct()->increaseStock($item->getQuantity());
        }

        $order->setStatus(OrderStatus::CANCELLED);
        $this->em->flush();

        $this->notificationService->notifyOrderStatusChange($order);

        return $order;
    }

    /**
     * Calcule les frais de livraison en fonction du district.
     * Antananarivo : gratuit ; autres districts : 5000 MGA.
     */
    private function calculateShippingFee(?string $district): int
    {
        if (!$district) {
            return 5000;
        }
        return str_contains(strtolower($district), 'antananarivo') ? 0 : 5000;
    }
}
