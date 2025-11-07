require('dotenv').config();
const mysql = require('mysql2');

const conection = mysql.createPool({
  host: 'db',
  user: 'root',
  password: 'mysql',
  port: '3306',
  database: 'agencia'
});

const connection = conection.promise();

//metodo consultar usuarios 
async function ConsultarUsuarios() {
    const [rows] = await connection.query('SELECT * FROM usuarios');
    return rows;
}
 
//metodo consultar un usuario 
async function ConsultarUsuario(usuario) {
    const [rows] = await connection.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    return rows;
}

//validacion de user 
async function validarUsuario(usuario, password) {
    const [rows] = await connection.query('SELECT * FROM usuarios WHERE usuario = ? AND password = ?', [usuario, password]);
    return rows;
}

//creacion de usuario
async function crearUsuario(nombre, tipo_usuario, genero, pais, usuario, password, email) {
    const result = await connection.query('INSERT INTO usuarios VALUES(?,?,?,?,?,?,?)', 
        [nombre, tipo_usuario, genero, pais, usuario, password, email]);
    return result;
}

//editar usuario 
async function editarUsuario(usuario, password,) {
    const sql = `
        update usuarios
        set password = ?
        where usuario = ?`;
    const [result] = await connection.query(sql,[password,usuario]);
    return result; 
     
}

//borrar usuario 
async function borrarUsuario(usuario) {
    const sql=`
        delete from usuarios
        where usuario =? `;
    const [result] = await connection.query(sql, [usuario]);
    return result;
}

//verificaion existencia admin agencia 
async function existeAdminAgencia() {
  const [rows] = await connection.query(
    "SELECT 1 FROM usuarios WHERE tipo_usuario = 'admin_agencia' LIMIT 1"
  );
  return rows.length > 0;
}
module.exports = {
    ConsultarUsuarios, ConsultarUsuario, validarUsuario, crearUsuario, editarUsuario, borrarUsuario, existeAdminAgencia
};
