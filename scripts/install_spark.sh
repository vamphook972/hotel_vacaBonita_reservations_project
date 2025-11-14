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

wget https://dlcdn.apache.org/spark/spark-3.5.7/spark-3.5.7-bin-hadoop3.tgz /home/vagrant/

tar -xvzf /home/vagrant/spark-3.5.7-bin-hadoop3.tgz

rm spark-3.5.7-bin-hadoop3.tgz

# Configurar Spark
echo "Configurando Spark..."
SPARK_DIR="spark-3.5.7-bin-hadoop3"
LOCAL_IP=$(hostname -I | awk '{print $2}')
MASTER_IP="192.168.100.3"

cd ${SPARK_DIR}/conf/
cp spark-env.sh.template spark-env.sh

# Agregar configuración de IP al archivo spark-env.sh
cat >> spark-env.sh <<EOF

# Configuración de red
export SPARK_LOCAL_IP=${LOCAL_IP}
export SPARK_MASTER_HOST=${MASTER_IP}
EOF

echo "Spark configurado con IP local: ${LOCAL_IP} y Master: ${MASTER_IP}"
cd -
