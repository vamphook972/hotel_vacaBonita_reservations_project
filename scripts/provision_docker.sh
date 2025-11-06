#!/usr/bin/env bash
set -e

echo "🚀 Instalando Docker en $(hostname)..."

sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Añadir la clave GPG oficial de Docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Añadir el repositorio de Docker (una sola línea)
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Permitir que el usuario 'vagrant' use Docker sin sudo
sudo usermod -aG docker vagrant

sudo systemctl enable --now docker

echo "✅ Docker instalado correctamente en $(hostname)"
