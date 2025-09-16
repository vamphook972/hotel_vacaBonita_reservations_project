const express = require('express');
const morgan = require('morgan');
const reservationsController = require('./controllers/reservationsController');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use(reservationsController);


app.listen(3003, () => {
  console.log('Microservicio Usuarios ejecutandose en el puerto 3003');
  // Schedule periodic check for expired reservations every 5 seconds
  const timeToVerify =5 * 1000;
  setInterval(async () => {
    try {
      await reservationsController.checkExpiredReservations();
    } catch (err) {
      console.error('Error ejecutando verificación de reservas expiradas:', err);
    }
  }, timeToVerify);
});