<?php

declare(strict_types=1);

namespace App\Enum;

enum OrderStatus: string
{
    case PENDING = 'pending';          // En attente
    case PAID = 'paid';                // Payée
    case PREPARING = 'preparing';      // En préparation
    case SHIPPED = 'shipped';          // Expédiée
    case DELIVERED = 'delivered';      // Livrée
    case CANCELLED = 'cancelled';      // Annulée
    case REFUNDED = 'refunded';        // Remboursée

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'En attente',
            self::PAID => 'Payée',
            self::PREPARING => 'En préparation',
            self::SHIPPED => 'Expédiée',
            self::DELIVERED => 'Livrée',
            self::CANCELLED => 'Annulée',
            self::REFUNDED => 'Remboursée',
        };
    }
}
