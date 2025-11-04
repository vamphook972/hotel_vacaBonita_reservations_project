<?php
session_start();

// Verifica si el usuario está logueado
if (!isset($_SESSION['usuario'])) {
    header("Location: index.php");
    exit();
}

$mensaje = "";
$error = "";

// Cuando se envía el formulario
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nuevo_password = $_POST['password'] ?? "";

    if (empty($nuevo_password)) {
        $error = "Debes ingresar una nueva contraseña.";
    } else {
        $usuario = $_SESSION['usuario'];
        $API_URL = "http://dns.vacabonita.com:3001/usuarios/$usuario/password";

        // Petición PUT a la API
        $ch = curl_init($API_URL);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["password" => $nuevo_password]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Content-Length: " . strlen(json_encode(["password" => $nuevo_password]))
        ]);

        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpcode === 200) {
            $mensaje = "✅ Contraseña actualizada correctamente.";
        } elseif ($httpcode === 404) {
            $error = "Usuario no encontrado.";
        } else {
            $error = "Error al actualizar la contraseña. Código HTTP: $httpcode";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Cambiar Contraseña</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">

    <!-- Cabecera -->
    <header class="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
        <h1 class="text-xl font-bold">Agencia Vaca Bonita - Administrador de la Agencia</h1>
        <nav class="space-x-6">
            <a href="cliente.php" class="hover:underline">Volver</a>
            <a href="logout.php" class="hover:underline text-red-300">Cerrar Sesión</a>
        </nav>
    </header>

    <!-- Contenido principal -->
    <main class="flex justify-center mt-10">
        <div class="bg-white p-6 rounded-xl shadow-lg w-[500px]">
            <h2 class="text-2xl font-bold text-indigo-700 mb-4">Cambiar Contraseña</h2>

            <?php if ($mensaje): ?>
                <p class="text-green-600 font-semibold mb-4"><?= $mensaje ?></p>
            <?php endif; ?>

            <?php if ($error): ?>
                <p class="text-red-600 font-semibold mb-4"><?= $error ?></p>
            <?php endif; ?>

            <form method="POST" class="space-y-4">
                <div>
                    <label class="block text-gray-700">Nueva Contraseña:</label>
                    <input type="password" name="password" class="w-full p-2 border border-gray-300 rounded-lg" required>
                </div>

                <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 w-full">
                    Cambiar Contraseña
                </button>
            </form>
        </div>
    </main>

</body>
</html>