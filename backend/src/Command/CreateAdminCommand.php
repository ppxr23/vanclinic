<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\User;
use App\Enum\UserRole;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'app:create-admin', description: 'Crée un compte administrateur (ROLE_COORDINATEUR)')]
class CreateAdminCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $hasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('email', null, InputOption::VALUE_REQUIRED, 'Email du compte')
            ->addOption('phone', null, InputOption::VALUE_REQUIRED, 'Téléphone (ex: +261341111111)')
            ->addOption('first-name', null, InputOption::VALUE_REQUIRED, 'Prénom')
            ->addOption('last-name', null, InputOption::VALUE_REQUIRED, 'Nom')
            ->addOption('password', null, InputOption::VALUE_REQUIRED, 'Mot de passe (demandé de façon masquée si omis)');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title("Création d'un compte administrateur");

        $email = $input->getOption('email') ?? $io->ask('Email');
        $phone = $input->getOption('phone') ?? $io->ask('Téléphone (ex: +261341111111)');
        $firstName = $input->getOption('first-name') ?? $io->ask('Prénom');
        $lastName = $input->getOption('last-name') ?? $io->ask('Nom');
        $password = $input->getOption('password') ?? $io->askHidden('Mot de passe (min. 8 caractères)');

        if (!$email || !$phone || !$firstName || !$lastName || !$password) {
            $io->error('Tous les champs sont requis.');

            return Command::FAILURE;
        }

        if (strlen((string) $password) < 8) {
            $io->error('Le mot de passe doit contenir au moins 8 caractères.');

            return Command::FAILURE;
        }

        if ($this->em->getRepository(User::class)->findOneBy(['email' => $email])) {
            $io->error("Un compte existe déjà avec l'email $email");

            return Command::FAILURE;
        }

        if ($this->em->getRepository(User::class)->findOneBy(['phone' => $phone])) {
            $io->error("Un compte existe déjà avec le téléphone $phone");

            return Command::FAILURE;
        }

        $user = new User();
        $user->setEmail($email)->setPhone($phone)->setFirstName($firstName)->setLastName($lastName)
            ->setPreferredLanguage('fr')->setEmailVerified(true)->setPhoneVerified(true)
            ->addRole(UserRole::COORDINATEUR);
        $user->setPassword($this->hasher->hashPassword($user, $password));

        $this->em->persist($user);
        $this->em->flush();

        $io->success("Compte administrateur créé : $email");

        return Command::SUCCESS;
    }
}
