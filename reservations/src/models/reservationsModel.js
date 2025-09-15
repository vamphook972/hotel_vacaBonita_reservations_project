// dotnev for the data base conection
require('dotenv').config();
const mysql = require('mysql2/promise');

// configure conection with .env file
const conection = mysql.createPool({
  host: process.env.DB_HOST_RESERVATIONS,
  user: process.env.DB_USER_RESERVATIONS,
  password: process.env.DB_PASSWORD_RESERVATIONS,
  database: process.env.DB_NAME_RESERVATIONS
});

async function getReservations() {
  const result = await conection.query('SELECT * FROM reservations');
  return result[0];
}

async function getReservationById(id) {
  const result = await conection.query('SELECT * FROM reservations WHERE id = ?', id);
  return result[0];
}

async function createReservation(reservation) {
  const user = reservation.user;
  const id_hotel = reservation.id_hotel;
  const occupants_number = reservation.occupants_number;
  const id_room = reservation.id_room;
  const start_date = reservation.start_date;
  const end_date = reservation.end_date;
  const state = reservation.state;
  const cost = reservation.cost;

  
  const result = await conection.query('INSERT INTO reservations (user, id_hotel, occupants_number, id_room, start_date, end_date, cost, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [user, id_hotel, occupants_number, id_room, start_date, end_date, state, cost]);
  return result;
}

module.exports = {
  getReservations,
  getReservationById,
  createReservation
};
