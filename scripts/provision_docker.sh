#!/usr/bin/env bash
set -e

echo "🚀 Instalando Docker en $(hostname)..."

sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Crear el directorio de llaves si no existe
sudo install -m 0755 -d /etc/apt/keyrings

# Descargar y convertir la clave GPG de Docker correctamente
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Asegurar permisos de lectura
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Agregar el repositorio de Docker (una sola línea)
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Actualizar e instalar Docker
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Permitir que el usuario vagrant use Docker sin sudo
sudo usermod -aG docker vagrant

# Habilitar y arrancar Docker
sudo systemctl enable --now docker

echo "✅ Docker instalado correctamente en $(hostname)"
