const mysql = require('mysql2/promise');
const axios = require('axios');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'salo',
  database: 'hoteles',
  port: 3306
});

// Consultar todos los hoteles
async function traerHoteles() {
  const [rows] = await connection.query('SELECT * FROM hoteles');
  return rows;
}

// Consultar un hotel por id
async function traerHotel(id) {
  const [rows] = await connection.query('SELECT * FROM hoteles WHERE id = ?', [id]);
  return rows[0];
}

// Crear habitaciones base con precios y cantidades 
async function crearHabitacionesBase(id_hotel, costo_habitacion, cantidad_habitaciones) {
  const configuracion = {
    estandar: { numero_ocupantes: 2, base: 100 },
    deluxe:   { numero_ocupantes: 3, base: 200 },
    suite:    { numero_ocupantes: 4, base: 300 }
  };

  for (const tipo in costo_habitacion) {
    const cantidad = cantidad_habitaciones[tipo] || 0;
    const { numero_ocupantes, base } = configuracion[tipo];

    for (let i = 0; i < cantidad; i++) {
      const numero_habitacion = base + i + 1;

      const habitacion = {
        tipo_habitacion: tipo,
        estado: 'libre',
        numero_ocupantes,
        costo_habitacion: costo_habitacion[tipo],
        numero_habitacion,
        id_hotel
      };

      try {
        await axios.post('http://localhost:3005/habitaciones', habitacion);
      }  catch (error) {
  console.error(`❌ Error al crear habitación ${tipo} ${numero_habitacion}:`, error.response?.data || error.message);
  throw error; 
}

    }
  }
}

// Crear un nuevo hotel y sus habitaciones base
async function crearHotel(hotel) {
  const {
    usuario,
    nombre_hotel,
    pais,
    ciudad,
    costo_habitacion,
    cantidad_habitaciones
  } = hotel;

  const [result] = await connection.query(
    `INSERT INTO hoteles 
     (usuario, nombre_hotel, pais, ciudad)
     VALUES (?, ?, ?, ?)`,
    [usuario, nombre_hotel, pais, ciudad]
  );

  const id_hotel = result.insertId;

  await crearHabitacionesBase(id_hotel, costo_habitacion, cantidad_habitaciones);

  return id_hotel;
}

// Actualizar hotel por id
async function actualizarHotel(id, hotel) {
  const { usuario, nombre_hotel, pais, ciudad } = hotel;

  const [result] = await connection.query(
    `UPDATE hoteles SET
     usuario = ?, nombre_hotel = ?, pais = ?, ciudad = ?
     WHERE id = ?`,
    [usuario, nombre_hotel, pais, ciudad, id]
  );

  return result;
}

// Borrar hotel por id
async function borrarHotel(id) {
  const [result] = await connection.query('DELETE FROM hoteles WHERE id = ?', [id]);
  return result;
}

module.exports = {
  traerHoteles,
  traerHotel,
  crearHotel,
  actualizarHotel,
  borrarHotel
};