<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261115000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add persistent application settings for consultation pricing';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE app_settings (setting_key VARCHAR(100) NOT NULL, setting_value TEXT NOT NULL, PRIMARY KEY(setting_key))');
        $this->addSql("INSERT INTO app_settings (setting_key, setting_value) VALUES ('consultation_price_mga', '50000')");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE app_settings');
    }
}
