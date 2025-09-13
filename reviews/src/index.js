const express = require('express');
const resenasController = require('./controllers/resenasController');
const morgan = require('morgan'); 
const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use('/resenas', resenasController);

app.listen(3004, () => {
  console.log('Microservicio de reseñas escuchando en el puerto 3004');
});
