require('dotenv').config();
const mysql = require('mysql2/promise');


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
// Consultar hoteles por estado
async function traerHotelesPorEstado(estado) {
  const sql = `SELECT * FROM hoteles WHERE estado = ?`;
  const [rows] = await conection.query(sql, [estado]);
  return rows;
}


// Crear un nuevo hotel (sin habitaciones)
async function crearHotel(hotel) {
  const { usuario, nombre_hotel, pais, ciudad, estado = 'activo'} = hotel;


  const [result] = await conection.query(
    `INSERT INTO hoteles
     (usuario, nombre_hotel, pais, ciudad, estado)
     VALUES (?, ?, ?, ?, ?)`,
    [usuario, nombre_hotel, pais, ciudad, estado]
  );


  return result.insertId;
}


// Actualizar hotel por id
async function actualizarHotel(id, estado,) {
  const sql = `
  UPDATE hoteles SET
     estado = ?
     WHERE id = ?`;
  const [result] = await conection.query(sql, [estado, id]);
  return result;      
}


module.exports = {
  traerHoteles,
  traerHotel,
  traerHotelesPorEstado,
  crearHotel,
  actualizarHotel,
};
