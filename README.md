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
