<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\NotificationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificationRepository::class)]
#[ORM\Table(name: 'notifications')]
#[ORM\Index(columns: ['user_id', 'is_read'], name: 'idx_notification_user_read')]
class Notification
{
    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_SMS = 'sms';
    public const CHANNEL_IN_APP = 'in_app';
    public const CHANNEL_PUSH = 'push';

    public const TYPE_APPOINTMENT_REMINDER = 'appointment_reminder';
    public const TYPE_APPOINTMENT_CONFIRMED = 'appointment_confirmed';
    public const TYPE_APPOINTMENT_CANCELLED = 'appointment_cancelled';
    public const TYPE_ORDER_CONFIRMED = 'order_confirmed';
    public const TYPE_ORDER_SHIPPED = 'order_shipped';
    public const TYPE_ORDER_DELIVERED = 'order_delivered';
    public const TYPE_PAYMENT_SUCCESS = 'payment_success';
    public const TYPE_PAYMENT_FAILED = 'payment_failed';
    public const TYPE_TELEEXPERTISE_RESPONSE = 'teleexpertise_response';
    public const TYPE_SECURITY_ALERT = 'security_alert';
    public const TYPE_EDUCATIONAL = 'educational';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'notifications')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: 'string', length: 50)]
    private string $type = self::TYPE_EDUCATIONAL;

    #[ORM\Column(type: 'string', length: 20)]
    private string $channel = self::CHANNEL_IN_APP;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: 'text')]
    private ?string $message = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $data = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isRead = false;

    #[ORM\Column(type: 'boolean')]
    private bool $isSent = false;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $sentAt = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $readAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(User $u): self { $this->user = $u; return $this; }

    public function getType(): string { return $this->type; }
    public function setType(string $t): self { $this->type = $t; return $this; }

    public function getChannel(): string { return $this->channel; }
    public function setChannel(string $c): self { $this->channel = $c; return $this; }

    public function getTitle(): ?string { return $this->title; }
    public function setTitle(string $t): self { $this->title = $t; return $this; }

    public function getMessage(): ?string { return $this->message; }
    public function setMessage(string $m): self { $this->message = $m; return $this; }

    public function getData(): ?array { return $this->data; }
    public function setData(?array $d): self { $this->data = $d; return $this; }

    public function isRead(): bool { return $this->isRead; }
    public function markAsRead(): self
    {
        $this->isRead = true;
        $this->readAt = new \DateTime();
        return $this;
    }

    public function isSent(): bool { return $this->isSent; }
    public function markAsSent(): self
    {
        $this->isSent = true;
        $this->sentAt = new \DateTime();
        return $this;
    }

    public function getSentAt(): ?\DateTimeInterface { return $this->sentAt; }
    public function getReadAt(): ?\DateTimeInterface { return $this->readAt; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
