<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Product;
use App\Enum\ProductCategory;
use PHPUnit\Framework\TestCase;

class ProductTest extends TestCase
{
    public function testDefaultCategoryIsEyeglasses(): void
    {
        $product = new Product();
        $this->assertSame(ProductCategory::EYEGLASSES, $product->getCategory());
    }

    public function testDecreaseStockReducesQuantity(): void
    {
        $product = new Product();
        $product->setStockQuantity(10);
        $product->decreaseStock(3);

        $this->assertSame(7, $product->getStockQuantity());
    }

    public function testDecreaseStockNeverGoesBelowZero(): void
    {
        $product = new Product();
        $product->setStockQuantity(5);
        $product->decreaseStock(10);

        $this->assertSame(0, $product->getStockQuantity());
    }

    public function testIncreaseStockAddsQuantity(): void
    {
        $product = new Product();
        $product->setStockQuantity(5);
        $product->increaseStock(7);

        $this->assertSame(12, $product->getStockQuantity());
    }

    public function testIsStockLowReturnsTrueWhenAtOrBelowThreshold(): void
    {
        $product = new Product();
        $product->setStockAlertThreshold(5);

        $product->setStockQuantity(3);
        $this->assertTrue($product->isStockLow());

        $product->setStockQuantity(5);
        $this->assertTrue($product->isStockLow());

        $product->setStockQuantity(6);
        $this->assertFalse($product->isStockLow());
    }
}
