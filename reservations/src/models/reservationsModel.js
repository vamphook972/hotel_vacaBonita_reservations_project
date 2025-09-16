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
  const result = await conection.query('SELECT * FROM reservations WHERE id = ?', [id]);
  return result[0];
}

async function updateReservationState(id, state) {
  const result = await conection.query('UPDATE reservations SET state = ? WHERE id = ?', [state, id]);
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

  
  const result = await conection.query('INSERT INTO reservations (user, id_hotel, occupants_number, id_room, start_date, end_date, state, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [user, id_hotel, occupants_number, id_room, start_date, end_date, state, cost]);
  return result;
}


async function updateReservation(id, data) {
  const fields = [];
  const values = [];

  // user is immutable for updateReservation
  if (data.id_hotel !== undefined) { fields.push('id_hotel = ?'); values.push(data.id_hotel); }
  if (data.occupants_number !== undefined) { fields.push('occupants_number = ?'); values.push(data.occupants_number); }
  if (data.id_room !== undefined) { fields.push('id_room = ?'); values.push(data.id_room); }
  if (data.start_date !== undefined) { fields.push('start_date = ?'); values.push(data.start_date); }
  if (data.end_date !== undefined) { fields.push('end_date = ?'); values.push(data.end_date); }
  if (data.cost !== undefined) { fields.push('cost = ?'); values.push(data.cost); }
  // state is immutable for updateReservation

  values.push(id);
  const sql = `UPDATE reservations SET ${fields.join(', ')} WHERE id = ?`;
  const result = await conection.query(sql, values);
  return result[0];
}

async function getReservationsByUser(user) {
  const result = await conection.query('SELECT * FROM reservations WHERE user = ?', [user]);
  return result[0];
}

async function getReservationsByHotel(id_hotel) {
  const result = await conection.query('SELECT * FROM reservations WHERE id_hotel = ?', [id_hotel]);
  return result[0];
}

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservationState,
  updateReservation,
  getReservationsByUser,
  getReservationsByHotel
};
