<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\PaymentMethod;
use App\Enum\PaymentStatus;
use App\Repository\PaymentRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PaymentRepository::class)]
#[ORM\Table(name: 'payments')]
#[ORM\HasLifecycleCallbacks]
#[ORM\Index(columns: ['status'], name: 'idx_payment_status')]
#[ORM\Index(columns: ['external_transaction_id'], name: 'idx_payment_ext_id')]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 50, unique: true)]
    private ?string $reference = null; // ex: VC-PAY-2025-000123

    #[ORM\ManyToOne(targetEntity: Order::class, inversedBy: 'payments')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Order $order = null;

    #[ORM\ManyToOne(targetEntity: Appointment::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?Appointment $appointment = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $payer = null;

    #[ORM\Column(type: 'integer')]
    private int $amountMga = 0;

    #[ORM\Column(type: 'string', length: 30, enumType: PaymentMethod::class)]
    private PaymentMethod $method = PaymentMethod::ORANGE_MONEY;

    #[ORM\Column(type: 'string', length: 30, enumType: PaymentStatus::class)]
    private PaymentStatus $status = PaymentStatus::PENDING;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $externalTransactionId = null;

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $payerPhone = null; // Numéro Mobile Money

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $providerResponse = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $completedAt = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $failureReason = null;

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

    public function getReference(): ?string { return $this->reference; }
    public function setReference(string $r): self { $this->reference = $r; return $this; }

    public function getOrder(): ?Order { return $this->order; }
    public function setOrder(?Order $o): self { $this->order = $o; return $this; }

    public function getAppointment(): ?Appointment { return $this->appointment; }
    public function setAppointment(?Appointment $a): self { $this->appointment = $a; return $this; }

    public function getPayer(): ?User { return $this->payer; }
    public function setPayer(User $u): self { $this->payer = $u; return $this; }

    public function getAmountMga(): int { return $this->amountMga; }
    public function setAmountMga(int $a): self { $this->amountMga = $a; return $this; }

    public function getMethod(): PaymentMethod { return $this->method; }
    public function setMethod(PaymentMethod $m): self { $this->method = $m; return $this; }

    public function getStatus(): PaymentStatus { return $this->status; }
    public function setStatus(PaymentStatus $s): self { $this->status = $s; return $this; }

    public function getExternalTransactionId(): ?string { return $this->externalTransactionId; }
    public function setExternalTransactionId(?string $id): self { $this->externalTransactionId = $id; return $this; }

    public function getPayerPhone(): ?string { return $this->payerPhone; }
    public function setPayerPhone(?string $p): self { $this->payerPhone = $p; return $this; }

    public function getProviderResponse(): ?array { return $this->providerResponse; }
    public function setProviderResponse(?array $r): self { $this->providerResponse = $r; return $this; }

    public function getCompletedAt(): ?\DateTimeInterface { return $this->completedAt; }
    public function setCompletedAt(?\DateTimeInterface $d): self { $this->completedAt = $d; return $this; }

    public function getFailureReason(): ?string { return $this->failureReason; }
    public function setFailureReason(?string $r): self { $this->failureReason = $r; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}
