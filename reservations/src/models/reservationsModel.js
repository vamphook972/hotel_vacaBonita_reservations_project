const mysql = require('mysql2/promise');

const conection = mysql.conection({
  host: 'localhost',
  user: 'root',
  password: '5123',
  database: 'reservas'
});

async function getReservations() {
  const result = await conection.query('SELECT * FROM reservations');
  return result[0];
}

async function getReservationById(id) {
  const result = await conection.query('SELECT * FROM reservations WHERE id = ?', id);
  return result[0];
}

module.exports = {
  getReservations,
  getReservationById
};
