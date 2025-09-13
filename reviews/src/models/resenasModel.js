const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'juanes2007',
    database: 'reseñas'
});

// Ver reseñas
async function traerresenas() {
    const result = await connection.query('SELECT * FROM reseñas_hoteles');
    return result[0];
}

// Traer reseñas de un usuario 
async function traerReseñaUsuario(usuario) {
    const result = await connection.query('SELECT * FROM reseñas_hoteles WHERE usuario = ?', usuario);
    return result[0];
}

// Traer reseñas de un hotel 
async function traerReseñaHotel(idhotel) {
    const result = await connection.query('SELECT * FROM reseñas_hoteles WHERE id_hotel = ?', [idhotel]);
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
        const result = await connection.query(
            `INSERT INTO reseñas_hoteles 
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
    const [result] = await connection.query(
        `SELECT 
            AVG(numero_estrellas) AS promedio_estrellas,
            AVG(puntaje_limpieza) AS promedio_limpieza,
            AVG(puntaje_facilidades) AS promedio_facilidades,
            AVG(puntaje_comodidades) AS promedio_comodidades
        FROM reseñas_hoteles
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
    const result = await connection.query('DELETE FROM reseñas_hoteles WHERE id = ?', id);
    return result[0].affectedRows > 0;
}

module.exports = {
    traerresenas,
    traerReseñaUsuario,
    traerReseñaHotel,
    crearReseña,
    calcularPromedioHotel,
    borrarReseña
};
