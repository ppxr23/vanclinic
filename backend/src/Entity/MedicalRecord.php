<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\MedicalRecordRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Dossier Médical Électronique (DME).
 *
 * Centralise pour un patient : antécédents, examens, mesures de vision,
 * diagnostics, prescriptions, et téléexpertises.
 */
#[ORM\Entity(repositoryClass: MedicalRecordRepository::class)]
#[ORM\Table(name: 'medical_records')]
#[ORM\HasLifecycleCallbacks]
class MedicalRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Patient::class, inversedBy: 'medicalRecords')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Patient $patient = null;

    #[ORM\ManyToOne(targetEntity: Appointment::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?Appointment $appointment = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $createdBy = null;

    #[ORM\Column(type: 'date')]
    private ?\DateTimeInterface $consultationDate = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $chiefComplaint = null; // Motif de consultation

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $observations = null;

    // Examens visuels - Œil droit (OD)
    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $rightEyeVisionUncorrected = null; // ex: 5/10

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $rightEyeVisionCorrected = null;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    private ?string $rightEyeSphere = null;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    private ?string $rightEyeCylinder = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $rightEyeAxis = null;

    // Examens visuels - Œil gauche (OG)
    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $leftEyeVisionUncorrected = null;

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $leftEyeVisionCorrected = null;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    private ?string $leftEyeSphere = null;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    private ?string $leftEyeCylinder = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $leftEyeAxis = null;

    #[ORM\Column(type: 'decimal', precision: 4, scale: 2, nullable: true)]
    private ?string $pupillaryDistance = null; // Écart pupillaire (mm)

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $diagnosis = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $treatment = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $prescription = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $recommendations = null;

    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $nextVisitDate = null;

    /** @var Collection<int, MedicalAttachment> */
    #[ORM\OneToMany(mappedBy: 'medicalRecord', targetEntity: MedicalAttachment::class, cascade: ['persist', 'remove'])]
    private Collection $attachments;

    /** @var Collection<int, TeleexpertiseRequest> */
    #[ORM\OneToMany(mappedBy: 'medicalRecord', targetEntity: TeleexpertiseRequest::class)]
    private Collection $teleexpertiseRequests;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->consultationDate = new \DateTime();
        $this->attachments = new ArrayCollection();
        $this->teleexpertiseRequests = new ArrayCollection();
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getPatient(): ?Patient { return $this->patient; }
    public function setPatient(Patient $p): self { $this->patient = $p; return $this; }

    public function getAppointment(): ?Appointment { return $this->appointment; }
    public function setAppointment(?Appointment $a): self { $this->appointment = $a; return $this; }

    public function getCreatedBy(): ?User { return $this->createdBy; }
    public function setCreatedBy(User $u): self { $this->createdBy = $u; return $this; }

    public function getConsultationDate(): ?\DateTimeInterface { return $this->consultationDate; }
    public function setConsultationDate(\DateTimeInterface $d): self { $this->consultationDate = $d; return $this; }

    public function getChiefComplaint(): ?string { return $this->chiefComplaint; }
    public function setChiefComplaint(?string $c): self { $this->chiefComplaint = $c; return $this; }

    public function getObservations(): ?string { return $this->observations; }
    public function setObservations(?string $o): self { $this->observations = $o; return $this; }

    public function getRightEyeVisionUncorrected(): ?string { return $this->rightEyeVisionUncorrected; }
    public function setRightEyeVisionUncorrected(?string $v): self { $this->rightEyeVisionUncorrected = $v; return $this; }

    public function getRightEyeVisionCorrected(): ?string { return $this->rightEyeVisionCorrected; }
    public function setRightEyeVisionCorrected(?string $v): self { $this->rightEyeVisionCorrected = $v; return $this; }

    public function getRightEyeSphere(): ?string { return $this->rightEyeSphere; }
    public function setRightEyeSphere(?string $v): self { $this->rightEyeSphere = $v; return $this; }

    public function getRightEyeCylinder(): ?string { return $this->rightEyeCylinder; }
    public function setRightEyeCylinder(?string $v): self { $this->rightEyeCylinder = $v; return $this; }

    public function getRightEyeAxis(): ?int { return $this->rightEyeAxis; }
    public function setRightEyeAxis(?int $v): self { $this->rightEyeAxis = $v; return $this; }

    public function getLeftEyeVisionUncorrected(): ?string { return $this->leftEyeVisionUncorrected; }
    public function setLeftEyeVisionUncorrected(?string $v): self { $this->leftEyeVisionUncorrected = $v; return $this; }

    public function getLeftEyeVisionCorrected(): ?string { return $this->leftEyeVisionCorrected; }
    public function setLeftEyeVisionCorrected(?string $v): self { $this->leftEyeVisionCorrected = $v; return $this; }

    public function getLeftEyeSphere(): ?string { return $this->leftEyeSphere; }
    public function setLeftEyeSphere(?string $v): self { $this->leftEyeSphere = $v; return $this; }

    public function getLeftEyeCylinder(): ?string { return $this->leftEyeCylinder; }
    public function setLeftEyeCylinder(?string $v): self { $this->leftEyeCylinder = $v; return $this; }

    public function getLeftEyeAxis(): ?int { return $this->leftEyeAxis; }
    public function setLeftEyeAxis(?int $v): self { $this->leftEyeAxis = $v; return $this; }

    public function getPupillaryDistance(): ?string { return $this->pupillaryDistance; }
    public function setPupillaryDistance(?string $v): self { $this->pupillaryDistance = $v; return $this; }

    public function getDiagnosis(): ?string { return $this->diagnosis; }
    public function setDiagnosis(?string $d): self { $this->diagnosis = $d; return $this; }

    public function getTreatment(): ?string { return $this->treatment; }
    public function setTreatment(?string $t): self { $this->treatment = $t; return $this; }

    public function getPrescription(): ?string { return $this->prescription; }
    public function setPrescription(?string $p): self { $this->prescription = $p; return $this; }

    public function getRecommendations(): ?string { return $this->recommendations; }
    public function setRecommendations(?string $r): self { $this->recommendations = $r; return $this; }

    public function getNextVisitDate(): ?\DateTimeInterface { return $this->nextVisitDate; }
    public function setNextVisitDate(?\DateTimeInterface $d): self { $this->nextVisitDate = $d; return $this; }

    public function getAttachments(): Collection { return $this->attachments; }
    public function getTeleexpertiseRequests(): Collection { return $this->teleexpertiseRequests; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
}
