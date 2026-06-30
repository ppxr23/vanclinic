<?php

declare(strict_types=1);

namespace App\Enum;

enum PaymentMethod: string
{
    case ORANGE_MONEY = 'orange_money';
    case AIRTEL_MONEY = 'airtel_money';
    case MVOLA = 'mvola';
    case VISA = 'visa';
    case CASH = 'cash';

    public function getLabel(): string
    {
        return match ($this) {
            self::ORANGE_MONEY => 'Orange Money',
            self::AIRTEL_MONEY => 'Airtel Money',
            self::MVOLA => 'Telma Mvola',
            self::VISA => 'Carte Visa',
            self::CASH => 'Espèces (agent relais)',
        };
    }
}
