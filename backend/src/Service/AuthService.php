<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\LoginHistory;
use App\Entity\Patient;
use App\Entity\User;
use App\Enum\UserRole;
use App\Repository\PatientRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepository,
        private readonly PatientRepository $patientRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /**
     * Inscrit un nouveau patient et retourne un token JWT.
     *
     * @param array<string, mixed> $data
     * @return array{user: User, patient: Patient, token: string}
     */
    public function registerPatient(array $data): array
    {
        foreach (['email', 'phone', 'password', 'firstName', 'lastName'] as $field) {
            if (!isset($data[$field]) || !is_string($data[$field]) || trim($data[$field]) === '') {
                $labels = ['email' => 'adresse e-mail', 'phone' => 'numéro de téléphone', 'password' => 'mot de passe', 'firstName' => 'prénom', 'lastName' => 'nom'];
                throw new \InvalidArgumentException('Veuillez renseigner votre ' . $labels[$field] . '.');
            }
        }
        if (strlen($data['password']) < 8) {
            throw new \InvalidArgumentException('Le mot de passe doit contenir au moins 8 caractères.');
        }
        if ($this->userRepository->findOneBy(['email' => $data['email']])) {
            throw new \InvalidArgumentException('Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse.');
        }
        if ($this->userRepository->findOneBy(['phone' => $data['phone']])) {
            throw new \InvalidArgumentException('Ce numéro de téléphone est déjà associé à un compte. Connectez-vous ou utilisez un autre numéro.');
        }

        $user = new User();
        $user->setEmail($data['email'])
            ->setPhone($data['phone'])
            ->setFirstName($data['firstName'])
            ->setLastName($data['lastName'])
            ->setAddress($data['address'] ?? null)
            ->setCity($data['city'] ?? null)
            ->setDistrict($data['district'] ?? null)
            ->setPreferredLanguage($data['preferredLanguage'] ?? 'fr')
            ->addRole(UserRole::PATIENT);

        if (!empty($data['birthDate'])) {
            try {
                $user->setBirthDate(new \DateTime($data['birthDate']));
            } catch (\Throwable) {
                throw new \InvalidArgumentException('La date de naissance indiquée n’est pas valide.');
            }
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $field = (string) $error->getPropertyPath();
                $isDuplicate = str_contains(strtolower($error->getMessage()), 'existe déjà');
                $messages[] = match ($field) {
                    'email' => $isDuplicate ? 'Cette adresse e-mail est déjà utilisée.' : 'Veuillez saisir une adresse e-mail valide.',
                    'phone' => $isDuplicate ? 'Ce numéro de téléphone est déjà utilisé.' : 'Veuillez saisir un numéro de téléphone valide.',
                    'firstName' => 'Le prénom doit contenir entre 2 et 100 caractères.',
                    'lastName' => 'Le nom doit contenir entre 2 et 100 caractères.',
                    default => 'Vérifiez les informations saisies.',
                };
            }
            throw new \InvalidArgumentException(implode(' ', array_unique($messages)));
        }

        $patient = new Patient();
        $patient->setUser($user)
            ->setPatientNumber($this->patientRepository->generateNextPatientNumber())
            ->setGender($data['gender'] ?? null)
            ->setOccupation($data['occupation'] ?? null)
            ->setEmergencyContactName($data['emergencyContactName'] ?? null)
            ->setEmergencyContactPhone($data['emergencyContactPhone'] ?? null);

        $this->em->persist($user);
        $this->em->persist($patient);
        $this->em->flush();

        return [
            'user' => $user,
            'patient' => $patient,
            'token' => $this->jwtManager->create($user),
        ];
    }

    /**
     * Crée un compte pour un membre du personnel (Agent Relais, Ophtalmologue, etc.).
     *
     * @param array<string, mixed> $data
     */
    public function createStaffAccount(array $data, UserRole $role): User
    {
        foreach (['email' => 'adresse e-mail', 'phone' => 'numéro de téléphone', 'firstName' => 'prénom', 'lastName' => 'nom'] as $field => $label) {
            if (!isset($data[$field]) || !is_string($data[$field]) || trim($data[$field]) === '') {
                throw new \InvalidArgumentException('Veuillez renseigner ' . ($field === 'email' ? 'une ' : 'votre ') . $label . '.');
            }
        }
        if ($this->userRepository->findOneBy(['email' => $data['email']])) {
            throw new \InvalidArgumentException('Cette adresse e-mail est déjà utilisée.');
        }
        if ($this->userRepository->findOneBy(['phone' => $data['phone']])) {
            throw new \InvalidArgumentException('Ce numéro de téléphone est déjà utilisé.');
        }

        $user = new User();
        $user->setEmail($data['email'])
            ->setPhone($data['phone'])
            ->setFirstName($data['firstName'])
            ->setLastName($data['lastName'])
            ->setPreferredLanguage($data['preferredLanguage'] ?? 'fr')
            ->addRole($role)
            ->setEmailVerified(true); // Les comptes staff sont créés par un coordinateur

        $tempPassword = $data['password'] ?? bin2hex(random_bytes(8));
        $user->setPassword($this->passwordHasher->hashPassword($user, $tempPassword));

        $this->em->persist($user);
        try {
            $this->em->flush();
        } catch (UniqueConstraintViolationException $e) {
            throw new \InvalidArgumentException('Cette adresse e-mail ou ce numéro de téléphone est déjà utilisé.', previous: $e);
        }

        return $user;
    }

    public function logLoginAttempt(User $user, Request $request, bool $success): void
    {
        $history = new LoginHistory();
        $history->setUser($user)
            ->setIpAddress($request->getClientIp() ?? '0.0.0.0')
            ->setUserAgent($request->headers->get('User-Agent'))
            ->setDeviceType($this->detectDeviceType($request->headers->get('User-Agent') ?? ''))
            ->setSuccess($success);

        if ($success) {
            $user->setLastLoginAt(new \DateTime());
        }

        $this->em->persist($history);
        $this->em->flush();
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            throw new BadCredentialsException('Mot de passe actuel incorrect.');
        }

        if (strlen($newPassword) < 8) {
            throw new \InvalidArgumentException('Le mot de passe doit contenir au moins 8 caractères.');
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $newPassword));
        $this->em->flush();
    }

    public function generateResetToken(string $emailOrPhone): ?string
    {
        $user = $this->userRepository->findByEmailOrPhone($emailOrPhone);
        if (!$user) {
            return null;
        }

        $token = bin2hex(random_bytes(32));
        $user->setPasswordResetToken($token);
        $user->setPasswordResetTokenExpiresAt(new \DateTime('+1 hour'));
        $this->em->flush();

        return $token;
    }

    public function resetPasswordByToken(string $token, string $newPassword): void
    {
        if (strlen($newPassword) < 8) {
            throw new \InvalidArgumentException('Le mot de passe doit contenir au moins 8 caractères.');
        }

        $user = $this->userRepository->findOneBy(['passwordResetToken' => $token]);
        if (!$user) {
            throw new \InvalidArgumentException('Token invalide ou expiré.');
        }

        $expiresAt = $user->getPasswordResetTokenExpiresAt();
        if (!$expiresAt || $expiresAt < new \DateTime()) {
            throw new \InvalidArgumentException('Token invalide ou expiré.');
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $newPassword));
        $user->setPasswordResetToken(null);
        $user->setPasswordResetTokenExpiresAt(null);
        $this->em->flush();
    }

    private function detectDeviceType(string $userAgent): string
    {
        if (preg_match('/mobile|android|iphone|ipad/i', $userAgent)) {
            return 'mobile';
        }
        if (preg_match('/tablet|ipad/i', $userAgent)) {
            return 'tablet';
        }
        return 'desktop';
    }
}
