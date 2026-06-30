<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration initiale : création de toutes les tables VanClinic.
 *
 * NOTE : ce fichier est fourni à titre de squelette. En pratique, exécutez :
 *   php bin/console doctrine:migrations:diff
 * pour générer automatiquement la migration à partir des entités Doctrine,
 * puis :
 *   php bin/console doctrine:migrations:migrate
 * pour l'appliquer.
 */
final class Version20260101000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Création initiale du schéma VanClinic (users, patients, appointments, medical_records, ...)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(180) NOT NULL UNIQUE,
            phone VARCHAR(20) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            roles JSON NOT NULL,
            birth_date DATE DEFAULT NULL,
            address TEXT DEFAULT NULL,
            city VARCHAR(100) DEFAULT NULL,
            district VARCHAR(100) DEFAULT NULL,
            preferred_language VARCHAR(10) NOT NULL DEFAULT 'fr',
            email_verified BOOLEAN NOT NULL DEFAULT false,
            phone_verified BOOLEAN NOT NULL DEFAULT false,
            two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            last_login_at TIMESTAMP DEFAULT NULL
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE patients (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            patient_number VARCHAR(50) NOT NULL UNIQUE,
            gender VARCHAR(10) DEFAULT NULL,
            occupation VARCHAR(100) DEFAULT NULL,
            medical_history TEXT DEFAULT NULL,
            allergies TEXT DEFAULT NULL,
            current_medications TEXT DEFAULT NULL,
            emergency_contact_name VARCHAR(100) DEFAULT NULL,
            emergency_contact_phone VARCHAR(20) DEFAULT NULL
        );
        SQL);

        // Les autres tables (appointments, medical_records, products, orders, etc.)
        // sont créées automatiquement par doctrine:migrations:diff à partir des entités.
        // Ce fichier sert d'exemple ; la commande de génération produira la version complète.
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS patients CASCADE');
        $this->addSql('DROP TABLE IF EXISTS users CASCADE');
    }
}
