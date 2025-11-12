# Hotel Vaca Bonita - Reservation System

Hotel reservation management system developed with microservices architecture. Allows customers to make reservations, hotel administrators to manage their establishments and rooms, and agency administrators to oversee the entire system.

## Description

Educational project that implements a microservices architecture using Node.js and Express for the backend, PHP for the web interface, and MySQL as the database. The system is containerized with Docker and can be deployed using Docker Compose or Vagrant.

## Main Features

- **User Management**: Authentication system with three user types (client, admin_hotel, admin_agencia)
- **Hotel Management**: Creation and administration of hotels with active/inactive states
- **Room Management**: Room control per hotel (standard, deluxe, suite) with availability
- **Reservation System**: Reservations with availability validation, automatic cost calculation and states (pending, confirmed, cancelled, finished)
- **Review System**: Customers can rate hotels with stars and scores for cleanliness, facilities and amenities
- **Web Interface**: Differentiated administration panel according to user type

## Architecture

The project is divided into 5 independent microservices:

- **Users** (Port 3001): User management and authentication
- **Hotels** (Port 3002): Hotel management
- **Reservations** (Port 3003): Reservation management with automatic validations
- **Reviews** (Port 3004): Review and rating management
- **Rooms** (Port 3005): Room management

The web interface (microweb) runs on PHP and consumes the REST APIs from the microservices.

## Technologies

- **Backend**: Node.js, Express.js
- **Frontend**: PHP, TailwindCSS
- **Database**: MySQL 8.0
- **Containerization**: Docker, Docker Compose
- **Development**: Vagrant (Ubuntu 22.04)

## Project Structure

```
├── db/                    # Database initialization scripts
├── hotels/                # Hotels microservice
├── reservations/          # Reservations microservice
├── reviews/               # Reviews microservice
├── rooms/                 # Rooms microservice
├── users/                 # Users microservice
├── microweb/              # PHP web interface
├── scripts/               # Provisioning scripts
├── docker-compose.yml     # Orchestration configuration
└── Vagrantfile            # Virtual machines configuration
```

## Steps for project implementation
We used 3 diferents machines to the cluster:

```
├── ubuntuServer1 --> (worker)
├── ubuntuServer2 --> (master)
├── ubuntuServer3 --> (worker)
```

We recomend to have 3 terminals open to run the comands, in fact we specify which machine need each comand

### 1) Run vagrant machines
```bash
vagrant up
```

### 2) Enter to the machines
**- servidorUbuntu1**
```bash
vagrant ssh servidorUbuntu1
```

```bash
cd /vagrant
```
---
**- servidorUbuntu2**
```bash
vagrant ssh servidorUbuntu2
```

```bash
cd /vagrant
```
---
**- servidorUbuntu3**
```bash
vagrant ssh servidorUbuntu3
```

```bash
cd /vagrant
```

### 3) Start docker swarm cluster
#### Start master
**- servidorUbuntu2**
```bash
docker swarm init --advertise-addr 192.168.100.3
```

#### Start workers
**- servidorUbuntu1**
```bash
docker swarm join --token "token" 192.168.100.3:2377
```
**- servidorUbuntu3**
```bash
docker swarm join --token "token" 192.168.100.3:2377
```

### 4) Deploy container services
**- servidorUbuntu2**
```bash
docker stack deploy -c docker-compose.yml stack_hotel_vacaBonita
```

### 5) Check
#### Docker services
**- servidorUbuntu2**
```bash
docker service ls
```

#### Web project
Go to web and search
```
http://192.168.100.3:8080
```
You will see somenthing like this:


#### Haproxy

Go to web and search 
```
http://192.168.100.3:8404/haproxy?stats
```
**user**: admin

**pasword**: admin

---

You will see somenthing like this:

#### 

## Steps for distributed analysis
We used 3 diferents machines to the cluster:

```
├── ubuntuServer1 --> (worker)
├── ubuntuServer2 --> (master)
├── ubuntuServer3 --> (worker)
```

We recomend to have 3 terminals open to run the comands, in fact we specify which machine need each comand


### 1) start spark cluster
#### start master
**-servidorUbuntu2**
```bash
cd labSpark/spark-3.5.0-bin-hadoop3/sbin/
```

```bash
./start-master.sh
```

#### start workers
**-servidorUbuntu1**
```bash
./start-worker.sh spark://192.168.100.3:7077
```

**-servidorUbuntu3**
```bash
./start-worker.sh spark://192.168.100.3:7077
```

### 2) run distributed analysis
**-servidorUbuntu2**
```bash
./spark-submit --master spark://192.168.100.3:7077 /home/vagrant/labSpark/dataset_proyecto/app_hotel_analytics.py
```
