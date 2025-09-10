const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const reservationsController = require('./controllers/reservationsController');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

app.use('/reservations', reservationsController);


app.listen(3003, () => {
  console.log('Microservicio Usuarios ejecutandose en el puerto 3003');
});