const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());


app.listen(3003, () => {
  console.log('Microservicio Usuarios ejecutandose en el puerto 3003');
});