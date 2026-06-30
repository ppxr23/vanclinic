#!/bin/sh
set -e

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

# Inject Railway PORT into nginx config (default to 80 for local dev)
export PORT="${PORT:-80}"
envsubst '${PORT}' < /etc/nginx/http.d/default.conf > /tmp/nginx.conf
mv /tmp/nginx.conf /etc/nginx/http.d/default.conf

echo "[entrypoint] Démarrage sur port $PORT..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
