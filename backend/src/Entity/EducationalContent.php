<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\EducationalContentRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EducationalContentRepository::class)]
#[ORM\Table(name: 'educational_contents')]
#[ORM\HasLifecycleCallbacks]
class EducationalContent
{
    public const TYPE_ARTICLE = 'article';
    public const TYPE_VIDEO = 'video';
    public const TYPE_INFOGRAPHIC = 'infographic';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $slug = null;

    #[ORM\Column(type: 'string', length: 30)]
    private string $contentType = self::TYPE_ARTICLE;

    #[ORM\Column(type: 'string', length: 10)]
    private string $language = 'fr'; // fr | mg

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $excerpt = null;

    #[ORM\Column(type: 'text')]
    private ?string $body = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $coverImage = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $mediaUrl = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $author = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isPublished = false;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $publishedAt = null;

    #[ORM\Column(type: 'integer')]
    private int $viewCount = 0;

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

    public function getTitle(): ?string { return $this->title; }
    public function setTitle(string $t): self { $this->title = $t; return $this; }

    public function getSlug(): ?string { return $this->slug; }
    public function setSlug(string $s): self { $this->slug = $s; return $this; }

    public function getContentType(): string { return $this->contentType; }
    public function setContentType(string $t): self { $this->contentType = $t; return $this; }

    public function getLanguage(): string { return $this->language; }
    public function setLanguage(string $l): self { $this->language = $l; return $this; }

    public function getExcerpt(): ?string { return $this->excerpt; }
    public function setExcerpt(?string $e): self { $this->excerpt = $e; return $this; }

    public function getBody(): ?string { return $this->body; }
    public function setBody(string $b): self { $this->body = $b; return $this; }

    public function getCoverImage(): ?string { return $this->coverImage; }
    public function setCoverImage(?string $i): self { $this->coverImage = $i; return $this; }

    public function getMediaUrl(): ?string { return $this->mediaUrl; }
    public function setMediaUrl(?string $u): self { $this->mediaUrl = $u; return $this; }

    public function getAuthor(): ?User { return $this->author; }
    public function setAuthor(User $a): self { $this->author = $a; return $this; }

    public function isPublished(): bool { return $this->isPublished; }
    public function setIsPublished(bool $p): self
    {
        $this->isPublished = $p;
        if ($p && $this->publishedAt === null) {
            $this->publishedAt = new \DateTime();
        }
        return $this;
    }

    public function getPublishedAt(): ?\DateTimeInterface { return $this->publishedAt; }
    public function setPublishedAt(?\DateTimeInterface $d): self { $this->publishedAt = $d; return $this; }

    public function getViewCount(): int { return $this->viewCount; }
    public function incrementViewCount(): self { $this->viewCount++; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}
