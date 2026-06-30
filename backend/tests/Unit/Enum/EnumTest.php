<?php

declare(strict_types=1);

namespace App\Tests\Unit\Enum;

use App\Enum\AppointmentStatus;
use App\Enum\PaymentMethod;
use App\Enum\UserRole;
use PHPUnit\Framework\TestCase;

class EnumTest extends TestCase
{
    public function testUserRoleValuesArePrefixedWithRole(): void
    {
        foreach (UserRole::cases() as $role) {
            $this->assertStringStartsWith('ROLE_', $role->value);
        }
    }

    public function testUserRoleHasLabel(): void
    {
        $this->assertSame('Patient', UserRole::PATIENT->getLabel());
        $this->assertSame('Ophtalmologue', UserRole::OPHTALMOLOGUE->getLabel());
    }

    public function testUserRoleChoicesReturnsLabelToValueMap(): void
    {
        $choices = UserRole::choices();
        $this->assertArrayHasKey('Patient', $choices);
        $this->assertSame('ROLE_PATIENT', $choices['Patient']);
    }

    public function testAppointmentStatusLabels(): void
    {
        $this->assertSame('Planifié', AppointmentStatus::SCHEDULED->getLabel());
        $this->assertSame('Annulé', AppointmentStatus::CANCELLED->getLabel());
    }

    public function testPaymentMethodLabels(): void
    {
        $this->assertSame('Orange Money', PaymentMethod::ORANGE_MONEY->getLabel());
        $this->assertSame('Telma Mvola', PaymentMethod::MVOLA->getLabel());
        $this->assertSame('Espèces (agent relais)', PaymentMethod::CASH->getLabel());
    }
}
