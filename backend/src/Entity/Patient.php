<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\PatientRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PatientRepository::class)]
#[ORM\Table(name: 'patients')]
class Patient
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: User::class, cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: false, unique: true)]
    private ?User $user = null;

    #[ORM\Column(type: 'string', length: 50, unique: true)]
    private ?string $patientNumber = null; // ex: VC-2025-000123

    #[ORM\Column(type: 'string', length: 10, nullable: true)]
    private ?string $gender = null; // M | F | O

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $occupation = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $medicalHistory = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $allergies = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $currentMedications = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $emergencyContactName = null;

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $emergencyContactPhone = null;

    /** @var Collection<int, Appointment> */
    #[ORM\OneToMany(mappedBy: 'patient', targetEntity: Appointment::class)]
    private Collection $appointments;

    /** @var Collection<int, MedicalRecord> */
    #[ORM\OneToMany(mappedBy: 'patient', targetEntity: MedicalRecord::class)]
    private Collection $medicalRecords;

    /** @var Collection<int, Order> */
    #[ORM\OneToMany(mappedBy: 'patient', targetEntity: Order::class)]
    private Collection $orders;

    public function __construct()
    {
        $this->appointments = new ArrayCollection();
        $this->medicalRecords = new ArrayCollection();
        $this->orders = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(User $user): self { $this->user = $user; return $this; }

    public function getPatientNumber(): ?string { return $this->patientNumber; }
    public function setPatientNumber(string $n): self { $this->patientNumber = $n; return $this; }

    public function getGender(): ?string { return $this->gender; }
    public function setGender(?string $g): self { $this->gender = $g; return $this; }

    public function getOccupation(): ?string { return $this->occupation; }
    public function setOccupation(?string $o): self { $this->occupation = $o; return $this; }

    public function getMedicalHistory(): ?string { return $this->medicalHistory; }
    public function setMedicalHistory(?string $m): self { $this->medicalHistory = $m; return $this; }

    public function getAllergies(): ?string { return $this->allergies; }
    public function setAllergies(?string $a): self { $this->allergies = $a; return $this; }

    public function getCurrentMedications(): ?string { return $this->currentMedications; }
    public function setCurrentMedications(?string $m): self { $this->currentMedications = $m; return $this; }

    public function getEmergencyContactName(): ?string { return $this->emergencyContactName; }
    public function setEmergencyContactName(?string $n): self { $this->emergencyContactName = $n; return $this; }

    public function getEmergencyContactPhone(): ?string { return $this->emergencyContactPhone; }
    public function setEmergencyContactPhone(?string $p): self { $this->emergencyContactPhone = $p; return $this; }

    public function getAppointments(): Collection { return $this->appointments; }
    public function getMedicalRecords(): Collection { return $this->medicalRecords; }
    public function getOrders(): Collection { return $this->orders; }
}
