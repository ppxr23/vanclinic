<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\FeedbackRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: FeedbackRepository::class)]
#[ORM\Table(name: 'feedbacks')]
class Feedback
{
    public const TARGET_CONSULTATION = 'consultation';
    public const TARGET_PRODUCT = 'product';
    public const TARGET_PLATFORM = 'platform';
    public const TARGET_AGENT = 'agent';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $author = null;

    #[ORM\Column(type: 'string', length: 30)]
    private string $targetType = self::TARGET_PLATFORM;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $targetId = null; // ID de l'élément concerné (consultation, produit, etc.)

    #[ORM\Column(type: 'integer')]
    #[Assert\Range(min: 1, max: 5)]
    private int $rating = 5;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $comment = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isPublic = false;

    #[ORM\Column(type: 'boolean')]
    private bool $isModerated = false;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getAuthor(): ?User { return $this->author; }
    public function setAuthor(User $u): self { $this->author = $u; return $this; }

    public function getTargetType(): string { return $this->targetType; }
    public function setTargetType(string $t): self { $this->targetType = $t; return $this; }

    public function getTargetId(): ?int { return $this->targetId; }
    public function setTargetId(?int $id): self { $this->targetId = $id; return $this; }

    public function getRating(): int { return $this->rating; }
    public function setRating(int $r): self { $this->rating = $r; return $this; }

    public function getComment(): ?string { return $this->comment; }
    public function setComment(?string $c): self { $this->comment = $c; return $this; }

    public function isPublic(): bool { return $this->isPublic; }
    public function setIsPublic(bool $p): self { $this->isPublic = $p; return $this; }

    public function isModerated(): bool { return $this->isModerated; }
    public function setIsModerated(bool $m): self { $this->isModerated = $m; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
