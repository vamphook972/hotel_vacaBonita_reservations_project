<?php
// eliminar_usuario.php
$error = null;
$mensaje = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_POST['usuario'])) {
        $usuario = urlencode(trim($_POST['usuario']));
        $API_URL = "http://dns.vacabonita.com:3001/usuarios/" . $usuario; // Ajusta el puerto a tu microservicio

        // Preparar el DELETE request
        $options = [
            'http' => [
                'method'  => 'DELETE',
                'header'  => "Content-Type: application/json\r\n"
            ]
        ];
        $context  = stream_context_create($options);
        $result = @file_get_contents($API_URL, false, $context);

        if ($result === FALSE) {
            $error = "Error al intentar eliminar el usuario.";
        } else {
            // Manejar respuesta según API
            $response = json_decode($result, true);
            if (isset($response['error'])) {
                $error = $response['error'];
            } else {
                $mensaje = "✅ Usuario eliminado correctamente.";
            }
        }
    } else {
        $error = "Debes ingresar un usuario.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Eliminar Usuario - Agencia Vaca Bonita</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">

<header class="bg-red-700 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Agencia Vaca Bonita</h1>
        <nav class="space-x-6">
            <a href="admin_agencia.php" class="hover:underline">Volver</a>
            <a href="logout.php" class="hover:underline text-red-300">Cerrar sesión</a>
        </nav>
    </div>
</header>

<main class="max-w-lg mx-auto px-4 py-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Eliminar Usuario</h2>

    <?php if ($error): ?>
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <?= htmlspecialchars($error) ?>
        </div>
    <?php elseif ($mensaje): ?>
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <?= htmlspecialchars($mensaje) ?>
        </div>
    <?php endif; ?>

    <form method="POST" class="bg-white p-6 rounded-lg shadow-md space-y-4">
        <label for="usuario" class="block text-gray-700 font-semibold">Usuario a eliminar</label>
        <input type="text" name="usuario" id="usuario" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-indigo-500" required>

        <button type="submit" class="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
            Eliminar Usuario
        </button>
    </form>
</main>

</body>
</html>
