const { Router } = require('express');
const router = Router();
const productosModel = require('../models/productosModel');

router.get('/reservations', async (req, res) => {
    var reservations
    reservations = await productosModel.getReservations();
    res.json(reservations);
});

router.get('/reservations:id', async (req, res) => {
    const id = req.params.id;
    var reservation;
    reservation = await productosModel.getReservationById(id);
    res.json(reservation[0]);
});

module.exports = router;