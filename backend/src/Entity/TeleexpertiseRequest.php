<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\TeleexpertiseRequestRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TeleexpertiseRequestRepository::class)]
#[ORM\Table(name: 'teleexpertise_requests')]
#[ORM\HasLifecycleCallbacks]
class TeleexpertiseRequest
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_REVIEW = 'in_review';
    public const STATUS_RESPONDED = 'responded';
    public const STATUS_CLOSED = 'closed';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: MedicalRecord::class, inversedBy: 'teleexpertiseRequests')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MedicalRecord $medicalRecord = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $requestedBy = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $assignedTo = null;

    #[ORM\Column(type: 'text')]
    private ?string $question = null;

    #[ORM\Column(type: 'string', length: 20)]
    private string $urgency = 'normal'; // low | normal | high | urgent

    #[ORM\Column(type: 'string', length: 20)]
    private string $status = self::STATUS_PENDING;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $response = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $respondedAt = null;

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
    public function getMedicalRecord(): ?MedicalRecord { return $this->medicalRecord; }
    public function setMedicalRecord(MedicalRecord $r): self { $this->medicalRecord = $r; return $this; }

    public function getRequestedBy(): ?User { return $this->requestedBy; }
    public function setRequestedBy(User $u): self { $this->requestedBy = $u; return $this; }

    public function getAssignedTo(): ?User { return $this->assignedTo; }
    public function setAssignedTo(?User $u): self { $this->assignedTo = $u; return $this; }

    public function getQuestion(): ?string { return $this->question; }
    public function setQuestion(string $q): self { $this->question = $q; return $this; }

    public function getUrgency(): string { return $this->urgency; }
    public function setUrgency(string $u): self { $this->urgency = $u; return $this; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $s): self { $this->status = $s; return $this; }

    public function getResponse(): ?string { return $this->response; }
    public function setResponse(?string $r): self { $this->response = $r; return $this; }

    public function getRespondedAt(): ?\DateTimeInterface { return $this->respondedAt; }
    public function setRespondedAt(?\DateTimeInterface $d): self { $this->respondedAt = $d; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}
