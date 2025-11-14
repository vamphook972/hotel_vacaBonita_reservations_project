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
## Steps for start machines
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
## Steps for project implementation
### 1) Start docker swarm cluster
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

### 2) Deploy container services
**- servidorUbuntu2**
```bash
docker stack deploy -c docker-compose.yml stack_hotel_vacaBonita
```

### 3) Check
#### Docker services
**- servidorUbuntu2**
```bash
docker service ls
```

<img width="1562" height="218" alt="image" src="https://github.com/user-attachments/assets/1c8550ed-3580-4df0-8dcb-2b76b84b4df5" />



#### Web project
Go to web and search
```
http://192.168.100.3:8282
```
You will see somenthing like this:

<img width="1280" height="858" alt="image" src="https://github.com/user-attachments/assets/03f408e3-9cd7-4f06-944e-21beda8772ea" />


#### Haproxy

Go to web and search 
```
http://192.168.100.3:8404/haproxy?stats
```
**user**: admin

**pasword**: admin123

---

You will see somenthing like this:

<img width="1280" height="643" alt="image" src="https://github.com/user-attachments/assets/6cc75958-8ce0-492a-9a8f-27af4b2d0b5f" />


#### 

## Steps for distributed analysis
### 1) Start spark cluster
#### Start master
**- servidorUbuntu2**
```bash
cd ~/spark-3.5.7-bin-hadoop3/sbin
```

```bash
sudo ./start-master.sh
```
---
#### Start workers
**- servidorUbuntu1**
```bash
cd ~/spark-3.5.7-bin-hadoop3/sbin
```
```bash
sudo ./start-worker.sh spark://192.168.100.3:7077
```
**- servidorUbuntu3**
```bash
cd ~/spark-3.5.7-bin-hadoop3/sbin
```
```bash
sudo ./start-worker.sh spark://192.168.100.3:7077
```

### 2) Run distributed analysis
first remove the old analysis in order to do not have problems

**- servidorUbuntu2**
```bash
sudo rm -rf /vagrant/dataset/resultados_proyecto
```
```bash
cd ~/spark-3.5.7-bin-hadoop3/bin/
```
```bash
./spark-submit --master spark://192.168.100.3:7077 /vagrant/dataset/app_hotel_analytics.py
```

#### 3) Check

- Spark service
Go to web and search
```
http://192.168.100.3:8080
```

<img width="1434" height="788" alt="image" src="https://github.com/user-attachments/assets/6fbde144-9253-4077-ab19-f280c2d4d54c" />



- see analytics 
Go to web and search
```
http://192.168.100.3:8282
```

Create an agency admin (Administrador agencia)

<img width="889" height="860" alt="image" src="https://github.com/user-attachments/assets/b451f155-27ee-4e4d-adc3-aced8402e333" />

---
Go to "ver estadisticas"

<img width="1280" height="407" alt="image" src="https://github.com/user-attachments/assets/36b79c26-a46f-46e4-86af-d68cd8fe13bd" />

---
If everything is working you will see something like this:

<img width="1022" height="871" alt="image" src="https://github.com/user-attachments/assets/61455175-4bf0-4507-b7d0-c99aeb33c1ad" />
