const express = require('express');
const router = express.Router();
const axios = require('axios');
const reservationsModel = require('../models/reservationsModel');

// show all reservations
router.get('/reservations', async (req, res) => {
    var reservations
    reservations = await reservationsModel.getReservations();
    res.json(reservations);
});

// show a especific reservation using its id
router.get('/reservations/:id', async (req, res) => {
    const id = req.params.id;
    var reservation;
    reservation = await reservationsModel.getReservationById(id);
    res.json(reservation[0]);
});


async function verifyUserName(userName) {
    const userResponse = await axios.get(`http://localhost:3001/usuarios/${userName}`)
    const user = userResponse.data
    
    if (!user || userName != user.usuario){
        return false;
    }

    if (user.tipo_usuario === 'admin_hotel' || user.tipo_usuario === 'admin_agencia'){
        return false;
    }

    return true;
}

// verificate room
async function verifyRoomById(id_room) {
    // Verificate if exist and check if it is available
    const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
    const room = roomResponse.data;

    if (!room) {
        return { available: false, reason: 'Habitacion no existe' };
    }

    if (room.estado === 'ocupada') {
        return { available: false, reason: 'Habitacion ya esta ocupada' };
    }
    
    return { available: true, reason: null };
}

async function verifyDisponibility(id_room, start_date, end_date) {
    // First verify that start date is not in the past
    const today = new Date();
    const startDate = new Date(start_date);
    
    // Set time to start of day for comparison
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
        return { available: false, reason: 'No se puede hacer una reserva con fecha de inicio en el pasado' };
    }

    const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
    const room = roomResponse.data;

    // verificate if that reservation 
    const existingReservations = await reservationsModel.getReservations();

    // Filter rooms using the numero_habitacion from the room data
    const roomReservations = existingReservations.filter(reservation => reservation.numero_habitacion == room.numero_habitacion);

    for (let reservation of roomReservations) {
        if (
            (start_date <= reservation.end_date) &&
            (end_date >= reservation.start_date)
        ) {
            return { available: false, reason: 'Habitacion no disponible en ese horario de reserva' };
        }
    }

    return { available: true, reason: null };
}

async function verifyOcupantsInRoom(id_room, occupants_number) {
    const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
    const room = roomResponse.data;

    if (occupants_number <= room.numero_ocupantes){
        return true;
    } else {
        return false;
    }
}


async function extractHotel(id_room) {
    const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
    const room = roomResponse.data;

    return room.id_hotel;
}


async function updateStateRoom(id_room) {
    const roomResponse = await axios.put(`http://localhost:3005/habitaciones/${id_room}`, {
        estado: 'ocupada'
    });
}

// calculate cost
async function calculateCost(id_room, start_date, end_date) {
    const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
    const room = roomResponse.data;

    // Calculate number of nights
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Calculate total cost
    const costPerNight = room.costo_habitacion;
    const totalCost = costPerNight * nights;

    return totalCost;
}


// send new reservation
router.post('/reservations', async (req, res) => {
    const userName = req.body.user;
    const occupants_number = req.body.occupants_number;
    const id_room = req.body.id_room;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const state = 'pending';

    const verifyUser = await verifyUserName(userName);
    if (!verifyUser) {
        return res.json({error: 'Error con el usuario que intenta realizar la reserva'})
    }

    const verifyRoom = await verifyRoomById(id_room);
    if (!verifyRoom.available) {
        return res.json({error: verifyRoom.reason});
    }

    const disponibility = await verifyDisponibility(id_room, start_date, end_date);
    if (!disponibility.available) {
        return res.json({error: disponibility.reason});
    }

    const id_hotel = await extractHotel(id_room);
    
    const verifyOcupants = await verifyOcupantsInRoom(id_room, occupants_number)
    if (!verifyOcupants){
        return res.json({error: 'Cantidad de ocupantes supera el limite permitido para esa habitacion'})
    }

    const stateRoom = await updateStateRoom(id_room)
    
    const cost = await calculateCost(id_room, start_date, end_date);

    // create reservation
    const reservation = {
        'user': userName,
        'id_hotel': id_hotel,
        'occupants_number': occupants_number,
        'id_room': id_room,
        'start_date': start_date,
        'end_date': end_date,
        'state': state,
        'cost': cost
    };
    const reservationRes = await reservationsModel.createReservation(reservation)

    return res.send("reserva creada exitosamente");

});


module.exports = router;