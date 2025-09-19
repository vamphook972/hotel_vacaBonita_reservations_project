const { Router } = require('express');
const router = Router();
const usuariosModel = require('../models/usuariosModel');

// consultarUsuarios
router.get('/usuarios', async (req, res) => {
  try {
    const rows = await usuariosModel.ConsultarUsuarios();
    res.json(rows);
  } catch (e) {
    console.error('GET /usuarios ERROR =>', e);
    res.status(500).send('Error al consultar usuarios');
  }
});

// consultar usuario por pk
router.get('/usuarios/:usuario', async (req, res) => {
  try {
    const rows = await usuariosModel.ConsultarUsuario(req.params.usuario);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    console.error('GET /usuarios/:usuario ERROR =>', e);
    return res.status(500).send('Error al consultar usuario');
  }
});

// validacion de usuario y password 
router.get('/usuarios/:usuario/:password', async (req, res) => {
  try {
    const rows = await usuariosModel.validarUsuario(req.params.usuario, req.params.password);
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
    res.json(rows[0]);
  } catch (e) {
    console.error('GET /usuarios/:usuario/:password ERROR =>', e);
    res.status(500).send('Error al validar usuario');
  }
});

// creacion de user
router.post('/usuarios', async (req, res) => {
  const { nombre, tipo_usuario, genero, pais, usuario, password, email } = req.body;
  //verificar que todos los campos sean ingresados
  if (!nombre || !tipo_usuario || !genero || !pais || !usuario || !password || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  //validacion de que solo exista un admin agencia 
  try {
    if (tipo_usuario === 'admin_agencia') {
      const yaExiste = await usuariosModel.existeAdminAgencia();
      if (yaExiste) return res.status(409).json({ error: 'Ya existe un usuario admin_agencia' });
    }
// crea el usuario 
    await usuariosModel.crearUsuario(nombre, tipo_usuario, genero, pais, usuario, password, email);
    return res.status(201).send('usuario creado'); 
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Usuario o email ya existe' }); //validacion por si el email o user ya existen 
    }
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// edicion de password o actualizacion del password 
router.put('/usuarios/:usuario/password', async (req, res) => {
  const { usuario } = req.params;
  const { password } = req.body;
// en caso de que no envie un password 
  if (!password) {
    return res.status(400).send('Debes enviar el nuevo password');
  }
//
  try {
    const result = await usuariosModel.editarUsuario(usuario, password);
    if (result.affectedRows === 0) { //intenta actualizar el user, si no hay user devuelve que no se encontro 
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.send('password actualizado'); //si hay filas afectadas entonces devuelve que si se actualizo 
  } catch (error) {
    console.error('PUT /usuarios/:usuario/password ERROR =>', error);
    res.status(500).send('Error al actualizar password'); //en caso de otro tipo de error 
  }
});

// borrar user
router.delete('/usuarios/:usuario', async (req, res) => {
  const { usuario } = req.params;

  try { //revisa que el usuario que se quiere borrar exista
    const userRows = await usuariosModel.ConsultarUsuario(usuario);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
//verifica que el user que se quiere borrar sea de tipo cliente
    const tipoUsuario  = userRows[0].tipo_usuario;
    if (tipoUsuario !== 'cliente' ) {
      return res.status(403).json({ error: 'Solo se pueden eliminar los usuarios de tipo cliente' });
    }

    const result = await usuariosModel.borrarUsuario(usuario);
    if (result.affectedRows === 0) { //por si al buscar el usuario para borrarlo no lo encuentra
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.send('usuario borrado'); // en caso de que si sea borrado el usuario 
  } catch (error) {
    console.error('DELETE /usuarios/:usuario ERROR =>', error);
    res.status(500).send('Error al borrar usuario'); //si ocurre otro tipo de error 
  }
});

module.exports = router;
