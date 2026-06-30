<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\OrderStatus;
use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: 'orders')]
#[ORM\HasLifecycleCallbacks]
class Order
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 50, unique: true)]
    private ?string $orderNumber = null; // ex: VC-ORD-2025-000123

    #[ORM\ManyToOne(targetEntity: Patient::class, inversedBy: 'orders')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Patient $patient = null;

    #[ORM\ManyToOne(targetEntity: MedicalRecord::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?MedicalRecord $relatedMedicalRecord = null;

    #[ORM\Column(type: 'string', length: 30, enumType: OrderStatus::class)]
    private OrderStatus $status = OrderStatus::PENDING;

    /** @var Collection<int, OrderItem> */
    #[ORM\OneToMany(mappedBy: 'order', targetEntity: OrderItem::class, cascade: ['persist', 'remove'])]
    private Collection $items;

    /** @var Collection<int, Payment> */
    #[ORM\OneToMany(mappedBy: 'order', targetEntity: Payment::class)]
    private Collection $payments;

    #[ORM\Column(type: 'integer')]
    private int $subtotalMga = 0;

    #[ORM\Column(type: 'integer')]
    private int $shippingFeeMga = 0;

    #[ORM\Column(type: 'integer')]
    private int $totalMga = 0;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $deliveryAddress = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $deliveryDistrict = null;

    #[ORM\Column(type: 'string', length: 20)]
    private ?string $deliveryPhone = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $deliveryNotes = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $shippedAt = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $deliveredAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->items = new ArrayCollection();
        $this->payments = new ArrayCollection();
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function recalculateTotals(): void
    {
        $subtotal = 0;
        foreach ($this->items as $item) {
            $subtotal += $item->getUnitPriceMga() * $item->getQuantity();
        }
        $this->subtotalMga = $subtotal;
        $this->totalMga = $subtotal + $this->shippingFeeMga;
    }

    public function getId(): ?int { return $this->id; }

    public function getOrderNumber(): ?string { return $this->orderNumber; }
    public function setOrderNumber(string $n): self { $this->orderNumber = $n; return $this; }

    public function getPatient(): ?Patient { return $this->patient; }
    public function setPatient(Patient $p): self { $this->patient = $p; return $this; }

    public function getRelatedMedicalRecord(): ?MedicalRecord { return $this->relatedMedicalRecord; }
    public function setRelatedMedicalRecord(?MedicalRecord $r): self { $this->relatedMedicalRecord = $r; return $this; }

    public function getStatus(): OrderStatus { return $this->status; }
    public function setStatus(OrderStatus $s): self { $this->status = $s; return $this; }

    public function getItems(): Collection { return $this->items; }

    public function addItem(OrderItem $item): self
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setOrder($this);
        }
        return $this;
    }

    public function removeItem(OrderItem $item): self
    {
        $this->items->removeElement($item);
        return $this;
    }

    public function getPayments(): Collection { return $this->payments; }

    public function getSubtotalMga(): int { return $this->subtotalMga; }
    public function setSubtotalMga(int $s): self { $this->subtotalMga = $s; return $this; }

    public function getShippingFeeMga(): int { return $this->shippingFeeMga; }
    public function setShippingFeeMga(int $f): self { $this->shippingFeeMga = $f; return $this; }

    public function getTotalMga(): int { return $this->totalMga; }
    public function setTotalMga(int $t): self { $this->totalMga = $t; return $this; }

    public function getDeliveryAddress(): ?string { return $this->deliveryAddress; }
    public function setDeliveryAddress(string $a): self { $this->deliveryAddress = $a; return $this; }

    public function getDeliveryDistrict(): ?string { return $this->deliveryDistrict; }
    public function setDeliveryDistrict(?string $d): self { $this->deliveryDistrict = $d; return $this; }

    public function getDeliveryPhone(): ?string { return $this->deliveryPhone; }
    public function setDeliveryPhone(string $p): self { $this->deliveryPhone = $p; return $this; }

    public function getDeliveryNotes(): ?string { return $this->deliveryNotes; }
    public function setDeliveryNotes(?string $n): self { $this->deliveryNotes = $n; return $this; }

    public function getShippedAt(): ?\DateTimeInterface { return $this->shippedAt; }
    public function setShippedAt(?\DateTimeInterface $d): self { $this->shippedAt = $d; return $this; }

    public function getDeliveredAt(): ?\DateTimeInterface { return $this->deliveredAt; }
    public function setDeliveredAt(?\DateTimeInterface $d): self { $this->deliveredAt = $d; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}
