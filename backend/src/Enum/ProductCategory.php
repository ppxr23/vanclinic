<?php

declare(strict_types=1);

namespace App\Enum;

enum ProductCategory: string
{
    case EYEGLASSES = 'eyeglasses';
    case SUNGLASSES = 'sunglasses';
    case LENSES = 'lenses';
    case CONTACT_LENSES = 'contact_lenses';
    case ACCESSORIES = 'accessories';

    public function getLabel(): string
    {
        return match ($this) {
            self::EYEGLASSES => 'Lunettes de vue',
            self::SUNGLASSES => 'Lunettes de soleil',
            self::LENSES => 'Verres correcteurs',
            self::CONTACT_LENSES => 'Lentilles de contact',
            self::ACCESSORIES => 'Accessoires',
        };
    }
}
