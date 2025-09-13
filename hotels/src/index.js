require('dotenv').config();
const mysql = require('mysql2/promise');
const express = require('express');
const app = express();
const hotelesController = require("./controllers/hotelesController");
app.use(express.json());
app.use('/', hotelesController);

app.listen(3302, () => {
  console.log('Microservicio Hoteles corriendo en el puerto 3302');
});

