#!/bin/bash
# Génère les clés RSA pour LexikJWTAuthenticationBundle
# Usage : ./bin/generate-jwt-keys.sh

set -e

JWT_DIR="config/jwt"
PASSPHRASE="${JWT_PASSPHRASE:-ChangeThisPassphraseInProduction}"

mkdir -p "$JWT_DIR"

echo "Génération de la clé privée RSA..."
openssl genpkey -out "$JWT_DIR/private.pem" -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:"$PASSPHRASE"

echo "Génération de la clé publique RSA..."
openssl pkey -in "$JWT_DIR/private.pem" -out "$JWT_DIR/public.pem" -pubout -passin pass:"$PASSPHRASE"

chmod 644 "$JWT_DIR/public.pem"
chmod 600 "$JWT_DIR/private.pem"

echo "✓ Clés JWT générées dans $JWT_DIR/"
echo "  - $JWT_DIR/private.pem (lecture seule pour l'application)"
echo "  - $JWT_DIR/public.pem"
echo ""
echo "Pensez à définir JWT_PASSPHRASE dans .env.local si différente de la valeur par défaut."
