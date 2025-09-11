const mysql = require('mysql2/promise');

const conection = mysql.createPool({
  host: 'localhost',
  user: 'hotel_app',
  password: '5123',
  database: 'project_hotelVacaBonita'
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
