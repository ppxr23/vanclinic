<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\ProductCategory;
use App\Repository\ProductRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\Table(name: 'products')]
#[ORM\HasLifecycleCallbacks]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 100, unique: true)]
    #[Assert\NotBlank]
    private ?string $sku = null; // Référence produit unique

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank]
    private ?string $name = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 30, enumType: ProductCategory::class)]
    private ProductCategory $category = ProductCategory::EYEGLASSES;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $brand = null;

    /** Prix en Ariary (MGA), sans décimales */
    #[ORM\Column(type: 'integer')]
    #[Assert\PositiveOrZero]
    private int $priceMga = 0;

    #[ORM\Column(type: 'integer')]
    #[Assert\PositiveOrZero]
    private int $stockQuantity = 0;

    #[ORM\Column(type: 'integer')]
    private int $stockAlertThreshold = 5;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $images = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $specifications = null; // ex: {couleur: "noir", matière: "métal", taille: "M"}

    #[ORM\Column(type: 'boolean')]
    private bool $isActive = true;

    /** @var Collection<int, OrderItem> */
    #[ORM\OneToMany(mappedBy: 'product', targetEntity: OrderItem::class)]
    private Collection $orderItems;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->orderItems = new ArrayCollection();
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getSku(): ?string { return $this->sku; }
    public function setSku(string $s): self { $this->sku = $s; return $this; }

    public function getName(): ?string { return $this->name; }
    public function setName(string $n): self { $this->name = $n; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }

    public function getCategory(): ProductCategory { return $this->category; }
    public function setCategory(ProductCategory $c): self { $this->category = $c; return $this; }

    public function getBrand(): ?string { return $this->brand; }
    public function setBrand(?string $b): self { $this->brand = $b; return $this; }

    public function getPriceMga(): int { return $this->priceMga; }
    public function setPriceMga(int $p): self { $this->priceMga = $p; return $this; }

    public function getStockQuantity(): int { return $this->stockQuantity; }
    public function setStockQuantity(int $q): self { $this->stockQuantity = $q; return $this; }

    public function decreaseStock(int $qty): self
    {
        $this->stockQuantity = max(0, $this->stockQuantity - $qty);
        return $this;
    }

    public function increaseStock(int $qty): self
    {
        $this->stockQuantity += $qty;
        return $this;
    }

    public function getStockAlertThreshold(): int { return $this->stockAlertThreshold; }
    public function setStockAlertThreshold(int $t): self { $this->stockAlertThreshold = $t; return $this; }

    public function isStockLow(): bool
    {
        return $this->stockQuantity <= $this->stockAlertThreshold;
    }

    public function getImages(): ?array { return $this->images; }
    public function setImages(?array $i): self { $this->images = $i; return $this; }

    public function getSpecifications(): ?array { return $this->specifications; }
    public function setSpecifications(?array $s): self { $this->specifications = $s; return $this; }

    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $a): self { $this->isActive = $a; return $this; }

    public function getOrderItems(): Collection { return $this->orderItems; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}
