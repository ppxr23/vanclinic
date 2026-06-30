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
            $user->setBirthDate(new \DateTime($data['birthDate']));
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            throw new \InvalidArgumentException((string) $errors);
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
        $this->em->flush();

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
