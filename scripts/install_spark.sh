#!/bin/bash

# Definir versiones
JAVA_VERSION="18"

echo "Instalando Apache Spark ${SPARK_VERSION}..."

# Actualizar repositorios
sudo apt-get update

# Instalar Java
echo "Instalando Java ${JAVA_VERSION}..."
sudo apt-get install -y openjdk-${JAVA_VERSION}-jdk

cat <<EOF | sudo tee /etc/profile.d/jdk18.sh
export JAVA_HOME=/usr/lib/jvm/java-1.18.0-openjdk-amd64
export PATH=\$PATH:\$JAVA_HOME/bin
EOF

source /etc/profile.d/jdk18.sh

wget https://dlcdn.apache.org/spark/spark-3.5.7/spark-3.5.7-bin-hadoop3.tgz

tar -xvzf /home/vagrant/spark-3.5.1-bin-hadoop3.tgz

rm spark-3.5.1-bin-hadoop3.tgz
