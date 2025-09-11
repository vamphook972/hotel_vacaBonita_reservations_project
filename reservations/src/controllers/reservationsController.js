const express = require('express');
const router = express.Router();
const reservationsModel = require('../models/reservationsModel');

router.get('/reservations', async (req, res) => {
    var reservations
    reservations = await reservationsModel.getReservations();
    res.json(reservations);
});

router.get('/reservations:id', async (req, res) => {
    const id = req.params.id;
    var reservation;
    reservation = await reservationsModel.getReservationById(id);
    res.json(reservation[0]);
});

module.exports = router;