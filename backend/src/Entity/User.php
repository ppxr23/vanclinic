<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\UserRole;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity(fields: ['email'], message: 'Un compte utilisant cet email existe déjà.')]
#[UniqueEntity(fields: ['phone'], message: 'Un compte utilisant ce numéro de téléphone existe déjà.')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 180, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    private ?string $email = null;

    #[ORM\Column(type: 'string', length: 20, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Regex(
        pattern: '/^\+?[0-9\s\-]{8,20}$/',
        message: 'Numéro de téléphone invalide.'
    )]
    private ?string $phone = null;

    #[ORM\Column(type: 'string')]
    private string $password = '';

    #[ORM\Column(type: 'string', length: 100)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 100)]
    private ?string $firstName = null;

    #[ORM\Column(type: 'string', length: 100)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 100)]
    private ?string $lastName = null;

    /**
     * @var list<string> Les rôles de l'utilisateur (UserRole::value)
     */
    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $birthDate = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $address = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $city = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $district = null;

    #[ORM\Column(type: 'string', length: 10)]
    private string $preferredLanguage = 'fr'; // fr | mg

    #[ORM\Column(type: 'boolean')]
    private bool $emailVerified = false;

    #[ORM\Column(type: 'boolean')]
    private bool $phoneVerified = false;

    #[ORM\Column(type: 'boolean')]
    private bool $twoFactorEnabled = false;

    #[ORM\Column(type: 'boolean')]
    private bool $isActive = true;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $lastLoginAt = null;

    #[ORM\Column(type: 'string', length: 64, nullable: true, unique: true)]
    private ?string $passwordResetToken = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $passwordResetTokenExpiresAt = null;

    /** @var Collection<int, LoginHistory> */
    #[ORM\OneToMany(mappedBy: 'user', targetEntity: LoginHistory::class, cascade: ['remove'])]
    private Collection $loginHistory;

    /** @var Collection<int, Notification> */
    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Notification::class, cascade: ['remove'])]
    private Collection $notifications;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->loginHistory = new ArrayCollection();
        $this->notifications = new ArrayCollection();
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getEmail(): ?string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }

    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(string $phone): self { $this->phone = $phone; return $this; }

    public function getUserIdentifier(): string { return (string) $this->email; }

    public function getPassword(): string { return $this->password; }
    public function setPassword(string $password): self { $this->password = $password; return $this; }

    public function getFirstName(): ?string { return $this->firstName; }
    public function setFirstName(string $firstName): self { $this->firstName = $firstName; return $this; }

    public function getLastName(): ?string { return $this->lastName; }
    public function setLastName(string $lastName): self { $this->lastName = $lastName; return $this; }

    public function getFullName(): string
    {
        return trim(($this->firstName ?? '') . ' ' . ($this->lastName ?? ''));
    }

    /**
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // Garantit que chaque utilisateur a au moins ROLE_USER
        $roles[] = 'ROLE_USER';
        return array_values(array_unique($roles));
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function addRole(UserRole $role): self
    {
        if (!in_array($role->value, $this->roles, true)) {
            $this->roles[] = $role->value;
        }
        return $this;
    }

    public function hasRole(UserRole $role): bool
    {
        return in_array($role->value, $this->getRoles(), true);
    }

    public function getBirthDate(): ?\DateTimeInterface { return $this->birthDate; }
    public function setBirthDate(?\DateTimeInterface $birthDate): self { $this->birthDate = $birthDate; return $this; }

    public function getAddress(): ?string { return $this->address; }
    public function setAddress(?string $address): self { $this->address = $address; return $this; }

    public function getCity(): ?string { return $this->city; }
    public function setCity(?string $city): self { $this->city = $city; return $this; }

    public function getDistrict(): ?string { return $this->district; }
    public function setDistrict(?string $district): self { $this->district = $district; return $this; }

    public function getPreferredLanguage(): string { return $this->preferredLanguage; }
    public function setPreferredLanguage(string $lang): self { $this->preferredLanguage = $lang; return $this; }

    public function isEmailVerified(): bool { return $this->emailVerified; }
    public function setEmailVerified(bool $v): self { $this->emailVerified = $v; return $this; }

    public function isPhoneVerified(): bool { return $this->phoneVerified; }
    public function setPhoneVerified(bool $v): self { $this->phoneVerified = $v; return $this; }

    public function isTwoFactorEnabled(): bool { return $this->twoFactorEnabled; }
    public function setTwoFactorEnabled(bool $v): self { $this->twoFactorEnabled = $v; return $this; }

    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $v): self { $this->isActive = $v; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }

    public function getLastLoginAt(): ?\DateTimeInterface { return $this->lastLoginAt; }
    public function setLastLoginAt(?\DateTimeInterface $d): self { $this->lastLoginAt = $d; return $this; }

    public function getPasswordResetToken(): ?string { return $this->passwordResetToken; }
    public function setPasswordResetToken(?string $token): self { $this->passwordResetToken = $token; return $this; }

    public function getPasswordResetTokenExpiresAt(): ?\DateTimeInterface { return $this->passwordResetTokenExpiresAt; }
    public function setPasswordResetTokenExpiresAt(?\DateTimeInterface $d): self { $this->passwordResetTokenExpiresAt = $d; return $this; }

    public function getLoginHistory(): Collection { return $this->loginHistory; }
    public function getNotifications(): Collection { return $this->notifications; }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // Si on stocke des données sensibles temporaires sur l'utilisateur, les effacer ici
    }
}
