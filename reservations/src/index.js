const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); 
const reservationsController = require('./controllers/reservationsController');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// Permitir solicitudes desde cualquier origen 
app.use(cors());

app.use(reservationsController);

app.listen(3003, () => {
    console.log('Microservicio reservas ejecutandose en el puerto 3003');
  // Schedule periodic check for expired reservations every 5 seconds
  const timeToVerify = 5 * 1000;
  setInterval(async () => {
    try {
      await reservationsController.checkReservationStates();
      await reservationsController.checkExpiredReservations();
    } catch (err) {
      console.error('Error ejecutando verificación de reservas', err);
    }
  }, timeToVerify);
});