<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\User;
use App\Enum\UserRole;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', get_class($user)));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    public function findByEmailOrPhone(string $identifier): ?User
    {
        return $this->createQueryBuilder('u')
            ->where('u.email = :id OR u.phone = :id')
            ->setParameter('id', $identifier)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return User[]
     */
    public function findByRole(UserRole $role): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $ids = $conn->fetchFirstColumn(
            'SELECT id FROM users WHERE roles::text LIKE :role',
            ['role' => '%"' . $role->value . '"%']
        );

        if (empty($ids)) {
            return [];
        }

        return $this->createQueryBuilder('u')
            ->where('u.id IN (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->getResult();
    }

    public function countByRole(UserRole $role): int
    {
        $conn = $this->getEntityManager()->getConnection();
        return (int) $conn->fetchOne(
            'SELECT COUNT(id) FROM users WHERE roles::text LIKE :role',
            ['role' => '%"' . $role->value . '"%']
        );
    }
}
