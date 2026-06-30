<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\MedicalAttachmentRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MedicalAttachmentRepository::class)]
#[ORM\Table(name: 'medical_attachments')]
class MedicalAttachment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: MedicalRecord::class, inversedBy: 'attachments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MedicalRecord $medicalRecord = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $fileName = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $filePath = null;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $mimeType = null;

    #[ORM\Column(type: 'integer')]
    private int $fileSize = 0;

    #[ORM\Column(type: 'string', length: 50)]
    private string $attachmentType = 'image'; // image | document | scan_result

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $uploadedAt;

    public function __construct()
    {
        $this->uploadedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getMedicalRecord(): ?MedicalRecord { return $this->medicalRecord; }
    public function setMedicalRecord(MedicalRecord $r): self { $this->medicalRecord = $r; return $this; }

    public function getFileName(): ?string { return $this->fileName; }
    public function setFileName(string $n): self { $this->fileName = $n; return $this; }

    public function getFilePath(): ?string { return $this->filePath; }
    public function setFilePath(string $p): self { $this->filePath = $p; return $this; }

    public function getMimeType(): ?string { return $this->mimeType; }
    public function setMimeType(string $m): self { $this->mimeType = $m; return $this; }

    public function getFileSize(): int { return $this->fileSize; }
    public function setFileSize(int $s): self { $this->fileSize = $s; return $this; }

    public function getAttachmentType(): string { return $this->attachmentType; }
    public function setAttachmentType(string $t): self { $this->attachmentType = $t; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }

    public function getUploadedAt(): \DateTimeImmutable { return $this->uploadedAt; }
}
