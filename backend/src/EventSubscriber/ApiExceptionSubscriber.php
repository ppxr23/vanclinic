<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Validator\Exception\ValidationFailedException;

final class ApiExceptionSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly LoggerInterface $logger)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::EXCEPTION => ['onKernelException', 20]];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }

        $exception = $event->getThrowable();
        $status = $exception instanceof HttpExceptionInterface ? $exception->getStatusCode() : 500;
        if ($exception instanceof UniqueConstraintViolationException) $status = 409;
        elseif ($exception instanceof ValidationFailedException) $status = 400;
        elseif ($exception instanceof AuthenticationException) $status = 401;
        elseif ($exception instanceof AccessDeniedException) $status = 403;
        $payload = ['error' => $this->messageFor($exception, $status)];

        if ($exception instanceof ValidationFailedException) {
            $payload['fields'] = $this->validationMessages($exception);
            $status = 400;
        }

        if ($status >= 500) {
            $this->logger->error('Unhandled API exception', ['exception' => $exception, 'path' => $request->getPathInfo()]);
        }

        $event->setResponse(new JsonResponse($payload, $status));
    }

    private function messageFor(\Throwable $exception, int $status): string
    {
        if ($exception instanceof UniqueConstraintViolationException) {
            return 'Ces informations sont déjà utilisées. Vérifiez votre adresse e-mail ou votre numéro de téléphone.';
        }
        if ($exception instanceof ValidationFailedException) {
            return 'Certaines informations ne sont pas valides. Vérifiez les champs indiqués.';
        }
        if ($exception instanceof AuthenticationException || $status === 401) {
            return 'Votre session a expiré ou vos identifiants sont incorrects. Veuillez réessayer.';
        }
        if ($exception instanceof AccessDeniedException || $status === 403) {
            return 'Vous n’avez pas l’autorisation d’effectuer cette action.';
        }

        return match ($status) {
            400, 422 => 'Certaines informations sont invalides. Vérifiez les champs et réessayez.',
            404 => 'L’élément demandé est introuvable ou n’est plus disponible.',
            405 => 'Cette action n’est pas disponible ici.',
            409 => 'Cette action entre en conflit avec des données existantes. Actualisez la page puis réessayez.',
            429 => 'Trop de tentatives. Patientez un instant avant de réessayer.',
            503 => 'Le service est temporairement indisponible. Réessayez dans quelques instants.',
            default => $status >= 500
                ? 'Une erreur inattendue est survenue. Réessayez dans quelques instants.'
                : 'La demande n’a pas pu être traitée. Vérifiez les informations puis réessayez.',
        };
    }

    /** @return array<string, string> */
    private function validationMessages(ValidationFailedException $exception): array
    {
        $messages = [];
        foreach ($exception->getViolations() as $violation) {
            $field = (string) $violation->getPropertyPath();
            $messages[$field] = match (true) {
                str_contains(strtolower($violation->getMessage()), 'already') || str_contains(strtolower($violation->getMessage()), 'existe déjà')
                    => 'Cette information est déjà utilisée.',
                str_contains(strtolower($field), 'email') => 'Veuillez saisir une adresse e-mail valide.',
                str_contains(strtolower($field), 'phone') => 'Veuillez saisir un numéro de téléphone valide.',
                str_contains(strtolower($field), 'password') => 'Le mot de passe ne respecte pas les critères demandés.',
                default => 'Vérifiez cette information.',
            };
        }

        return $messages;
    }
}
