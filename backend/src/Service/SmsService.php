<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Envoi de SMS via les passerelles des opérateurs malgaches
 * (Orange, Airtel, Telma). En dev/test, les SMS sont loggés sans envoi réel.
 */
class SmsService
{
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly string $provider,
        private readonly string $apiKey,
        private readonly string $apiSecret,
        private readonly string $senderName,
        private readonly string $environment,
    ) {
    }

    /**
     * Envoie un SMS au numéro fourni.
     * Retourne true si l'envoi a réussi, false sinon.
     */
    public function send(string $phone, string $message): bool
    {
        $phone = $this->normalizePhone($phone);

        // En dev/test, ne pas appeler l'API externe
        if ($this->environment !== 'prod') {
            $this->logger->info('[SMS DEV] Simulation envoi SMS', [
                'to' => $phone,
                'message' => $message,
                'provider' => $this->provider,
            ]);
            return true;
        }

        try {
            return match ($this->provider) {
                'orange' => $this->sendViaOrange($phone, $message),
                'airtel' => $this->sendViaAirtel($phone, $message),
                'telma' => $this->sendViaTelma($phone, $message),
                default => throw new \RuntimeException("Opérateur SMS inconnu : {$this->provider}"),
            };
        } catch (\Throwable $e) {
            $this->logger->error('Échec envoi SMS', [
                'to' => $phone,
                'provider' => $this->provider,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    private function sendViaOrange(string $phone, string $message): bool
    {
        $response = $this->httpClient->request('POST', 'https://api.orange.mg/smsmessaging/v1/outbound/tel%3A%2B' . $this->senderName . '/requests', [
            'auth_bearer' => $this->apiKey,
            'json' => [
                'outboundSMSMessageRequest' => [
                    'address' => "tel:+{$phone}",
                    'senderAddress' => "tel:+{$this->senderName}",
                    'outboundSMSTextMessage' => ['message' => $message],
                ],
            ],
            'timeout' => 10,
        ]);

        return $response->getStatusCode() === 201;
    }

    private function sendViaAirtel(string $phone, string $message): bool
    {
        $response = $this->httpClient->request('POST', 'https://openapi.airtel.africa/standard/v1/sms/send', [
            'auth_bearer' => $this->apiKey,
            'json' => [
                'from' => $this->senderName,
                'to' => $phone,
                'message' => $message,
            ],
            'timeout' => 10,
        ]);

        return $response->getStatusCode() === 200;
    }

    private function sendViaTelma(string $phone, string $message): bool
    {
        $response = $this->httpClient->request('POST', 'https://api.telma.mg/sms/send', [
            'headers' => [
                'X-API-Key' => $this->apiKey,
                'X-API-Secret' => $this->apiSecret,
            ],
            'json' => [
                'sender' => $this->senderName,
                'recipient' => $phone,
                'text' => $message,
            ],
            'timeout' => 10,
        ]);

        return $response->getStatusCode() === 200;
    }

    /**
     * Normalise un numéro malgache : retire les espaces/tirets,
     * convertit 03X XX XX XX en 261 3X XX XX XX.
     */
    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[\s\-\+]/', '', $phone) ?? '';

        if (str_starts_with($phone, '0') && strlen($phone) === 10) {
            $phone = '261' . substr($phone, 1);
        }

        return $phone;
    }
}
