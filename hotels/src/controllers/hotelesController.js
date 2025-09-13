const { Router } = require('express');
const router = Router();
const hotelesModel = require('../models/hotelesModel');

// Consultar todos los hoteles
router.get('/hoteles', async (req, res) => {
  try {
    const result = await hotelesModel.traerHoteles();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consultar un hotel por id
router.get('/hoteles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await hotelesModel.traerHotel(id);

    if (!result) {
      res.status(404).send("Hotel no encontrado");
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo hotel con precios y cantidades 
router.post('/hoteles', async (req, res) => {
  try {
    console.log("BODY RECIBIDO:", req.body);
    const {
      usuario,
      nombre_hotel,
      pais,
      ciudad,
      costo_habitacion,
      cantidad_habitaciones
    } = req.body;

    if (
      !usuario || !nombre_hotel || !pais || !ciudad ||
      !costo_habitacion || !cantidad_habitaciones
    ) {
      res.status(400).send("Faltan campos obligatorios, costos o cantidades de habitaciones");
      return;
    }

    const id_hotel = await hotelesModel.crearHotel({
      usuario,
      nombre_hotel,
      pais,
      ciudad,
      costo_habitacion,
      cantidad_habitaciones
    });

    res.status(201).json({
      mensaje: `Hotel '${nombre_hotel}' creado exitosamente`,
      id_hotel,
      habitaciones_creadas: Object.entries(cantidad_habitaciones).map(([tipo, cantidad]) => ({
        tipo,
        cantidad
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar hotel por id
router.put('/hoteles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const hotelActualizado = req.body;

    const hotelExistente = await hotelesModel.traerHotel(id);
    if (!hotelExistente) {
      res.status(404).send("Hotel no encontrado");
      return;
    }

    await hotelesModel.actualizarHotel(id, hotelActualizado);
    res.send("Hotel actualizado");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrar hotel por id
router.delete('/hoteles/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const hotelExistente = await hotelesModel.traerHotel(id);
    if (!hotelExistente) {
      res.status(404).send("Hotel no encontrado");
      return;
    }

    await hotelesModel.borrarHotel(id);
    res.send("Hotel eliminado");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;