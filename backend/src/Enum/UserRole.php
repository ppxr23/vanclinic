<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Rôles utilisateurs définis dans le cahier des charges VanClinic.
 *
 * Hiérarchie (du moins privilégié au plus privilégié) :
 * - ROLE_PATIENT       : Patient bénéficiaire des soins
 * - ROLE_AGENT_RELAIS  : Agent communautaire de terrain
 * - ROLE_TECHNICIEN    : Modérateur technique de la plateforme
 * - ROLE_OPHTALMOLOGUE : Médecin spécialiste
 * - ROLE_COORDINATEUR  : Administrateur (analyse + planning)
 */
enum UserRole: string
{
    case PATIENT = 'ROLE_PATIENT';
    case AGENT_RELAIS = 'ROLE_AGENT_RELAIS';
    case TECHNICIEN = 'ROLE_TECHNICIEN';
    case OPHTALMOLOGUE = 'ROLE_OPHTALMOLOGUE';
    case COORDINATEUR = 'ROLE_COORDINATEUR';

    public function getLabel(): string
    {
        return match ($this) {
            self::PATIENT => 'Patient',
            self::AGENT_RELAIS => 'Agent Relais',
            self::TECHNICIEN => 'Technicien',
            self::OPHTALMOLOGUE => 'Ophtalmologue',
            self::COORDINATEUR => 'Coordinateur',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function choices(): array
    {
        $choices = [];
        foreach (self::cases() as $role) {
            $choices[$role->getLabel()] = $role->value;
        }
        return $choices;
    }
}
