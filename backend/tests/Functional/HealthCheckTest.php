<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class HealthCheckTest extends WebTestCase
{
    public function testApiDocIsAccessible(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/doc.json');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'application/json');

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertSame('VanClinic API', $data['info']['title'] ?? null);
    }

    public function testProtectedEndpointReturns401WithoutToken(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/auth/me');

        $this->assertResponseStatusCodeSame(401);
    }

    public function testPublicContentIsAccessibleWithoutAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/public/content?lang=fr');

        $this->assertResponseIsSuccessful();
    }
}
