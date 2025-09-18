const express = require('express');
const habitacionesController = require('./controllers/habitacionesController');
const morgan = require('morgan'); 
const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use(habitacionesController);

app.listen(3005, () => {
  console.log('Microservicio Habitaciones ejecutandose en el puerto 3005');
});