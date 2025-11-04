<?php
session_start();

// URL del microservicio de usuarios (ajusta el puerto según tu configuración)
$API_URL = "http://dns.vacabonita.com:3001/usuarios";

// Si enviaron el formulario
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $usuario = $_POST['usuario'];
    $password = $_POST['password'];

    // Consumir API de validación
    $url = $API_URL . "/" . urlencode($usuario) . "/" . urlencode($password);
    $response = @file_get_contents($url);

    if ($response !== FALSE) {
        $data = json_decode($response, true);

        // Si la API devuelve error
        if (isset($data['error'])) {
            $error = $data['error'];
        } else {
            // Usuario válido → crear sesión
            $_SESSION['usuario'] = $data['usuario'];
            $_SESSION['tipo_usuario'] = $data['tipo_usuario'];

            // Redirigir según tipo de usuario
            switch ($data['tipo_usuario']) {
                case 'cliente':
                    header("Location: cliente.php");
                    break;
                case 'admin_agencia':
                    header("Location: admin_agencia.php");
                    break;
                case 'admin_hotel':
                    header("Location: admin_hotel.php");
                    break;
                default:
                    $error = "Tipo de usuario desconocido.";
            }
            exit;
        }
    } else {
        $error = "No se pudo conectar al servicio de usuarios.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Agencia Vaca Bonita - Login</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">

  <div class="bg-white p-8 rounded-xl shadow-lg w-96">
    <h1 class="text-2xl font-bold text-center text-indigo-700 mb-6">Agencia Vaca Bonita</h1>
    <form method="POST" action="index.php" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-semibold">Usuario</label>
        <input type="text" name="usuario" required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
      </div>
      <div>
        <label class="block text-gray-700 font-semibold">Contraseña</label>
        <input type="password" name="password" required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
      </div>
      <button type="submit"
        class="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
        Iniciar Sesión
      </button>
      
      <p class="text-center">¿No tienes cuenta?</p>
      <a href="register.php" 
         class="w-full block text-center bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
         Registrarse
      </a>
    </form>

    <?php if (isset($error)): ?>
      <p class="text-red-600 font-semibold text-center mt-4"><?= $error ?></p>
    <?php endif; ?>
  </div>

</body>
</html>
