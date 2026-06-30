<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use App\Enum\OrderStatus;
use PHPUnit\Framework\TestCase;

class OrderTest extends TestCase
{
    public function testDefaultStatusIsPending(): void
    {
        $order = new Order();
        $this->assertSame(OrderStatus::PENDING, $order->getStatus());
    }

    public function testRecalculateTotalsSumsItems(): void
    {
        $product1 = (new Product())->setName('A')->setPriceMga(10000);
        $product2 = (new Product())->setName('B')->setPriceMga(5000);

        $item1 = (new OrderItem())->setProduct($product1)->setQuantity(2);
        $item2 = (new OrderItem())->setProduct($product2)->setQuantity(3);

        $order = new Order();
        $order->addItem($item1);
        $order->addItem($item2);
        $order->setShippingFeeMga(2000);

        $order->recalculateTotals();

        // 2*10000 + 3*5000 = 35000
        $this->assertSame(35000, $order->getSubtotalMga());
        $this->assertSame(37000, $order->getTotalMga());
    }

    public function testOrderItemLineTotal(): void
    {
        $product = (new Product())->setName('X')->setPriceMga(15000);
        $item = (new OrderItem())->setProduct($product)->setQuantity(4);

        $this->assertSame(60000, $item->getLineTotalMga());
    }
}
