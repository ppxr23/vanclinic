<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260728000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add sub_category to products and customization to order_items';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE products ADD COLUMN sub_category VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE order_items ADD COLUMN customization JSON DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE products DROP COLUMN sub_category');
        $this->addSql('ALTER TABLE order_items DROP COLUMN customization');
    }
}
