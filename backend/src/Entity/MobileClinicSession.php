<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\MobileClinicSessionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Session de la clinique mobile (van) sur un site donné.
 * Permet de planifier les déplacements du van dans les districts pilotes.
 */
#[ORM\Entity(repositoryClass: MobileClinicSessionRepository::class)]
#[ORM\Table(name: 'mobile_clinic_sessions')]
class MobileClinicSession
{
    public const STATUS_PLANNED = 'planned';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $locationName = null;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $district = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $commune = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 7, nullable: true)]
    private ?string $latitude = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 7, nullable: true)]
    private ?string $longitude = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $startDate = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $endDate = null;

    #[ORM\Column(type: 'string', length: 20)]
    private string $status = self::STATUS_PLANNED;

    #[ORM\Column(type: 'integer')]
    private int $maxAppointments = 50;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $leadOphthalmologist = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notes = null;

    /** @var Collection<int, Appointment> */
    #[ORM\OneToMany(mappedBy: 'clinicSession', targetEntity: Appointment::class)]
    private Collection $appointments;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->appointments = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getLocationName(): ?string { return $this->locationName; }
    public function setLocationName(string $n): self { $this->locationName = $n; return $this; }

    public function getDistrict(): ?string { return $this->district; }
    public function setDistrict(string $d): self { $this->district = $d; return $this; }

    public function getCommune(): ?string { return $this->commune; }
    public function setCommune(?string $c): self { $this->commune = $c; return $this; }

    public function getLatitude(): ?string { return $this->latitude; }
    public function setLatitude(?string $l): self { $this->latitude = $l; return $this; }

    public function getLongitude(): ?string { return $this->longitude; }
    public function setLongitude(?string $l): self { $this->longitude = $l; return $this; }

    public function getStartDate(): ?\DateTimeInterface { return $this->startDate; }
    public function setStartDate(\DateTimeInterface $d): self { $this->startDate = $d; return $this; }

    public function getEndDate(): ?\DateTimeInterface { return $this->endDate; }
    public function setEndDate(\DateTimeInterface $d): self { $this->endDate = $d; return $this; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $s): self { $this->status = $s; return $this; }

    public function getMaxAppointments(): int { return $this->maxAppointments; }
    public function setMaxAppointments(int $m): self { $this->maxAppointments = $m; return $this; }

    public function getLeadOphthalmologist(): ?User { return $this->leadOphthalmologist; }
    public function setLeadOphthalmologist(?User $u): self { $this->leadOphthalmologist = $u; return $this; }

    public function getNotes(): ?string { return $this->notes; }
    public function setNotes(?string $n): self { $this->notes = $n; return $this; }

    public function getAppointments(): Collection { return $this->appointments; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function getAvailableSlots(): int
    {
        return max(0, $this->maxAppointments - $this->appointments->count());
    }
}
