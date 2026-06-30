<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\LoginHistoryRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LoginHistoryRepository::class)]
#[ORM\Table(name: 'login_history')]
#[ORM\Index(columns: ['user_id'], name: 'idx_login_user')]
#[ORM\Index(columns: ['logged_at'], name: 'idx_login_date')]
class LoginHistory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'loginHistory')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: 'string', length: 45)]
    private ?string $ipAddress = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $userAgent = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $deviceType = null;

    #[ORM\Column(type: 'boolean')]
    private bool $success = true;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $loggedAt;

    public function __construct()
    {
        $this->loggedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(User $u): self { $this->user = $u; return $this; }

    public function getIpAddress(): ?string { return $this->ipAddress; }
    public function setIpAddress(string $ip): self { $this->ipAddress = $ip; return $this; }

    public function getUserAgent(): ?string { return $this->userAgent; }
    public function setUserAgent(?string $u): self { $this->userAgent = $u; return $this; }

    public function getDeviceType(): ?string { return $this->deviceType; }
    public function setDeviceType(?string $d): self { $this->deviceType = $d; return $this; }

    public function isSuccess(): bool { return $this->success; }
    public function setSuccess(bool $s): self { $this->success = $s; return $this; }

    public function getLoggedAt(): \DateTimeImmutable { return $this->loggedAt; }
}
