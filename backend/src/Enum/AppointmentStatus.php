<?php

declare(strict_types=1);

namespace App\Enum;

enum AppointmentStatus: string
{
    case SCHEDULED = 'scheduled';      // Planifié
    case CONFIRMED = 'confirmed';      // Confirmé
    case IN_PROGRESS = 'in_progress';  // En cours
    case COMPLETED = 'completed';      // Terminé
    case CANCELLED = 'cancelled';      // Annulé
    case NO_SHOW = 'no_show';          // Patient absent

    public function getLabel(): string
    {
        return match ($this) {
            self::SCHEDULED => 'Planifié',
            self::CONFIRMED => 'Confirmé',
            self::IN_PROGRESS => 'En cours',
            self::COMPLETED => 'Terminé',
            self::CANCELLED => 'Annulé',
            self::NO_SHOW => 'Patient absent',
        };
    }
}
