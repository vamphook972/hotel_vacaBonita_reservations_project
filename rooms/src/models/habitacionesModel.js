require('dotenv').config();
const mysql = require('mysql2/promise');

const conection = mysql.createPool({
  host: process.env.DB_HOST_ROOMS,
  user: process.env.DB_USER_ROOMS,
  password: process.env.DB_PASSWORD_ROOMS,
  database: process.env.DB_NAME_ROOMS
});

async function traerHabitaciones() {
    const result = await conection.query('SELECT * FROM habitaciones');
    return result[0];
}
async function traerHabitacion(id_habitacion) {
    const result = await conection.query('SELECT * FROM habitaciones WHERE id_habitacion = ?', id_habitacion);
    return result[0];
}

async function traerHabitacionHotel(id_hotel) {
    const result = await conection.query('SELECT * FROM habitaciones WHERE id_hotel = ?', id_hotel);
    return result[0];
}

async function traerHabitacionHotelEstado(id_hotel, estado) {
    const [result] = await conection.query(
        'SELECT * FROM habitaciones WHERE id_hotel = ? AND estado = ?',
        [id_hotel, estado]
    );
    return result;
}



async function crearHabitacion(tipo_habitacion, numero_ocupantes, costo_habitacion, numero_habitacion, id_hotel ) {
    //Validar que no falten datos obligatorios
    if (!tipo_habitacion || !numero_ocupantes || !costo_habitacion || !numero_habitacion || !id_hotel) {
        throw new Error('Faltan datos obligatorios para crear la habitación');
    }
    // Validar que numero_ocupantes y costo_habitacion sean positivos
    if (numero_ocupantes <= 0) {
        throw new Error('El número de ocupantes debe ser mayor a 0');
    }
    if (costo_habitacion <= 0) {
        throw new Error('El costo de la habitación debe ser mayor a 0');
    }

     // Verificar si ya existe la habitación en ese hotel
    const [rows] = await conection.query(
        'SELECT * FROM habitaciones WHERE numero_habitacion = ? AND id_hotel = ?',
        [numero_habitacion, id_hotel]
    );

    if (rows.length > 0) {
        throw new Error('Ya existe una habitación con ese número en este hotel');
    }
    //SI NO EXISTE:INSERTAR HABITACION
    const result = await conection.query(
  'INSERT INTO habitaciones (tipo_habitacion, estado, numero_ocupantes, costo_habitacion, numero_habitacion, id_hotel) VALUES (?,?,?,?,?,?)',
  [tipo_habitacion, 'libre', numero_ocupantes, costo_habitacion, numero_habitacion, id_hotel]);
    console.log(`Habitación ${numero_habitacion} insertada en hotel ${id_hotel}`);
    return result;
}

async function actualizarHabitacion(id_habitacion, estado) {
    const result = await conection.query('UPDATE habitaciones SET estado = ? WHERE id_habitacion = ?', [estado, id_habitacion]);
    return result;
}

async function eliminarHabitacion(id_habitacion) {
    const result = await conection.query('DELETE FROM habitaciones WHERE id_habitacion = ?', [id_habitacion]);
    return result;
}




module.exports = {
    traerHabitaciones, 
    traerHabitacion, 
    crearHabitacion, 
    actualizarHabitacion,
    eliminarHabitacion, 
    traerHabitacionHotel, 
    traerHabitacionHotelEstado
};