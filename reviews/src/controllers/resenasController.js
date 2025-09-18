const express = require('express');
const router = express.Router();
const axios = require('axios');
const resenasModel = require('../models/resenasModel');


// Ver todas las reseñas
router.get('/', async (req, res) => {
    var result;
    result = await resenasModel.traerresenas() ;
    res.json(result);
});


// Ver reseñas por usuario
router.get('/usuario/:usuario', async (req, res) => {
    try {
        const usuario = req.params.usuario;


        //Verificar si existe el usuario
        const existe = await existeUsuario(usuario);
        if (!existe) {
            return res.status(404).json({ error: "Usuario no encontrado en el sistema externo" });
        }


        //Traer reseñas del usuario
        const result = await resenasModel.traerReseñaUsuario(usuario);


        // Devolver reseñas
        res.json(result);
    } catch (error) {
        console.error("Error en /resenas/:usuario", error);
        res.status(500).json({ error: "Error al obtener resenas" });
    }
});


// Ver reseñas por hotel
router.get('/hotel/:id_hotel', async (req, res) => {
    try {
        const id_hotel = req.params.id_hotel;


        // Verificar si existe el hotel en la API de hoteles
        const existe = await existeHotel(id_hotel);
        if (!existe) {
            return res.status(404).json({ error: "Hotel no encontrado en el sistema externo" });
        }


        // Traer reseñas del hotel
        const result = await resenasModel.traerReseñaHotel(id_hotel);


        res.json(result);
    } catch (error) {
        console.error("Error en GET /resenas/hotel/:id_hotel:", error);
        res.status(500).json({ error: "Error al obtener reseñas" });
    }
});


// Ver reseñas por hotel
router.get('/hotel/nombre/:nombre_hotel', async (req, res) => {
    try {
        const nombre_hotel = req.params.nombre_hotel;


        //Verificar si existe el hotel
        const existe = await existeHotelNombre(nombre_hotel);
        if (!existe) {
            return res.status(404).json({ error: "Hotel no encontrado en el sistema externo" });
        }


        // Traer reseñas del hotel
        const result = await resenasModel.traerReseñaHotelNombre(nombre_hotel);


        // Devolver reseñas
        res.json(result);
    } catch (error) {
        console.error("Error en /resenas/:hotel", error);
        res.status(500).json({ error: "Error al obtener resenas"});
    }
});


// Crear reseña
router.post('/', async (req, res) => {
    try {
        const { usuario, nombre_hotel, calificacion, comentario, puntaje_limpieza, puntaje_facilidades, puntaje_comodidades } = req.body;

        // Validar calificación
        if (!calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ error: 'La calificación es obligatoria y debe estar entre 1 y 5' });
        }

        // Validar puntajes
        if (!puntaje_limpieza || puntaje_limpieza < 1 || puntaje_limpieza > 10) {
            return res.status(400).json({ error: 'El puntaje de limpieza es obligatorio y debe estar entre 1 y 10' });
        }
        if (!puntaje_facilidades || puntaje_facilidades < 1 || puntaje_facilidades > 10) {
            return res.status(400).json({ error: 'El puntaje de facilidades es obligatorio y debe estar entre 1 y 10' });
        }
        if (!puntaje_comodidades || puntaje_comodidades < 1 || puntaje_comodidades > 10) {
            return res.status(400).json({ error: 'El puntaje de comodidades es obligatorio y debe estar entre 1 y 10' });
        }

        // Verificar usuario
        const usuarioExiste = await existeUsuario(usuario);
        if (!usuarioExiste) {
            return res.status(404).json({ error: 'Usuario no encontrado en el sistema' });
        }

        // Verificar rol del usuario
        const usuarioCliente = await clienteUsuario(usuario);
        if (!usuarioCliente) {
            return res.status(403).json({ error: 'Solo los clientes pueden dejar reseñas' });
        }

        // Verificar hotel
        const hotelExiste = await existeHotelNombre(nombre_hotel);
        if (!hotelExiste) {
            return res.status(404).json({ error: 'Hotel no encontrado en el sistema' });
        }

        // Obtener hotel por nombre (devuelve un objeto, no un array)
        const responseHotel = await axios.get(`http://localhost:3002/hoteles/nombre/${nombre_hotel}`);
        const hotel = responseHotel.data;

        if (!hotel || !hotel.id) {
            return res.status(404).json({ error: 'Hotel no encontrado en el sistema' });
        }

        // Validar estado del hotel
        if (hotel.estado !== 'activo') {
            return res.status(403).json({ error: `El hotel está '${hotel.estado}', no se pueden dejar reseñas` });
        }

        const id_hotel = hotel.id;

        // Validar que el usuario tuvo reservas en este hotel y ya finalizaron
        const responseReservas = await axios.get(`http://localhost:3003/reservations/user/${usuario}`);
        const reservasUsuario = responseReservas.data || [];

        // Filtrar solo reservas de ese hotel
        const reservasHotel = reservasUsuario.filter(r => r.id_hotel == id_hotel);

        if (reservasHotel.length === 0) {
            return res.status(403).json({ error: 'No puedes dejar una reseña si no has reservado en este hotel' });
        }

        // Revisar si al menos una reserva ya terminó
        const hoy = new Date();
        const tuvoEstancia = reservasHotel.some(r => new Date(r.end_date) < hoy);

        if (!tuvoEstancia) {
            return res.status(403).json({ error: 'Solo puedes dejar una reseña después de finalizar tu estancia' });
        }

        // (Opcional) Validar que el usuario no haya dejado ya reseña en este hotel
        const reseñasPrevias = await resenasModel.traerReseñaHotel(id_hotel);
        const yaReseño = reseñasPrevias.some(r => r.usuario === usuario);
        if (yaReseño) {
            return res.status(403).json({ error: 'Ya has dejado una reseña para este hotel' });
        }

        // Crear reseña
        const reseña = {
            usuario,
            id_hotel,
            nombre_hotel,
            numero_estrellas: calificacion,
            comentario: comentario || null,
            puntaje_limpieza,
            puntaje_facilidades,
            puntaje_comodidades
        };

        const nuevaReseña = await resenasModel.crearReseña(reseña);

        // Recalcular promedio
        const nuevoPromedio = await resenasModel.calcularPromedioHotel(nombre_hotel);

        return res.status(201).json({
            mensaje: "Reseña creada exitosamente",
            reseña: nuevaReseña,
            promedio_actualizado: nuevoPromedio
        });

    } catch (error) {
        console.error("Error al crear la reseña COMPLETO:", error);
        return res.status(500).json({
            error: error.sqlMessage || error.message || "Error interno del servidor"
        });
    }
});



