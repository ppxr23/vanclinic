<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\MedicalRecord;
use App\Entity\TeleexpertiseRequest;
use App\Entity\User;
use App\Enum\AppointmentStatus;
use App\Enum\OrderStatus;
use App\Enum\PaymentStatus;
use App\Enum\UserRole;
use App\Repository\AppointmentRepository;
use App\Repository\OrderRepository;
use App\Repository\PaymentRepository;
use App\Repository\ProductRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class TeleexpertiseService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly NotificationService $notificationService,
    ) {
    }

    public function createRequest(
        MedicalRecord $record,
        User $requestedBy,
        string $question,
        string $urgency = 'normal'
    ): TeleexpertiseRequest {
        $request = new TeleexpertiseRequest();
        $request->setMedicalRecord($record)
            ->setRequestedBy($requestedBy)
            ->setQuestion($question)
            ->setUrgency($urgency);

        $this->em->persist($request);
        $this->em->flush();

        return $request;
    }

    public function respond(TeleexpertiseRequest $request, User $ophthalmologist, string $response): TeleexpertiseRequest
    {
        $request->setResponse($response)
            ->setAssignedTo($ophthalmologist)
            ->setRespondedAt(new \DateTime())
            ->setStatus(TeleexpertiseRequest::STATUS_RESPONDED);

        $this->em->flush();

        // Notifier le demandeur
        $this->notificationService->send(
            user: $request->getRequestedBy(),
            type: 'teleexpertise_response',
            title: 'Réponse de téléexpertise reçue',
            message: "Le Dr {$ophthalmologist->getFullName()} a répondu à votre demande de téléexpertise.",
            channels: ['in_app', 'email'],
            data: ['request_id' => $request->getId()],
        );

        return $request;
    }
}
