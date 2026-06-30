<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\OrderItemRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: OrderItemRepository::class)]
#[ORM\Table(name: 'order_items')]
class OrderItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Order::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Order $order = null;

    #[ORM\ManyToOne(targetEntity: Product::class, inversedBy: 'orderItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Product $product = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $productNameSnapshot = null;

    #[ORM\Column(type: 'integer')]
    #[Assert\Positive]
    private int $quantity = 1;

    /** Prix unitaire au moment de la commande (snapshot) */
    #[ORM\Column(type: 'integer')]
    #[Assert\PositiveOrZero]
    private int $unitPriceMga = 0;

    public function getId(): ?int { return $this->id; }

    public function getOrder(): ?Order { return $this->order; }
    public function setOrder(Order $o): self { $this->order = $o; return $this; }

    public function getProduct(): ?Product { return $this->product; }
    public function setProduct(Product $p): self
    {
        $this->product = $p;
        $this->productNameSnapshot = $p->getName();
        $this->unitPriceMga = $p->getPriceMga();
        return $this;
    }

    public function getProductNameSnapshot(): ?string { return $this->productNameSnapshot; }
    public function setProductNameSnapshot(string $n): self { $this->productNameSnapshot = $n; return $this; }

    public function getQuantity(): int { return $this->quantity; }
    public function setQuantity(int $q): self { $this->quantity = $q; return $this; }

    public function getUnitPriceMga(): int { return $this->unitPriceMga; }
    public function setUnitPriceMga(int $p): self { $this->unitPriceMga = $p; return $this; }

    public function getLineTotalMga(): int
    {
        return $this->unitPriceMga * $this->quantity;
    }
}
