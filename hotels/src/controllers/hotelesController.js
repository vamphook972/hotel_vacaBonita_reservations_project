const { Router } = require('express');
const router = Router();
const hotelesModel = require('../models/hotelesModel');

// Configuración de tipos de habitación
const configuracion = {
  estandar: { numero_ocupantes: 2, base: 100 },
  deluxe:   { numero_ocupantes: 3, base: 200 },
  suite:    { numero_ocupantes: 4, base: 300 }
};

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
      return res.status(404).send("Hotel no encontrado");
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo hotel con validación de rol y habitaciones
router.post('/hoteles', async (req, res) => {
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
    console.log("Faltan campos obligatorios");
    return res.status(400).send("Faltan campos obligatorios");
  }

  // Validar si el usuario es administrador 
  let tipo_usuario;
  try {
    const response = await axios.get(`http://localhost:3001/usuarios/${usuario}`);
    console.log("Datos recibidos del microservicio:", response.data);
    tipo_usuario = String(response.data?.tipo_usuario || '').trim().toLowerCase();

    if (tipo_usuario !== 'admin_hotel') {
      console.log(`Usuario '${usuario}' tiene rol '${tipo_usuario}' → acceso denegado`);
      res.status(403).json({
        error: `El usuario '${usuario}' no tiene permisos para crear hoteles.'`
      });
      return; 
    }

    console.log(`Usuario '${usuario}' autorizado como '${tipo_usuario}'`);
  } catch (error) {
    const mensaje = error.response?.data?.error || error.message || 'No se pudo validar el tipo de usuario';
    console.error('Error al validar usuario:', mensaje);
    return res.status(500).json({ error: mensaje });
  }

  // Crear hotel 
  let id_hotel;
  try {
    id_hotel = await hotelesModel.crearHotel({
      usuario,
      nombre_hotel,
      pais,
      ciudad,
    });
    console.log(`Hotel creado con ID ${id_hotel}`);
  } catch (error) {
  console.error('Error al crear hotel:', error); // muestra el error completo
  return res.status(500).json({ error: error.message });
}


  // Crear habitaciones base
  try {
    for (const tipo in costo_habitacion) {
      const cantidad = cantidad_habitaciones[tipo] || 0;
//cambio   
      if (cantidad < 0) {
        return res.status(400).json({
          error: `La cantidad de habitaciones para '${tipo}' no puede ser negativa (recibido: ${cantidad}).`
        });
      }
      const { numero_ocupantes, base } = configuracion[tipo];

      for (let i = 0; i < cantidad; i++) {
        const numero_habitacion = base + i + 1;

        const habitacion = {
          tipo_habitacion: tipo,
          estado: 'libre',
          numero_ocupantes,
          costo_habitacion: costo_habitacion[tipo],
          numero_habitacion,
          id_hotel
        };

        try {
          await axios.post('http://localhost:3005/habitaciones', habitacion);
          console.log(`Habitación ${tipo} ${numero_habitacion} creada`);
        } catch (error) {
          const mensaje = error.response?.data?.error || error.message || 'Error desconocido';
          console.error(`Error al crear habitación ${tipo} ${numero_habitacion}:`, mensaje);
          return res.status(500).json({ error: `Error al crear habitación ${tipo} ${numero_habitacion}: ${mensaje}` });
        }
      }
    }

    return res.status(201).json({
      mensaje: `Hotel '${nombre_hotel}' creado exitosamente`,
      id_hotel,
      habitaciones_creadas: Object.entries(cantidad_habitaciones).map(([tipo, cantidad]) => ({
        tipo,
        cantidad
      }))
    });
  } catch (error) {
    console.error('Error al crear habitaciones:', error.message);
    return res.status(500).json({ error: 'Error al crear habitaciones' });
  }
});

// Actualizar solo el estado de un hotel por id
router.put('/hoteles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { estado } = req.body; 

    if (!estado || !['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({ error: "El campo 'estado' es obligatorio y debe ser 'activo' o 'inactivo'" });
    }

    const hotelExistente = await hotelesModel.traerHotel(id);
    if (!hotelExistente) {
      return res.status(404).send("Hotel no encontrado");
    }

    await hotelesModel.actualizarHotel(id, estado);
    res.send("Estado del hotel actualizado");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;