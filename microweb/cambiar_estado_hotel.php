<?php
session_start();

// Verifica si el usuario está logueado y es administrador de agencia
if (!isset($_SESSION['usuario']) || $_SESSION['tipo_usuario'] !== 'admin_agencia') {
    header("Location: index.php");
    exit();
}

if (!isset($_GET['id'])) {
    die("ID del hotel no especificado.");
}

$id_hotel = $_GET['id'];
$API_URL = "http://dns.vacabonita.com:3002/hoteles/$id_hotel";
$mensaje = "";
$error = "";
$hotel = null;

// Consultar información del hotel actual
$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode === 200) {
    $hotel = json_decode($response, true);
} else {
    $error = "No se pudo obtener la información del hotel.";
}

// Si se envía el formulario
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nuevo_estado = $_POST['estado'] ?? "";

    if (!in_array($nuevo_estado, ["activo", "inactivo"])) {
        $error = "El estado debe ser 'activo' o 'inactivo'.";
    } else {
        $ch = curl_init($API_URL);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["estado" => $nuevo_estado]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpcode === 200) {
            $mensaje = "✅ Estado del hotel actualizado correctamente.";
            // Actualizar estado en variable local para mostrarlo sin recargar de nuevo
            $hotel['estado'] = $nuevo_estado;
        } else {
            $error = "Error al actualizar el estado del hotel (HTTP $httpcode).";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Cambiar Estado del Hotel</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">

    <!-- Cabecera -->
    <header class="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
        <h1 class="text-xl font-bold">Agencia Vaca Bonita - Administrador de la Agencia</h1>
        <nav class="space-x-6">
            <a href="admin_agencia.php" class="hover:underline">Volver al Panel</a>
            <a href="logout.php" class="hover:underline text-red-300">Cerrar Sesión</a>
        </nav>
    </header>

    <!-- Contenido principal -->
    <main class="flex justify-center mt-10">
        <div class="bg-white p-6 rounded-xl shadow-lg w-[500px]">
            <h2 class="text-2xl font-bold text-indigo-700 mb-4">Cambiar Estado del Hotel</h2>

            <?php if ($mensaje): ?>
                <p class="text-green-600 font-semibold mb-4"><?= $mensaje ?></p>
            <?php endif; ?>

            <?php if ($error): ?>
                <p class="text-red-600 font-semibold mb-4"><?= $error ?></p>
            <?php endif; ?>

            <?php if ($hotel): ?>
                <p><span class="font-semibold">ID:</span> <?= htmlspecialchars($hotel['id']) ?></p>
                <p><span class="font-semibold">Nombre:</span> <?= htmlspecialchars($hotel['nombre_hotel']) ?></p>
                <p><span class="font-semibold">Estado actual:</span> 
                    <span class="<?= $hotel['estado'] === 'activo' ? 'text-green-600' : 'text-red-600' ?>">
                        <?= htmlspecialchars($hotel['estado']) ?>
                    </span>
                </p>

                <form method="POST" class="mt-4 space-y-4">
                    <label class="block text-gray-700">Nuevo Estado:</label>
                    <select name="estado" class="w-full p-2 border border-gray-300 rounded-lg" required>
                        <option value="activo" <?= $hotel['estado'] === 'activo' ? 'selected' : '' ?>>Activo</option>
                        <option value="inactivo" <?= $hotel['estado'] === 'inactivo' ? 'selected' : '' ?>>Inactivo</option>
                    </select>

                    <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full">
                        Cambiar Estado
                    </button>
                </form>
            <?php endif; ?>
        </div>
    </main>

</body>
</html>
