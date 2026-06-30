<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\User;
use App\Service\AuthService;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/auth', name: 'api_auth_')]
#[OA\Tag(name: 'Auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private readonly AuthService $authService,
    ) {
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    #[OA\Post(
        summary: "Inscription d'un nouveau patient",
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                required: ['email', 'phone', 'password', 'firstName', 'lastName'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'patient@example.mg'),
                    new OA\Property(property: 'phone', type: 'string', example: '+261341234567'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'MotDePasse123'),
                    new OA\Property(property: 'firstName', type: 'string', example: 'Rakoto'),
                    new OA\Property(property: 'lastName', type: 'string', example: 'Rabe'),
                    new OA\Property(property: 'birthDate', type: 'string', format: 'date', example: '1990-05-15'),
                    new OA\Property(property: 'gender', type: 'string', enum: ['M', 'F', 'O']),
                    new OA\Property(property: 'address', type: 'string'),
                    new OA\Property(property: 'city', type: 'string', example: 'Antananarivo'),
                    new OA\Property(property: 'district', type: 'string', example: 'Analamanga'),
                    new OA\Property(property: 'preferredLanguage', type: 'string', enum: ['fr', 'mg']),
                ]
            )
        )
    )]
    #[OA\Response(response: 201, description: 'Compte créé')]
    #[OA\Response(response: 400, description: 'Données invalides')]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $result = $this->authService->registerPatient($data);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Erreur lors de la création du compte.', 'details' => $e->getMessage()], 500);
        }

        return $this->json([
            'token' => $result['token'],
            'user' => [
                'id' => $result['user']->getId(),
                'email' => $result['user']->getEmail(),
                'firstName' => $result['user']->getFirstName(),
                'lastName' => $result['user']->getLastName(),
                'roles' => $result['user']->getRoles(),
            ],
            'patient' => [
                'patientNumber' => $result['patient']->getPatientNumber(),
            ],
        ], 201);
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    #[OA\Post(
        summary: "Connexion par email/mot de passe (géré par lexik_jwt)",
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'password', type: 'string', format: 'password'),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, description: 'Token JWT retourné')]
    public function login(): JsonResponse
    {
        // Ce endpoint est géré par lexik_jwt_authentication (json_login).
        // Cette méthode existe uniquement pour la documentation.
        throw new \LogicException('Ce contrôleur ne doit jamais être appelé directement.');
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    #[OA\Get(summary: 'Récupère le profil de l\'utilisateur connecté')]
    #[Security(name: 'Bearer')]
    public function me(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'phone' => $user->getPhone(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'fullName' => $user->getFullName(),
            'roles' => $user->getRoles(),
            'preferredLanguage' => $user->getPreferredLanguage(),
            'city' => $user->getCity(),
            'district' => $user->getDistrict(),
            'emailVerified' => $user->isEmailVerified(),
            'phoneVerified' => $user->isPhoneVerified(),
            'lastLoginAt' => $user->getLastLoginAt()?->format(\DateTimeInterface::ATOM),
        ]);
    }

    #[Route('/change-password', name: 'change_password', methods: ['POST'])]
    #[OA\Post(summary: 'Modifier son mot de passe')]
    #[Security(name: 'Bearer')]
    public function changePassword(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $this->authService->changePassword(
                $user,
                $data['currentPassword'] ?? '',
                $data['newPassword'] ?? ''
            );
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    #[Route('/forgot-password', name: 'forgot_password', methods: ['POST'])]
    #[OA\Post(summary: 'Demander une réinitialisation de mot de passe')]
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $emailOrPhone = $data['identifier'] ?? '';

        $this->authService->generateResetToken($emailOrPhone);

        return $this->json(['message' => 'Si un compte existe, vous recevrez les instructions par email/SMS.']);
    }

    #[Route('/reset-password', name: 'reset_password', methods: ['POST'])]
    #[OA\Post(
        summary: 'Réinitialiser le mot de passe avec un token',
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                required: ['token', 'newPassword'],
                properties: [
                    new OA\Property(property: 'token', type: 'string'),
                    new OA\Property(property: 'newPassword', type: 'string', format: 'password'),
                ]
            )
        )
    )]
    public function resetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $token = $data['token'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        try {
            $this->authService->resetPasswordByToken($token, $newPassword);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        return $this->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}
