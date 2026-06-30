FROM php:8.3-fpm-alpine

# Installation des dépendances système
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    icu-dev \
    postgresql-dev \
    oniguruma-dev \
    autoconf \
    g++ \
    make \
    bash \
    linux-headers

# Extensions PHP nécessaires pour Symfony + PostgreSQL
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    intl \
    opcache \
    mbstring

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Symfony CLI (utile pour les commandes locales)
RUN curl -sS https://get.symfony.com/cli/installer | bash && \
    mv /root/.symfony*/bin/symfony /usr/local/bin/symfony

# Configuration PHP pour le dev
RUN echo "memory_limit=512M" > /usr/local/etc/php/conf.d/memory.ini && \
    echo "upload_max_filesize=20M" > /usr/local/etc/php/conf.d/uploads.ini && \
    echo "post_max_size=20M" >> /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www/html

# L'utilisateur www-data existe déjà, on lui donne les bonnes permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
