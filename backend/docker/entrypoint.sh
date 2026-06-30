#!/bin/sh
set -e

export APP_ENV=prod
export APP_DEBUG=0

# Génération des clés JWT si absentes
mkdir -p /var/www/html/config/jwt

if [ ! -f /var/www/html/config/jwt/private.pem ]; then
    echo "[entrypoint] Génération des clés JWT..."
    openssl genpkey -algorithm RSA \
        -out /var/www/html/config/jwt/private.pem \
        -pkeyopt rsa_keygen_bits:4096 \
        -pass pass:"${JWT_PASSPHRASE}"
    openssl pkey \
        -in /var/www/html/config/jwt/private.pem \
        -out /var/www/html/config/jwt/public.pem \
        -pubout \
        -passin pass:"${JWT_PASSPHRASE}"
    echo "[entrypoint] Clés JWT générées."
fi

# Migrations
echo "[entrypoint] Migrations..."
php /var/www/html/bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "[entrypoint] Démarrage..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
