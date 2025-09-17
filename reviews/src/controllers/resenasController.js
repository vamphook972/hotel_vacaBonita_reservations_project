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
router.get('/hotel/:idhotel', async (req, res) => {
    try {
        const idhotel = req.params.idhotel;

        //Verificar si existe el hotel
        const existe = await existeHotel(idhotel);
        if (!existe) {
            return res.status(404).json({ error: "Hotel no encontrado en el sistema externo" });
        }

        // Traer reseñas del hotel 
        const result = await resenasModel.traerReseñaHotel(idhotel);

        // Devolver reseñas
        res.json(result);
    } catch (error) {
        console.error("Error en /resenas/:hotel", error);
        res.status(500).json({ error: "Error al obtener resenas" });
    }
});

// Ver reseñas por hotel 
router.get('/hotel/:nombre_hotel', async (req, res) => {
    try {
        const nombre_hotel = req.params.nombre_hotel;

        //Verificar si existe el hotel
        const existe = await existeHotel(nombre_hotel);
        if (!existe) {
            return res.status(404).json({ error: "Hotel no encontrado en el sistema externo" });
        }

        // Traer reseñas del hotel 
        const result = await resenasModel.traerReseñaHotel(nombre_hotel);

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

        // Verificar hotel
        const hotelExiste = await existeHotel(nombre_hotel);
        if (!hotelExiste) {
            return res.status(404).json({ error: 'Hotel no encontrado en el sistema' });
        }

        // Verificar rol del usuario
        const usuarioCliente = await clienteUsuario(usuario);
        if (!usuarioCliente) {
            return res.status(403).json({ error: 'Solo los clientes pueden dejar reseñas' });
        }


        // Crear reseña
        const reseña = {
            usuario,
            nombre_hotel,
            numero_estrellas: calificacion,
            comentario: comentario || null,
            puntaje_limpieza,
            puntaje_facilidades,
            puntaje_comodidades
        };

        const nuevaReseña = await resenasModel.crearReseña(reseña);

        // Recalcular promedio (sin actualizar en hoteles)
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
async function existeHotel(hotel) {
    try {
        const response = await axios.get(`http://localhost:3002/hoteles/nombre/${hotel}`);
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