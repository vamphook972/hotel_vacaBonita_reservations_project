// Required imports for the reservations controller
const express = require('express');
const router = express.Router();
const axios = require('axios'); // For making HTTP requests to other microservices
const reservationsModel = require('../models/reservationsModel'); // Database model for reservation operations


// GET /reservations
// Retrieves all reservations from the system
router.get('/reservations', async (req, res) => {
    try {
        // Fetch all reservations from the database
        var reservations
        reservations = await reservationsModel.getReservations();
        res.json(reservations);
    } catch (error) {
        console.error('Error al obtener reservaciones:', error);
        res.status(500).json({error: 'Error interno del servidor al obtener reservaciones'});
    }
});

// GET /reservations/:id
// Retrieves a specific reservation by its ID
router.get('/reservations/:id', async (req, res) => {
    try {
        // Extract reservation ID from URL parameters
        const id = req.params.id;
        var reservation;
        
        // Fetch reservation from database
        reservation = await reservationsModel.getReservationById(id);
        
        // Check if reservation exists
        if (!reservation || reservation.length === 0) {
            return res.status(404).json({error: 'Reservacion no encontrada'});
        }
        
        // Return the first (and only) reservation found
        res.json(reservation[0]);
    } catch (error) {
        console.error('Error al obtener reservacion:', error);
        res.status(500).json({error: 'Error interno del servidor al obtener reservacion'});
    }
});


// POST /reservations
// Creates a new reservation with validation and verification
router.post('/reservations', async (req, res) => {
    try {
        // Extract reservation data from request body
        const userName = req.body.user;
        const occupants_number = req.body.occupants_number;
        const id_room = req.body.id_room;
        const start_date = req.body.start_date;
        const end_date = req.body.end_date;
        const state = 'pending'; // Default state for new reservations

        // Validate that all required fields are present
        if (!userName || !occupants_number || !id_room || !start_date || !end_date) {
            return res.status(400).json({error: 'Faltan campos requeridos en la solicitud'});
        }

        // Verify user exists and is authorized to make reservations
        const verifyUser = await verifyUserName(userName);
        if (!verifyUser.available) {
            return res.json({error: verifyUser.reason});
        }

        // Verify room exists and is available
        const verifyRoom = await verifyRoomById(id_room);
        if (!verifyRoom.available) {
            return res.json({error: verifyRoom.reason});
        }

        // Check room availability for the requested dates
        const disponibility = await verifyDisponibility(id_room, start_date, end_date);
        if (!disponibility.available) {
            return res.json({error: disponibility.reason});
        }

        // Extract hotel ID from room data
        const id_hotel = await extractHotel(id_room);
        
        // Verify number of occupants doesn't exceed room capacity
        const verifyOcupants = await verifyOcupantsInRoom(id_room, occupants_number)
        if (!verifyOcupants){
            return res.json({error: 'Cantidad de ocupantes supera el limite permitido para esa habitacion'})
        }

        // Update room state to occupied
        await updateStateRoom(id_room, 'ocupada')
        
        // Calculate total cost based on room price and duration
        const cost = await calculateCost(id_room, start_date, end_date);

        // Create reservation object with all validated data
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
        
        // Save reservation to database
        const reservationRes = await reservationsModel.createReservation(reservation)

        return res.send("reserva creada exitosamente");
    } catch (error) {
        console.error('Error al crear reservacion:', error);
        res.status(500).json({error: 'Error interno del servidor al crear la reservacion'});
    }
});

// PUT /reservations/:id
// Updates reservation data; if dates or room change, cost is recalculated
router.put('/reservations/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Load current reservation
        const current = await reservationsModel.getReservationById(id);
        if (!current || current.length === 0) {
            return res.status(404).json({ error: 'Reservacion no encontrada' });
        }
        const currentRes = current[0];

        // Extract incoming fields
        const {
            occupants_number,
            id_room,
            start_date,
            end_date
        } = req.body || {};

        // Disallow updating immutable fields
        if (req.body && req.body.user !== undefined) {
            return res.status(400).json({ error: 'No se permite actualizar el usuario de la reserva' });
        }
        if (req.body && req.body.state !== undefined) {
            return res.status(400).json({ error: 'No se permite actualizar el estado de la reserva' });
        }

        // Determine final values once to avoid redundancy
        const finalRoomId = id_room !== undefined ? id_room : currentRes.id_room;
        const finalStartDate = start_date !== undefined ? start_date : currentRes.start_date;
        const finalEndDate = end_date !== undefined ? end_date : currentRes.end_date;
        
        // Build update object progressively
        const updates = {};

        // If occupants_number changes, verify capacity
        if (occupants_number !== undefined) {
            const verifyOcupants = await verifyOcupantsInRoom(finalRoomId, occupants_number);
            if (!verifyOcupants) {
                return res.json({ error: 'Cantidad de ocupantes supera el limite permitido para esa habitacion' });
            }
            updates.occupants_number = occupants_number;
        }

        // If room changes, verify room exists and availability
        if (id_room !== undefined && id_room !== currentRes.id_room) {
            const verifyRoom = await verifyRoomById(id_room);
            if (!verifyRoom.available) {
                return res.json({ error: verifyRoom.reason });
            }

            const newHotelId = await extractHotel(id_room);
            updates.id_room = id_room;
            updates.id_hotel = newHotelId;
        }

        // If dates change, verify availability
        if (start_date !== undefined || end_date !== undefined) {
            const disponibility = await verifyDisponibility(finalRoomId, finalStartDate, finalEndDate);
            if (!disponibility.available) {
                return res.json({ error: disponibility.reason });
            }
            updates.start_date = finalStartDate;
            updates.end_date = finalEndDate;
        }

        // If room or dates changed, recalculate cost
        const roomChanged = updates.id_room !== undefined;
        const datesChanged = updates.start_date !== undefined || updates.end_date !== undefined;
        if (roomChanged || datesChanged) {
            const newCost = await calculateCost(finalRoomId, finalStartDate, finalEndDate);
            updates.cost = newCost;
        }

        // If nothing to update
        if (Object.keys(updates).length === 0) {
            return res.json({ message: 'No hay cambios para actualizar' });
        }

        // Perform update
        await reservationsModel.updateReservation(id, updates);

        return res.json({ message: 'Reservacion actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar reservacion:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar la reservacion' });
    }
});


