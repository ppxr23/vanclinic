<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\EducationalContent;
use App\Entity\MobileClinicSession;
use App\Entity\Patient;
use App\Entity\Product;
use App\Entity\User;
use App\Enum\ProductCategory;
use App\Enum\UserRole;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'app:seed-demo', description: 'Insère les utilisateurs et données de démonstration')]
class SeedDemoCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $hasher,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $this->seedStaff($io);
        $this->seedPatients($io);
        $this->seedProducts($io);
        $this->seedMobileSessions($io);
        $this->seedEducationalContent($io);

        $this->em->flush();
        $io->success('Données de démonstration insérées avec succès.');

        return Command::SUCCESS;
    }

    private function seedStaff(SymfonyStyle $io): void
    {
        $staff = [
            ['coordinateur@vanclinic.mg', '+261341111111', 'Rabe',    'Coordinateur', UserRole::COORDINATEUR,  'Vanclinic2025!'],
            ['docteur@vanclinic.mg',      '+261342222222', 'Marie',   'Rakoto',       UserRole::OPHTALMOLOGUE, 'Vanclinic2025!'],
            ['ophtalmo2@vanclinic.mg',    '+261342222223', 'Tahiana', 'Rabe',         UserRole::OPHTALMOLOGUE, 'Vanclinic2025!'],
            ['agent@vanclinic.mg',        '+261343333333', 'Vola',    'Agent',        UserRole::AGENT_RELAIS,  'Vanclinic2025!'],
            ['agent2@vanclinic.mg',       '+261343333334', 'Faly',    'Razafy',       UserRole::AGENT_RELAIS,  'Vanclinic2025!'],
            ['technicien@vanclinic.mg',   '+261344444444', 'Hery',    'Technicien',   UserRole::TECHNICIEN,    'Vanclinic2025!'],
        ];

        foreach ($staff as [$email, $phone, $first, $last, $role, $password]) {
            if ($this->em->getRepository(User::class)->findOneBy(['email' => $email])) {
                $io->writeln("  <comment>Skipped (exists):</comment> $email");
                continue;
            }
            $user = new User();
            $user->setEmail($email)->setPhone($phone)->setFirstName($first)->setLastName($last)
                ->setPreferredLanguage('fr')->setEmailVerified(true)->setPhoneVerified(true)
                ->addRole($role);
            $user->setPassword($this->hasher->hashPassword($user, $password));
            $this->em->persist($user);
            $io->writeln("  <info>Created staff:</info> $email");
        }
    }

    private function seedPatients(SymfonyStyle $io): void
    {
        $patients = [
            ['patient@vanclinic.mg', '+261349000001', 'Jean',  'Dupont', 'M', 'Employé',      'Toamasina',  'Patient2025!'],
            ['patient2@example.mg',  '+261349000002', 'Rasoa', 'Marie',  'F', 'Enseignante',  'Toamasina',  'Patient2025!'],
            ['patient3@example.mg',  '+261349000003', 'Andry', 'Paul',   'M', 'Pêcheur',      'Brickaville','Patient2025!'],
        ];

        foreach ($patients as $i => [$email, $phone, $first, $last, $gender, $occupation, $city, $password]) {
            if ($this->em->getRepository(User::class)->findOneBy(['email' => $email])) {
                $io->writeln("  <comment>Skipped (exists):</comment> $email");
                continue;
            }
            $user = new User();
            $user->setEmail($email)->setPhone($phone)->setFirstName($first)->setLastName($last)
                ->setBirthDate(new \DateTime("198{$i}-0{$i}-15"))->setCity($city)
                ->setDistrict('Atsinanana')->setPreferredLanguage('mg')
                ->setEmailVerified(true)->addRole(UserRole::PATIENT);
            $user->setPassword($this->hasher->hashPassword($user, $password));
            $this->em->persist($user);

            $patient = new Patient();
            $patient->setUser($user)->setPatientNumber(sprintf('VC-%s-%06d', date('Y'), $i + 1))
                ->setGender($gender)->setOccupation($occupation);
            $this->em->persist($patient);
            $io->writeln("  <info>Created patient:</info> $email");
        }
    }

    private function seedProducts(SymfonyStyle $io): void
    {
        // [sku, name, desc, category, subCategory, brand, price, stock, couleurs]
        $products = [
            ['VC-LUN-001', 'Monture Classique Métal',       'Monture métal légère et résistante, compatible correcteurs',   ProductCategory::EYEGLASSES,  'monture',         'VanOptic',      45000,  50, ['noir', 'argent', 'or']],
            ['VC-LUN-002', 'Monture Tendance Acétate',      'Monture acétate style moderne, compatible correcteurs',         ProductCategory::EYEGLASSES,  'monture',         'VanOptic',      65000,  30, ['écaille', 'noir', 'bordeaux']],
            ['VC-LUN-003', 'Monture Enfant Souple',         'Monture flexible TR90 adaptée aux enfants',                    ProductCategory::EYEGLASSES,  'enfant',          'VanOptic Kids', 35000,  40, ['bleu', 'rose', 'rouge', 'vert']],
            ['VC-LUN-004', 'Monture Sport Wraparound',      'Monture sport légère, branches flexibles',                     ProductCategory::EYEGLASSES,  'sport',           'VanOptic',      55000,  20, ['noir', 'rouge', 'bleu']],
            ['VC-LUN-005', 'Lunettes de Lecture +1.5',      'Grossissement +1.5D, légères et confortables',                 ProductCategory::EYEGLASSES,  'lecture',         'VanOptic',      25000,  60, ['noir', 'marron', 'or']],
            ['VC-SOL-001', 'Lunettes de Soleil Aviator',    'Protection UV400, verres polarisés',                           ProductCategory::SUNGLASSES,  'soleil',          'VanOptic',      55000,  25, ['or/vert', 'argent/gris', 'noir/noir']],
            ['VC-SOL-002', 'Lunettes de Soleil Wayfarer',   'Style vintage, protection UV400',                              ProductCategory::SUNGLASSES,  'soleil',          'VanOptic',      48000,  30, ['noir', 'écaille', 'bleu']],
            ['VC-VER-001', 'Verres Unifocaux Standard',     'Verres correcteurs monofocaux indice 1.50',                    ProductCategory::LENSES,      'unifocaux',       'Essilor',       25000, 100, []],
            ['VC-VER-002', 'Verres Progressifs Premium',    'Verres multifocaux progressifs indice 1.60',                   ProductCategory::LENSES,      'progressifs',     'Essilor',       85000,  40, []],
            ['VC-VER-003', 'Verres Photochromiques',        'Verres qui s\'assombrissent au soleil (Transitions)',           ProductCategory::LENSES,      'photochromiques', 'Essilor',       70000,  35, []],
            ['VC-VER-004', 'Verres Polarisants',            'Verres polarisants anti-reflets pour le sport',                ProductCategory::LENSES,      'polarisants',     'Essilor',       60000,  25, []],
            ['VC-LEN-001', 'Lentilles mensuelles (x6)',     'Lentilles souples mensuelles, correction sphérique',           ProductCategory::CONTACT_LENSES, 'lentilles',    'Alcon',         45000,  50, []],
            ['VC-ACC-001', 'Étui rigide premium',           'Étui protecteur en simili-cuir avec chiffon',                  ProductCategory::ACCESSORIES, 'etuis',           'VanOptic',       8000,  80, ['noir', 'marron', 'bleu']],
            ['VC-ACC-002', 'Lingettes nettoyantes (x50)',   'Lingettes anti-buée individuelles pour verres',                ProductCategory::ACCESSORIES, 'nettoyage',       'VanOptic',      12000,  60, []],
            ['VC-ACC-003', 'Cordon lunettes élastique',     'Cordon ajustable pour maintenir les lunettes',                 ProductCategory::ACCESSORIES, 'cordons',         'VanOptic',       3500, 100, ['noir', 'marron', 'bleu', 'rouge']],
            ['VC-ACC-004', 'Kit réparation lunettes',       'Tournevis + vis + plaquettes de nez de rechange',             ProductCategory::ACCESSORIES, 'outils',          'VanOptic',       5000,  70, []],
        ];

        foreach ($products as [$sku, $name, $desc, $cat, $subCat, $brand, $price, $stock, $couleurs]) {
            $existing = $this->em->getRepository(Product::class)->findOneBy(['sku' => $sku]);
            if ($existing) {
                $existing->setSubCategory($subCat);
                if (!empty($couleurs)) {
                    $existing->setSpecifications(array_merge($existing->getSpecifications() ?? [], ['couleurs' => $couleurs]));
                }
                continue;
            }
            $p = new Product();
            $p->setSku($sku)->setName($name)->setDescription($desc)->setCategory($cat)
                ->setSubCategory($subCat)->setBrand($brand)->setPriceMga($price)
                ->setStockQuantity($stock)->setIsActive(true);
            if (!empty($couleurs)) {
                $p->setSpecifications(['couleurs' => $couleurs]);
            }
            $this->em->persist($p);
        }
        $io->writeln('  <info>Products seeded.</info>');
    }

    private function seedMobileSessions(SymfonyStyle $io): void
    {
        $sessions = [
            ['Marché central de Toamasina',       'Toamasina I', 'Toamasina',  '+1 week'],
            ['École Publique de Brickaville',      'Brickaville', 'Brickaville','+2 weeks'],
            ['Place du village de Vatomandry',     'Vatomandry',  'Vatomandry', '+3 weeks'],
        ];

        foreach ($sessions as [$location, $district, $commune, $when]) {
            $s = new MobileClinicSession();
            $s->setLocationName($location)->setDistrict($district)->setCommune($commune)
                ->setStartDate(new \DateTime($when))
                ->setEndDate((new \DateTime($when))->modify('+2 days'))
                ->setMaxAppointments(50)->setStatus(MobileClinicSession::STATUS_PLANNED);
            $this->em->persist($s);
        }
        $io->writeln('  <info>Mobile sessions seeded.</info>');
    }

    private function seedEducationalContent(SymfonyStyle $io): void
    {
        $author = $this->em->getRepository(User::class)->findOneBy(['email' => 'docteur@vanclinic.mg']);
        if (!$author) {
            $io->warning('Auteur introuvable, contenu éducatif non inséré.');
            return;
        }

        $contents = [
            ['Protéger ses yeux du soleil tropical', 'proteger-yeux-soleil', 'fr',
                "Le soleil de Madagascar peut endommager vos yeux. Portez des lunettes UV400, évitez de regarder directement le soleil, et limitez l'exposition entre 11h et 15h.",
                "L'exposition aux UV est un facteur majeur de cataracte précoce dans nos régions."],
            ['Hareho fahatsiarovan-tena mikasika ny maso', 'fahasalamana-maso', 'mg',
                "Manan-danja ny fitsaboana ny maso. Mba hahatsara ny fahasalaman-tsaina, dia tsara raha mametraka rendez-vous isan-taona miaraka amin'ny ophtalmologue iray.",
                "Tsara ho fantatra fa misy fitsipika maro azo arahina mba hiarovana ny maso."],
            ["Les premiers signes d'une cataracte", 'signes-cataracte', 'fr',
                "La cataracte est une opacification du cristallin. Premiers signes : vision floue, sensibilité à la lumière, vision dédoublée. Consultez rapidement.",
                "La cataracte est une cause majeure de cécité réversible à Madagascar."],
        ];

        foreach ($contents as [$title, $slug, $lang, $body, $excerpt]) {
            if ($this->em->getRepository(EducationalContent::class)->findOneBy(['slug' => $slug])) {
                continue;
            }
            $c = new EducationalContent();
            $c->setTitle($title)->setSlug($slug)->setLanguage($lang)
                ->setContentType(EducationalContent::TYPE_ARTICLE)
                ->setBody($body)->setExcerpt($excerpt)->setAuthor($author)->setIsPublished(true);
            $this->em->persist($c);
        }
        $io->writeln('  <info>Educational content seeded.</info>');
    }
}
