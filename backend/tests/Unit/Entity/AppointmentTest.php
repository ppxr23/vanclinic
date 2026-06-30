<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Appointment;
use App\Enum\AppointmentStatus;
use App\Enum\AppointmentType;
use PHPUnit\Framework\TestCase;

class AppointmentTest extends TestCase
{
    public function testDefaultStatusIsScheduled(): void
    {
        $appointment = new Appointment();
        $this->assertSame(AppointmentStatus::SCHEDULED, $appointment->getStatus());
    }

    public function testDefaultTypeIsOnSite(): void
    {
        $appointment = new Appointment();
        $this->assertSame(AppointmentType::ON_SITE, $appointment->getType());
    }

    public function testGetEndsAtAddsDuration(): void
    {
        $appointment = new Appointment();
        $appointment->setScheduledAt(new \DateTime('2026-05-20 10:00:00'))
            ->setDurationMinutes(45);

        $expected = new \DateTime('2026-05-20 10:45:00');
        $this->assertSame(
            $expected->format('Y-m-d H:i:s'),
            $appointment->getEndsAt()->format('Y-m-d H:i:s')
        );
    }
}
