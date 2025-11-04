<?php
$API_URL = "http://dns.vacabonita.com:3001/usuarios";
$mensaje = "";

if (isset($_POST['register'])) {
    $postData = [
        "nombre" => $_POST['nombre'],
        "tipo_usuario" => $_POST['tipo_usuario'],
        "genero" => $_POST['genero'],
        "pais" => $_POST['pais'],
        "usuario" => $_POST['usuario_reg'],
        "password" => $_POST['password_reg'],
        "email" => $_POST['email']
    ];

    $ch = curl_init($API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));

    $response = curl_exec($ch);

    if ($response === false) {
        $mensaje = "Error al conectar con la API: " . curl_error($ch);
    } else {
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $data = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300) {
            $mensaje = "Usuario registrado exitosamente. Ahora puedes iniciar sesión.";
        } else {
            $mensaje = isset($data['error']) ? $data['error'] : "Error desconocido en el registro.";
        }
    }

    curl_close($ch);
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Agencia Vaca Bonita - Registro</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .header {
      background: linear-gradient(90deg, #6f42c1, #20c997);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 15px 15px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-weight: bold;
      font-size: 2rem;
    }
    body {
      background-color: #f8f9fa;
    }
  </style>
</head>
<body>
  <!-- Encabezado -->
  <div class="header">
    <h1>🏨 Agencia Vaca Bonita</h1>
    <p>Tu mejor opción en hoteles y reservas</p>
  </div>

  <div class="container">
    <h2 class="text-center mb-4">Registro de Usuario</h2>

    <?php if ($mensaje): ?>
      <div class="alert alert-info text-center"><?= htmlspecialchars($mensaje) ?></div>
    <?php endif; ?>

    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <form method="POST">
              <div class="mb-3">
                <label class="form-label">Nombre completo</label>
                <input type="text" name="nombre" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Tipo de usuario</label>
                <select name="tipo_usuario" class="form-select" required>
                  <option value="cliente">Cliente</option>
                  <option value="admin_hotel">Administrador hotel</option>
                  <option value="admin_agencia">Administrador agencia</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Género</label>
                <select name="genero" class="form-select" required>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">País</label>
                <input type="text" name="pais" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Usuario</label>
                <input type="text" name="usuario_reg" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Contraseña</label>
                <input type="password" name="password_reg" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Correo electrónico</label>
                <input type="email" name="email" class="form-control" required>
              </div>
              <button type="submit" name="register" class="btn btn-success w-100">Registrarse</button>
            </form>
            <hr>
            <a href="index.php" class="btn btn-secondary w-100">Volver al inicio de sesión</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>