const express = require('express');
const router = express.Router();
const axios = require('axios');
const reservationsModel = require('../models/reservationsModel');

// show all reservations
router.get('/reservations', async (req, res) => {
    try {
        var reservations
        reservations = await reservationsModel.getReservations();
        res.json(reservations);
    } catch (error) {
        console.error('Error al obtener reservaciones:', error);
        res.status(500).json({error: 'Error interno del servidor al obtener reservaciones'});
    }
});

// show a especific reservation using its id
router.get('/reservations/:id', async (req, res) => {
    try {
        const id = req.params.id;
        var reservation;
        reservation = await reservationsModel.getReservationById(id);
        
        if (!reservation || reservation.length === 0) {
            return res.status(404).json({error: 'Reservacion no encontrada'});
        }
        
        res.json(reservation[0]);
    } catch (error) {
        console.error('Error al obtener reservacion:', error);
        res.status(500).json({error: 'Error interno del servidor al obtener reservacion'});
    }
});


async function verifyUserName(userName) {
    try {
        const userResponse = await axios.get(`http://localhost:3001/usuarios/${userName}`)
        const user = userResponse.data
        
        if (!user || userName != user.usuario){
            return { available: false, reason: 'Usuario no encontrado o nombre de usuario invalido' };
        }

        if (user.tipo_usuario === 'admin_hotel' || user.tipo_usuario === 'admin_agencia'){
            return { available: false, reason: 'Los administradores no pueden realizar reservas' };
        }

        return { available: true, reason: null };
    } catch (error) {
        return { available: false, reason: 'Error al verificar el usuario' };
    }
}

// verificate room
async function verifyRoomById(id_room) {
    try {
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
    } catch (error) {
        console.error('Error al verificar habitacion:', error);
        return { available: false, reason: 'Error al verificar la habitacion' };
    }
}

async function verifyDisponibility(id_room, start_date, end_date) {
    try {
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
    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        return { available: false, reason: 'Error al verificar disponibilidad de la habitacion' };
    }
}

async function verifyOcupantsInRoom(id_room, occupants_number) {
    try {
        const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
        const room = roomResponse.data;

        if (occupants_number <= room.numero_ocupantes){
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error al verificar ocupantes en habitacion:', error);
        return false;
    }
}


async function extractHotel(id_room) {
    try {
        const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
        const room = roomResponse.data;

        return room.id_hotel;
    } catch (error) {
        console.error('Error al extraer hotel:', error);
        throw new Error('Error al obtener información del hotel');
    }
}


async function updateStateRoom(id_room) {
    try {
        const roomResponse = await axios.put(`http://localhost:3005/habitaciones/${id_room}`, {
            estado: 'ocupada'
        });
        return roomResponse;
    } catch (error) {
        console.error('Error al actualizar estado de habitacion:', error);
        throw new Error('Error al actualizar estado de la habitacion');
    }
}

// calculate cost
async function calculateCost(id_room, start_date, end_date) {
    try {
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
    } catch (error) {
        console.error('Error al calcular costo:', error);
        throw new Error('Error al calcular el costo de la reservacion');
    }
}


// send new reservation
router.post('/reservations', async (req, res) => {
    try {
        const userName = req.body.user;
        const occupants_number = req.body.occupants_number;
        const id_room = req.body.id_room;
        const start_date = req.body.start_date;
        const end_date = req.body.end_date;
        const state = 'pending';

        // Validate required fields
        if (!userName || !occupants_number || !id_room || !start_date || !end_date) {
            return res.status(400).json({error: 'Faltan campos requeridos en la solicitud'});
        }

        const verifyUser = await verifyUserName(userName);
        if (!verifyUser.available) {
            return res.json({error: verifyUser.reason});
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
    } catch (error) {
        console.error('Error al crear reservacion:', error);
        res.status(500).json({error: 'Error interno del servidor al crear la reservacion'});
    }
});


module.exports = router;