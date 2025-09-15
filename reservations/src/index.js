const express = require('express');
const morgan = require('morgan');
const reservationsController = require('./controllers/reservationsController');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use(reservationsController);


app.listen(3003, () => {
  console.log('Microservicio Usuarios ejecutandose en el puerto 3003');
  // Schedule periodic check for expired reservations every 10 minutes
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  setInterval(async () => {
    try {
      await reservationsController.checkExpiredReservations();
    } catch (err) {
      console.error('Error ejecutando verificación de reservas expiradas:', err);
    }
  }, TEN_MINUTES_MS);
});