// Verifies if a user exists and is authorized to make reservations
async function verifyUserName(userName) {
    try {
        // Make API call to user service to get user data
        const userResponse = await axios.get(`http://localhost:3001/usuarios/${userName}`)
        const user = userResponse.data
        
        // Check if user exists and username matches
        if (!user || userName != user.usuario){
            return { available: false, reason: 'Usuario no encontrado o nombre de usuario invalido' };
        }

        // Check if user is not an admin (admins cannot make reservations)
        if (user.tipo_usuario === 'admin_hotel' || user.tipo_usuario === 'admin_agencia'){
            return { available: false, reason: 'Los administradores no pueden realizar reservas' };
        }

        return { available: true, reason: null };
    } catch (error) {
        return { available: false, reason: 'Error al verificar el usuario' };
    }
}


// Verifies if a room exists and is available for reservation
async function verifyRoomById(id_room) {
    try {
        // Make API call to room service to get room data
        const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
        const room = roomResponse.data;

        // Check if room exists
        if (!room) {
            return { available: false, reason: 'Habitacion no existe' };
        }

        // Check if room is not already occupied
        if (room.estado === 'ocupada') {
            return { available: false, reason: 'Habitacion ya esta ocupada' };
        }
        
        return { available: true, reason: null };
    } catch (error) {
        console.error('Error al verificar habitacion:', error);
        return { available: false, reason: 'Error al verificar la habitacion' };
    }
}


// Verifies room availability for specific dates
async function verifyDisponibility(id_room, start_date, end_date) {
    try {
        // First verify that start date is not in the past
        const today = new Date();
        const startDate = new Date(start_date);
        
        // Set time to start of day for accurate comparison
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
            return { available: false, reason: 'No se puede hacer una reserva con fecha de inicio en el pasado' };
        }

        // Get room information
        const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
        const room = roomResponse.data;

        // Get all existing reservations
        const existingReservations = await reservationsModel.getReservations();

        // Filter reservations for the specific room
        const roomReservations = existingReservations.filter(reservation => reservation.numero_habitacion == room.numero_habitacion);

        // Check for date conflicts with existing reservations
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

// Verifies if the number of occupants doesn't exceed room capacity
async function verifyOcupantsInRoom(id_room, occupants_number) {
    try {
        // Get room information to check capacity
        const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
        const room = roomResponse.data;

        // Check if number of occupants is within room capacity
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


// Extracts hotel ID from room data
async function extractHotel(id_room) {
    try {
        // Get room information to extract hotel ID
        const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
        const room = roomResponse.data;

        return room.id_hotel;
    } catch (error) {
        console.error('Error al extraer hotel:', error);
        throw new Error('Error al obtener información del hotel');
    }
}


// Updates room state to occupied
async function updateStateRoom(id_room, state){
    try {
        // Update room state to occupied via API call
        const roomResponse = await axios.put(`http://localhost:3005/habitaciones/${id_room}`, {
            estado: state
        });
    } catch (error) {
        console.error('Error al actualizar estado de habitacion:', error);
        throw new Error('Error al actualizar estado de la habitacion');
    }
}


// check for expired reservations and free room
async function checkExpiredReservations() {
    try {
        const reservas = await reservationsModel.getReservations();
        const now = new Date();

        for (let reserva of reservas) {
            const endDate = new Date(reserva.end_date);

            if (endDate < now && reserva.state !== 'finished') {
                // Mark reservation as finished
                await reservationsModel.updateReservationState(reserva.id, 'finished');

                // Free the room setting it to disponible
                await updateStateRoom(reserva.id_room, 'libre')

                console.log(`Reserva ${reserva.id} finalizada, habitación liberada.`);
            }
        }
    } catch (error) {
        console.error('Error al verificar reservas expiradas:', error);
    }
}

// Calculates the total cost of a reservation based on room price and duration
async function calculateCost(id_room, start_date, end_date) {
    try {
        // Get room information to access room price
        const roomResponse = await axios.get(`http://localhost:3005/habitaciones/${id_room}`);
        const room = roomResponse.data;

        // Calculate number of nights between check-in and check-out
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days

        // Calculate total cost by multiplying room price per night by number of nights
        const costPerNight = room.costo_habitacion;
        const totalCost = costPerNight * nights;

        return totalCost;
    } catch (error) {
        console.error('Error al calcular costo:', error);
        throw new Error('Error al calcular el costo de la reservacion');
    }
}




// Expose maintenance job via router for use in server startup
router.checkExpiredReservations = checkExpiredReservations;

// Export the router for use in the main application
module.exports = router;