// Obtener promedios de calificaciones para un hotel
router.get('/promedios/:id_hotel', async (req, res) => {
  try {
    const { id_hotel } = req.params;


    // Modelo que calcula promedios por hotel
    const promedios = await resenasModel.calcularPromedioHotel(id_hotel);


    if (!promedios) {
      return res.status(404).json({ error: "No hay reseñas para este hotel" });
    }


    res.json(promedios);
  } catch (error) {
    console.error("Error en GET /resenas/promedios/:id_hotel:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
});


// Borrar reseñas
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const borrado = await resenasModel.borrarReseña(id);


        if (!borrado) {
            return res.status(404).json({ error: "Reseña no encontrada" });
        }


        res.json({ mensaje: "Reseña eliminada correctamente" });
    } catch (error) {
        console.error("Error al borrar la reseña:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// Verificar si un usuario existe
async function existeUsuario(usuario) {
    try {
        const response = await axios.get(`http://localhost:3001/usuarios/${usuario}`);
        return response.data && Object.keys(response.data).length > 0;
        // true si la API devolvió datos, false si no
    } catch (error) {
        console.error("Error al verificar usuario en API externa:", error.message);
        return false; // si la API falla, asumimos que no existe
    }
}


// Verificar si un hotel existe
async function existeHotelNombre(nombre_hotel) {
    try {
        const response = await axios.get(`http://localhost:3002/hoteles/nombre/${nombre_hotel}`);
        // Devuelve true si vino un objeto con id
        return response.data && response.data.id;
    } catch (error) {
        console.error("Error al verificar hotel en API externa:", error.message);
        return false;
    }
}



// Verificar si un hotel existe
async function existeHotel(id_hotel) {
    try {
        const response = await axios.get(`http://localhost:3002/hoteles/${id_hotel}`);
        return response.data && Object.keys(response.data).length > 0;
        // true si la API devolvió datos, false si no
    } catch (error) {
        console.error("Error al verificar hotel en API externa:", error.message);
        return false; // si la API falla, asumimos que no existe
    }
}


// Verificar que el usuario sea cliente
async function clienteUsuario(id_usuario) {
    try {
        const response = await axios.get(`http://localhost:3001/usuarios/${id_usuario}`);
        const usuario = response.data;


        if (usuario && usuario.tipo_usuario === "cliente") {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error al verificar usuario en API externa:", error.message);
        return false; // si la API falla o no existe, asumimos que no es cliente
    }
}


module.exports = router;
