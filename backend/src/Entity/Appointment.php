<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\AppointmentStatus;
use App\Enum\AppointmentType;
use App\Repository\AppointmentRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: AppointmentRepository::class)]
#[ORM\Table(name: 'appointments')]
#[ORM\HasLifecycleCallbacks]
#[ORM\Index(columns: ['scheduled_at'], name: 'idx_appointment_scheduled')]
#[ORM\Index(columns: ['status'], name: 'idx_appointment_status')]
class Appointment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Patient::class, inversedBy: 'appointments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Patient $patient = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $ophthalmologist = null;

    #[ORM\ManyToOne(targetEntity: MobileClinicSession::class, inversedBy: 'appointments')]
    #[ORM\JoinColumn(nullable: true)]
    private ?MobileClinicSession $clinicSession = null;

    #[ORM\Column(type: 'datetime')]
    #[Assert\NotNull]
    private ?\DateTimeInterface $scheduledAt = null;

    #[ORM\Column(type: 'integer')]
    private int $durationMinutes = 30;

    #[ORM\Column(type: 'string', length: 30, enumType: AppointmentType::class)]
    private AppointmentType $type = AppointmentType::ON_SITE;

    #[ORM\Column(type: 'string', length: 30, enumType: AppointmentStatus::class)]
    private AppointmentStatus $status = AppointmentStatus::SCHEDULED;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $reason = null; // Motif de la consultation

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $location = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $confirmedAt = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $cancelledAt = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $cancellationReason = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getPatient(): ?Patient { return $this->patient; }
    public function setPatient(Patient $p): self { $this->patient = $p; return $this; }

    public function getOphthalmologist(): ?User { return $this->ophthalmologist; }
    public function setOphthalmologist(?User $u): self { $this->ophthalmologist = $u; return $this; }

    public function getClinicSession(): ?MobileClinicSession { return $this->clinicSession; }
    public function setClinicSession(?MobileClinicSession $s): self { $this->clinicSession = $s; return $this; }

    public function getScheduledAt(): ?\DateTimeInterface { return $this->scheduledAt; }
    public function setScheduledAt(\DateTimeInterface $d): self { $this->scheduledAt = $d; return $this; }

    public function getDurationMinutes(): int { return $this->durationMinutes; }
    public function setDurationMinutes(int $m): self { $this->durationMinutes = $m; return $this; }

    public function getType(): AppointmentType { return $this->type; }
    public function setType(AppointmentType $t): self { $this->type = $t; return $this; }

    public function getStatus(): AppointmentStatus { return $this->status; }
    public function setStatus(AppointmentStatus $s): self { $this->status = $s; return $this; }

    public function getReason(): ?string { return $this->reason; }
    public function setReason(?string $r): self { $this->reason = $r; return $this; }

    public function getNotes(): ?string { return $this->notes; }
    public function setNotes(?string $n): self { $this->notes = $n; return $this; }

    public function getLocation(): ?string { return $this->location; }
    public function setLocation(?string $l): self { $this->location = $l; return $this; }

    public function getConfirmedAt(): ?\DateTimeInterface { return $this->confirmedAt; }
    public function setConfirmedAt(?\DateTimeInterface $d): self { $this->confirmedAt = $d; return $this; }

    public function getCancelledAt(): ?\DateTimeInterface { return $this->cancelledAt; }
    public function setCancelledAt(?\DateTimeInterface $d): self { $this->cancelledAt = $d; return $this; }

    public function getCancellationReason(): ?string { return $this->cancellationReason; }
    public function setCancellationReason(?string $r): self { $this->cancellationReason = $r; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }

    public function getEndsAt(): \DateTimeInterface
    {
        $end = clone $this->scheduledAt;
        return $end->modify('+' . $this->durationMinutes . ' minutes');
    }
}
