const express = require('express');
const morgan = require('morgan'); 
const app = express();
app.use(morgan('dev'));
app.use(express.json());

const hotelesController = require("./controllers/hotelesController");
app.use(express.json());
app.use('/', hotelesController);
app.use(morgan('dev'));
app.listen(3002, () => {
  console.log('Microservicio Hoteles corriendo en el puerto 3002');
});

