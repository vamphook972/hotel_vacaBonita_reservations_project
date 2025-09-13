const { Router } = require('express');
const router = Router();
const habitacionesModel = require('../models/habitacionesModel');

//MOSTRAR HABITACIONES
router.get('/habitaciones', async (req, res) => {
    const id = req.params.id;
    var result;
    result = await habitacionesModel.traerHabitaciones() ;
    //console.log(result);
    res.json(result);
});

//MOSTRAR HABITACIONES POR ID
router.get('/habitaciones/:id_habitacion', async (req, res) => {
    const id_habitacion = req.params.id_habitacion;
    var result;
    result = await habitacionesModel.traerHabitacion(id_habitacion);
    //console.log(result);
    res.json(result[0]);
});

//MOSTRAR HABITACIONES POR ID HOTEL
router.get('/habitacionesHotel/:id_hotel', async (req, res) => {
    const id_hotel = req.params.id_hotel;
    var result;
    result = await habitacionesModel.traerHabitacionHotel(id_hotel);
    //console.log(result);
    res.json(result);
});

//MOSTRAR HABITACIONES POR estado
router.get('/habitacionesEstado/:estado', async (req, res) => {
    const estado = req.params.estado;
    var result;
    result = await habitacionesModel.traerHabitacionEstado(estado);
    //console.log(result);
    res.json(result);
});

//CREAR HABITACION
router.post('/habitaciones', async (req, res) => {
    const tipo_habitacion = req.body.tipo_habitacion;
    const numero_ocupantes = req.body.numero_ocupantes;
    const costo_habitacion = req.body.costo_habitacion;
    const numero_habitacion = req.body.numero_habitacion;
    const id_hotel = req.body.id_hotel;


    
    var result = await habitacionesModel.crearHabitacion(tipo_habitacion,numero_ocupantes,costo_habitacion,numero_habitacion,id_hotel);
    res.send("Habitacion creada");
});

//ACTUALIZAR ESTADO DE HABITACION
router.put('/habitaciones/:id_habitacion', async (req, res) => {
    const id_habitacion = req.params.id_habitacion;
    const estado= req.body.estado;


    var result = await habitacionesModel.actualizarHabitacion(id_habitacion, estado);
    res.send("Estado de habitacion actualizado");
});

// ELIMINAR HABITACION POR ID
router.delete('/habitaciones/:id_habitacion', async (req, res) => {
    const id_habitacion = req.params.id_habitacion;

    var result = await habitacionesModel.eliminarHabitacion(id_habitacion);

    if (result[0].affectedRows === 0) {
        return res.status(404).send("Habitación no encontrada");
    }

    res.send("Habitación eliminada correctamente");
});

module.exports = router;