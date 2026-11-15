<?php

declare(strict_types=1);

namespace App\Service;

use Doctrine\DBAL\Connection;

final class ConsultationPricingService
{
    private const SETTING_KEY = 'consultation_price_mga';
    private const DEFAULT_PRICE_MGA = 50000;

    public function __construct(private readonly Connection $connection)
    {
    }

    public function getPriceMga(): int
    {
        $price = $this->connection->fetchOne(
            'SELECT setting_value FROM app_settings WHERE setting_key = ?',
            [self::SETTING_KEY],
        );

        return $price === false ? self::DEFAULT_PRICE_MGA : (int) $price;
    }

    public function setPriceMga(int $priceMga): void
    {
        $updated = $this->connection->executeStatement(
            'UPDATE app_settings SET setting_value = ? WHERE setting_key = ?',
            [(string) $priceMga, self::SETTING_KEY],
        );

        if ($updated === 0) {
            $this->connection->insert('app_settings', [
                'setting_key' => self::SETTING_KEY,
                'setting_value' => (string) $priceMga,
            ]);
        }
    }
}
