<?php

declare(strict_types=1);

namespace App\Enum;

enum AppointmentType: string
{
    case ON_SITE = 'on_site';
    case TELEEXPERTISE = 'teleexpertise';
    case FOLLOW_UP = 'follow_up';
    case SCREENING = 'screening';

    public function getLabel(): string
    {
        return match ($this) {
            self::ON_SITE => 'Sur place (Van mobile)',
            self::TELEEXPERTISE => 'Téléexpertise',
            self::FOLLOW_UP => 'Suivi',
            self::SCREENING => 'Dépistage',
        };
    }
}
