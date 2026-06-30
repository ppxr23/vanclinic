<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\User;
use App\Enum\UserRole;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testNewUserHasRoleUser(): void
    {
        $user = new User();
        $this->assertContains('ROLE_USER', $user->getRoles());
    }

    public function testAddRoleAddsRoleWithoutDuplicates(): void
    {
        $user = new User();
        $user->addRole(UserRole::PATIENT);
        $user->addRole(UserRole::PATIENT); // doublon volontaire

        $roles = $user->getRoles();
        $patientCount = count(array_filter($roles, fn($r) => $r === UserRole::PATIENT->value));
        $this->assertSame(1, $patientCount);
    }

    public function testHasRole(): void
    {
        $user = new User();
        $user->addRole(UserRole::OPHTALMOLOGUE);

        $this->assertTrue($user->hasRole(UserRole::OPHTALMOLOGUE));
        $this->assertFalse($user->hasRole(UserRole::COORDINATEUR));
    }

    public function testGetFullName(): void
    {
        $user = new User();
        $user->setFirstName('Hery')->setLastName('Rakoto');

        $this->assertSame('Hery Rakoto', $user->getFullName());
    }

    public function testGetUserIdentifierIsEmail(): void
    {
        $user = new User();
        $user->setEmail('test@vanclinic.mg');

        $this->assertSame('test@vanclinic.mg', $user->getUserIdentifier());
    }

    public function testDefaultPreferredLanguageIsFrench(): void
    {
        $user = new User();
        $this->assertSame('fr', $user->getPreferredLanguage());
    }

    public function testUserIsActiveByDefault(): void
    {
        $user = new User();
        $this->assertTrue($user->isActive());
    }
}
