CREATE DATABASE IF NOT EXISTS agencia;
USE agencia;

CREATE TABLE IF NOT EXISTS usuarios (
  nombre VARCHAR(25) NOT NULL,
  tipo_usuario ENUM('cliente', 'admin_hotel', 'admin_agencia') NOT NULL,
  genero ENUM('masculino', 'femenino') NOT NULL,
  pais VARCHAR(20) NOT NULL,
  usuario VARCHAR(30) NOT NULL,
  password VARCHAR(35) NOT NULL,
  email VARCHAR(25) NOT NULL UNIQUE,
  PRIMARY KEY (usuario)
);

CREATE TABLE IF NOT EXISTS hoteles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(100) NOT NULL,
    nombre_hotel VARCHAR(200) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    ciudad_direccion VARCHAR(100) NOT NULL,
    estado ENUM('activo', 'inactivo') NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user VARCHAR(100) NOT NULL,
    id_hotel INT NOT NULL,
    occupants_number INT NOT NULL,
    id_room INT NOT NULL,            
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    state ENUM('pending', 'confirm', 'cancelled', 'finished') NOT NULL,
    cost DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS reseñas_hoteles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    id_hotel INT NOT NULL,
    nombre_hotel VARCHAR(200) NOT NULL,
    numero_estrellas INT NOT NULL CHECK (numero_estrellas BETWEEN 1 AND 5),
    comentario TEXT NULL,
    puntaje_limpieza FLOAT NOT NULL CHECK (puntaje_limpieza BETWEEN 1 AND 10),
    puntaje_facilidades FLOAT NOT NULL CHECK (puntaje_facilidades BETWEEN 1 AND 10),
    puntaje_comodidades FLOAT NOT NULL CHECK (puntaje_comodidades BETWEEN 1 AND 10)
);

CREATE TABLE IF NOT EXISTS habitaciones (
    id_habitacion INT AUTO_INCREMENT PRIMARY KEY,
    tipo_habitacion ENUM('estandar', 'deluxe', 'suite') NOT NULL,
    estado ENUM('libre', 'ocupada') NOT NULL,
    numero_ocupantes INT NOT NULL,
    costo_habitacion DECIMAL(10,2) NOT NULL,
    numero_habitacion INT NOT NULL,
    id_hotel INT NOT NULL
);

