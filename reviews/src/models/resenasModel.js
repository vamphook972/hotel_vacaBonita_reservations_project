require('dotenv').config();
const mysql = require('mysql2/promise');


const conection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE
});


// Ver reseñas
async function traerresenas() {
    const result = await conection.query('SELECT * FROM resenas_hoteles');
    return result[0];
}


// Traer reseñas de un usuario
async function traerReseñaUsuario(usuario) {
    const result = await conection.query('SELECT * FROM resenas_hoteles WHERE usuario = ?', usuario);
    return result[0];
}


// Traer reseñas de un hotel
async function traerReseñaHotel(id_hotel) {
    const result = await conection.query('SELECT * FROM resenas_hoteles WHERE id_hotel = ?', [id_hotel]);
    return result[0];
}


// Traer reseñas de un hotel
async function traerReseñaHotelNombre(nombre_hotel) {
    const result = await conection.query('SELECT * FROM resenas_hoteles WHERE nombre_hotel = ?', [nombre_hotel]);
    return result[0];
}


// Crear reseña
async function crearReseña(reseña) {
    const {
        usuario,
        id_hotel,
        nombre_hotel,
        numero_estrellas,
        comentario,
        puntaje_limpieza,
        puntaje_facilidades,
        puntaje_comodidades
    } = reseña;


    try {
        const result = await conection.query(
            `INSERT INTO resenas_hoteles
            (usuario, id_hotel, nombre_hotel, numero_estrellas, comentario, puntaje_limpieza, puntaje_facilidades, puntaje_comodidades)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuario,
                id_hotel,
                nombre_hotel,
                numero_estrellas,
                comentario,
                puntaje_limpieza,
                puntaje_facilidades,
                puntaje_comodidades
            ]
        );


        return result;
    } catch (error) {
    console.error("Error en INSERT de reseña:", error); // imprime todo
    throw error;
    }
}


// Calcular promedio de calificaciones por hotel
async function calcularPromedioHotel(id_hotel) {
    const [result] = await conection.query(
        `SELECT
            ROUND(AVG(numero_estrellas),1) AS promedio_estrellas,
            ROUND(AVG(puntaje_limpieza),1) AS promedio_limpieza,
            ROUND(AVG(puntaje_facilidades),1) AS promedio_facilidades,
            ROUND(AVG(puntaje_comodidades),1) AS promedio_comodidades
        FROM resenas_hoteles
        WHERE id_hotel = ?`,
        [id_hotel]
    );


    return {
        promedio_estrellas: result[0].promedio_estrellas || 0,
        promedio_limpieza: result[0].promedio_limpieza || 0,
        promedio_facilidades: result[0].promedio_facilidades || 0,
        promedio_comodidades: result[0].promedio_comodidades || 0
    };
}




// Borrar reseñas
async function borrarReseña(id) {
    const result = await conection.query('DELETE FROM resenas_hoteles WHERE id = ?', id);
    return result[0].affectedRows > 0;
}


module.exports = {
    traerresenas,
    traerReseñaUsuario,
    traerReseñaHotel,
    crearReseña,
    calcularPromedioHotel,
    borrarReseña,
    traerReseñaHotelNombre
};