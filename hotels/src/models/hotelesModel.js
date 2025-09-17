require('dotenv').config();
const mysql = require('mysql2/promise');
const axios = require('axios');

const conection = mysql.createPool({
  host: process.env.DB_HOST_HOTELS,
  user: process.env.DB_USER_HOTELS,
  password: process.env.DB_PASSWORD_HOTELS,
  database: process.env.DB_NAME_HOTELS
});

// Consultar todos los hoteles
async function traerHoteles() {
  const [rows] = await conection.query('SELECT * FROM hoteles');
  return rows;
}

// Consultar un hotel por id
async function traerHotel(id) {
  const [rows] = await conection.query('SELECT * FROM hoteles WHERE id = ?', [id]);
  return rows[0];
}

// Consultar un hotel por nombre
async function traerHotelNombre(nombre_hotel) {
  const [rows] = await conection.query('SELECT * FROM hoteles WHERE nombre_hotel = ?', [nombre_hotel]);
  return rows;
}

// Consultar un hotel por usuario
async function traerHotelUsuario(usuario) {
  const [rows] = await conection.query('SELECT * FROM hoteles WHERE usuario = ?', [usuario]);
  return rows;
}

// Crear un nuevo hotel (sin habitaciones)
async function crearHotel(hotel) {
  const { usuario, nombre_hotel, pais, ciudad } = hotel;

  const [result] = await conection.query(
    `INSERT INTO hoteles 
     (usuario, nombre_hotel, pais, ciudad)
     VALUES (?, ?, ?, ?)`,
    [usuario, nombre_hotel, pais, ciudad]
  );

  return result.insertId;
}

// Actualizar hotel por id
async function actualizarHotel(id, hotel) {
  const { usuario, nombre_hotel, pais, ciudad } = hotel;

  const [result] = await conection.query(
    `UPDATE hoteles SET
     usuario = ?, nombre_hotel = ?, pais = ?, ciudad = ?
     WHERE id = ?`,
    [usuario, nombre_hotel, pais, ciudad, id]
  );

  return result;
}

// Borrar hotel por id
async function borrarHotel(id) {
  const [result] = await conection.query('DELETE FROM hoteles WHERE id = ?', [id]);
  return result;
}

module.exports = {
  traerHoteles,
  traerHotel,
  crearHotel,
  actualizarHotel,
  borrarHotel,
  traerHotelNombre,
  traerHotelUsuario
};