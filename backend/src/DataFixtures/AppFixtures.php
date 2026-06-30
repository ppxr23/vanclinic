<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\EducationalContent;
use App\Entity\MobileClinicSession;
use App\Entity\Patient;
use App\Entity\Product;
use App\Entity\User;
use App\Enum\ProductCategory;
use App\Enum\UserRole;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        $this->loadStaff($manager);
        $this->loadPatients($manager);
        $this->loadProducts($manager);
        $this->loadMobileSessions($manager);
        $this->loadEducationalContent($manager);

        $manager->flush();
    }

    private function loadStaff(ObjectManager $manager): void
    {
        $staff = [
            ['coordinateur@vanclinic.mg', '+261341111111', 'Rabe',  'Coordinateur', UserRole::COORDINATEUR,  'Vanclinic2025!'],
            ['docteur@vanclinic.mg',      '+261342222222', 'Marie', 'Rakoto',        UserRole::OPHTALMOLOGUE, 'Vanclinic2025!'],
            ['ophtalmo2@vanclinic.mg',    '+261342222223', 'Tahiana','Rabe',         UserRole::OPHTALMOLOGUE, 'Vanclinic2025!'],
            ['agent@vanclinic.mg',        '+261343333333', 'Vola',  'Agent',         UserRole::AGENT_RELAIS,  'Vanclinic2025!'],
            ['agent2@vanclinic.mg',       '+261343333334', 'Faly',  'Razafy',        UserRole::AGENT_RELAIS,  'Vanclinic2025!'],
            ['technicien@vanclinic.mg',   '+261344444444', 'Hery',  'Technicien',    UserRole::TECHNICIEN,    'Vanclinic2025!'],
        ];

        foreach ($staff as [$email, $phone, $first, $last, $role, $password]) {
            $user = new User();
            $user->setEmail($email)
                ->setPhone($phone)
                ->setFirstName($first)
                ->setLastName($last)
                ->setPreferredLanguage('fr')
                ->setEmailVerified(true)
                ->setPhoneVerified(true)
                ->addRole($role);

            $user->setPassword($this->passwordHasher->hashPassword($user, $password));
            $manager->persist($user);
        }
    }

    private function loadPatients(ObjectManager $manager): void
    {
        $patients = [
            ['patient@vanclinic.mg', '+261349000001', 'Jean',  'Dupont', 'M', 'Employé',     'Toamasina', 'Patient2025!'],
            ['patient2@example.mg',  '+261349000002', 'Rasoa', 'Marie',  'F', 'Enseignante', 'Toamasina', 'Patient2025!'],
            ['patient3@example.mg',  '+261349000003', 'Andry', 'Paul',   'M', 'Pêcheur',     'Brickaville','Patient2025!'],
        ];

        foreach ($patients as $i => [$email, $phone, $first, $last, $gender, $occupation, $city, $password]) {
            $user = new User();
            $user->setEmail($email)
                ->setPhone($phone)
                ->setFirstName($first)
                ->setLastName($last)
                ->setBirthDate(new \DateTime("198{$i}-0{$i}-15"))
                ->setCity($city)
                ->setDistrict('Atsinanana')
                ->setPreferredLanguage('mg')
                ->setEmailVerified(true)
                ->addRole(UserRole::PATIENT);

            $user->setPassword($this->passwordHasher->hashPassword($user, $password));
            $manager->persist($user);

            $patient = new Patient();
            $patient->setUser($user)
                ->setPatientNumber(sprintf('VC-%s-%06d', date('Y'), $i + 1))
                ->setGender($gender)
                ->setOccupation($occupation);

            $manager->persist($patient);
        }
    }

    private function loadProducts(ObjectManager $manager): void
    {
        $products = [
            ['VC-LUN-001', 'Lunettes Classique Métal', 'Monture métal noir, légère et résistante', ProductCategory::EYEGLASSES, 'VanOptic', 45000, 50],
            ['VC-LUN-002', 'Lunettes Tendance Acétate', 'Monture acétate écaille, style moderne', ProductCategory::EYEGLASSES, 'VanOptic', 65000, 30],
            ['VC-LUN-003', 'Lunettes Enfant Souples', 'Monture flexible adaptée aux enfants', ProductCategory::EYEGLASSES, 'VanOptic Kids', 35000, 40],
            ['VC-SOL-001', 'Lunettes de Soleil Aviator', 'Protection UV400, verres polarisés', ProductCategory::SUNGLASSES, 'VanOptic', 55000, 25],
            ['VC-VER-001', 'Verres Unifocaux Standard', 'Verres correcteurs simples', ProductCategory::LENSES, 'Essilor', 25000, 100],
            ['VC-VER-002', 'Verres Progressifs', 'Verres progressifs multifocaux', ProductCategory::LENSES, 'Essilor', 85000, 40],
            ['VC-ACC-001', 'Étui rigide premium', 'Étui protecteur en simili-cuir', ProductCategory::ACCESSORIES, 'VanOptic', 8000, 80],
            ['VC-ACC-002', 'Lingettes nettoyantes (x50)', 'Lingettes anti-buée pour verres', ProductCategory::ACCESSORIES, 'VanOptic', 12000, 60],
        ];

        foreach ($products as [$sku, $name, $desc, $cat, $brand, $price, $stock]) {
            $product = new Product();
            $product->setSku($sku)
                ->setName($name)
                ->setDescription($desc)
                ->setCategory($cat)
                ->setBrand($brand)
                ->setPriceMga($price)
                ->setStockQuantity($stock)
                ->setIsActive(true);

            $manager->persist($product);
        }
    }

    private function loadMobileSessions(ObjectManager $manager): void
    {
        $sessions = [
            ['Marché central de Toamasina', 'Toamasina I', 'Toamasina', '+1 week'],
            ['École Publique de Brickaville', 'Brickaville', 'Brickaville', '+2 weeks'],
            ['Place du village de Vatomandry', 'Vatomandry', 'Vatomandry', '+3 weeks'],
        ];

        foreach ($sessions as [$location, $district, $commune, $when]) {
            $session = new MobileClinicSession();
            $session->setLocationName($location)
                ->setDistrict($district)
                ->setCommune($commune)
                ->setStartDate(new \DateTime($when))
                ->setEndDate((new \DateTime($when))->modify('+2 days'))
                ->setMaxAppointments(50)
                ->setStatus(MobileClinicSession::STATUS_PLANNED);

            $manager->persist($session);
        }
    }

    private function loadEducationalContent(ObjectManager $manager): void
    {
        // On a besoin d'un auteur (premier ophtalmologue créé)
        $manager->flush(); // Pour récupérer l'auteur
        $author = $manager->getRepository(User::class)->findOneBy(['email' => 'docteur@vanclinic.mg']);

        if (!$author) {
            return;
        }

        $contents = [
            [
                'Protéger ses yeux du soleil tropical',
                'proteger-yeux-soleil',
                'fr',
                "Le soleil de Madagascar peut endommager vos yeux. Voici comment vous protéger : portez des lunettes de soleil avec protection UV400, évitez de regarder directement le soleil, et limitez l'exposition entre 11h et 15h.",
                "L'exposition aux UV est un facteur majeur de cataracte précoce dans nos régions.",
            ],
            [
                'Hareho fahatsiarovan-tena mikasika ny maso',
                'fahasalamana-maso',
                'mg',
                "Manan-danja ny fitsaboana ny maso. Mba hahatsara ny fahasalaman-tsaina, dia tsara raha mametraka rendez-vous isan-taona miaraka amin'ny ophtalmologue iray.",
                "Tsara ho fantatra fa misy fitsipika maro azo arahina mba hiarovana ny maso.",
            ],
            [
                'Les premiers signes d\'une cataracte',
                'signes-cataracte',
                'fr',
                "La cataracte est une opacification du cristallin. Premiers signes : vision floue, sensibilité à la lumière, vision dédoublée. Consultez rapidement si vous présentez ces symptômes.",
                "La cataracte est une cause majeure de cécité réversible à Madagascar.",
            ],
        ];

        foreach ($contents as [$title, $slug, $lang, $body, $excerpt]) {
            $content = new EducationalContent();
            $content->setTitle($title)
                ->setSlug($slug)
                ->setLanguage($lang)
                ->setContentType(EducationalContent::TYPE_ARTICLE)
                ->setBody($body)
                ->setExcerpt($excerpt)
                ->setAuthor($author)
                ->setIsPublished(true);

            $manager->persist($content);
        }
    }
}
