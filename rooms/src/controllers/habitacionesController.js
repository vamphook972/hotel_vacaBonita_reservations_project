const { Router } = require('express');
const router = Router();
const habitacionesModel = require('../models/habitacionesModel');

//MOSTRAR HABITACIONES
router.get('/habitaciones', async (req, res) => {
    try{
        const result = await habitacionesModel.traerHabitaciones();
        //console.log(result);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener habitaciones:', error.message);
        res.status(500).send('Error al obtener habitaciones');
    }
});

//MOSTRAR HABITACIONES POR ID
router.get('/habitaciones/:id_habitacion', async (req, res) => {
    try{
        const id_habitacion = req.params.id_habitacion;
        const result = await habitacionesModel.traerHabitacion(id_habitacion);
        //console.log(result);
        if (result.length === 0) {
            // Si no existe la habitación
            return res.status(404).json({ message: `No se encontró la habitación con id ${id_habitacion}` });
        }
        res.json(result[0]);
    } catch (error) {
        console.error('Error al obtener habitación:', error.message);
        res.status(500).send('Error al obtener la habitación');
    }
});

//MOSTRAR HABITACIONES POR ID HOTEL
router.get('/habitacionesHotel/:id_hotel', async (req, res) => {
    try{
        const id_hotel = req.params.id_hotel;
        const result = await habitacionesModel.traerHabitacionHotel(id_hotel);
        
        if (result.length === 0) {
            // Si no existe la habitación
            return res.status(404).json({ message: `No se encontraron habitaciones para el hotel con id ${id_hotel}` });
        }
        //console.log(result);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener habitaciones del hotel:', error.message);
        res.status(500).send('Error al obtener habitaciones del hotel');
    }
});

//MOSTRAR HABITACIONES POR estado
router.get('/habitacionesEstado/:estado', async (req, res) => {
    try{
        const estado = req.params.estado.toLowerCase();

        // 1. Validar estados inválidos
        if (estado !== 'libre' && estado !== 'ocupada') {
        return res.status(400).json({ 
            message: "El estado debe ser 'libre' o 'ocupada'" 
        });
        }

        const result = await habitacionesModel.traerHabitacionEstado(estado);

        if (result.length === 0) {
            return res.status(404).json({ 
                message: `No se encontraron habitaciones con estado ${estado}`});
        }

        //console.log(result);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener habitaciones por estado:', error.message);
        res.status(500).send('Error al obtener habitaciones por estado');
 }
});

//CREAR HABITACION
router.post('/habitaciones', async (req, res) => {
    try {
        const { tipo_habitacion, numero_ocupantes, costo_habitacion, numero_habitacion, id_hotel } = req.body;

         const result = await habitacionesModel.crearHabitacion(
            tipo_habitacion,
            numero_ocupantes,
            costo_habitacion,
            numero_habitacion,
            id_hotel
        );

        res.status(201).json({ 
        message: "Habitación creada exitosamente", 
        insertId: result.insertId // devuelve el ID de la habitación creada
        });
    } catch (error) {
        console.error('Error al crear la habitación:', error.message);
        res.status(500).json({ message: "Error al crear la habitación" });
    }
});

//ACTUALIZAR ESTADO DE HABITACION
router.put('/habitaciones/:id_habitacion', async (req, res) => {
    try {
        const id_habitacion = req.params.id_habitacion;
        const estado= req.body.estado;
       
        // Validar estado
        if (estado !== 'libre' && estado !== 'ocupada') {
            return res.status(400).json({ message: "El estado debe ser 'libre' o 'ocupada'" });
        }
        const result = await habitacionesModel.actualizarHabitacion(id_habitacion, estado);
        res.send("Estado de habitacion actualizado");
    } catch (error) {
        console.error('Error al actualizar estado:', error.message);
        res.status(500).send('Error al actualizar estado');
    }
});

// ELIMINAR HABITACION POR ID
router.delete('/habitaciones/:id_habitacion', async (req, res) => {
    try {
        const id_habitacion = req.params.id_habitacion;
        const result = await habitacionesModel.eliminarHabitacion(id_habitacion);
        if (result[0].affectedRows === 0) {
            return res.status(404).send("Habitación no encontrada");
        }
        res.send("Habitación eliminada correctamente");
    } catch (error) {
    console.error('Error al eliminar habitación:', error.message);
    res.status(500).send('Error al eliminar habitación');
  }
});

// ELIMINAR HABITACIONES POR ID HOTEL
router.delete('/habitacionesHotel/:id_hotel', async (req, res) => {
  const id_hotel = req.params.id_hotel;


  try {
    const eliminadas = await habitacionesModel.eliminarPorHotel(id_hotel);


    res.json({
  mensaje: `Habitaciones del hotel ${id_hotel} eliminadas`,
  habitaciones_eliminadas: eliminadas
    });


  } catch (error) {
    console.error('Error al eliminar habitaciones:', error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;