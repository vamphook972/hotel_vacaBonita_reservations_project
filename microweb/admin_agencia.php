<?php
session_start();

// Verifica si el usuario está logueado y es administrador de agencia
if (!isset($_SESSION['usuario']) || $_SESSION['tipo_usuario'] !== 'admin_agencia') {
    header("Location: index.php");
    exit();
}

$API_URL = "http://dns.vacabonita.com:3002/hoteles"; 
$hoteles = [];
$error = "";

// Obtener todos los hoteles
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === FALSE || $httpcode !== 200) {
    $error = "Error al conectar con la API de hoteles. Código HTTP: $httpcode";
} else {
    $data = json_decode($response, true);
    if (!$data || isset($data['error'])) {
        $error = "No se encontraron hoteles.";
    } else {
        $hoteles = $data;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Agencia Vaca Bonita - Panel Agencia</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">

    <!-- Cabecera -->
    <header class="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
        <h1 class="text-xl font-bold">Agencia Vaca Bonita - Administrador de la Agencia</h1>
        <nav class="space-x-6">
            <a href="usuarios_info.php" class="hover:underline">Ver información de usuarios</a>
            <a href="cambiar_contraseña_agencia.php" class="hover:underline">Cambiar contraseña</a>
            <a href="eliminar_usuarios.php" class="hover:underline">Eliminar usuarios</a>
            <a href="logout.php" class="hover:underline text-red-300">Cerrar Sesión</a>
        </nav>
    </header>

    <!-- Contenido principal -->
    <main class="flex flex-col items-center mt-10 space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-lg w-[800px]">
            <h2 class="text-2xl font-bold text-indigo-700 mb-4">Hoteles de la Agencia</h2>

            <?php if ($error): ?>
                <p class="text-red-600 font-semibold"><?= $error ?></p>
            <?php elseif (!empty($hoteles)): ?>
                <?php foreach ($hoteles as $hotel): ?>
                    <!-- Caja de información de cada hotel -->
                    <div class="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50 mb-6">
                        <p><span class="font-semibold">ID:</span> <?= htmlspecialchars($hotel['id']) ?></p>
                        <p><span class="font-semibold">Usuario:</span> <?= htmlspecialchars($hotel['usuario']) ?></p>
                        <p><span class="font-semibold">Nombre:</span> <?= htmlspecialchars($hotel['nombre_hotel']) ?></p>
                        <p><span class="font-semibold">País:</span> <?= htmlspecialchars($hotel['pais']) ?></p>
                        <p><span class="font-semibold">Ciudad y direccion:</span> <?= htmlspecialchars($hotel['ciudad_direccion']) ?></p>

                        <!-- Botones organizados en 2 filas -->
                        <div class="mt-6 space-y-4">
                            <!-- Fila 1 -->
                            <div class="flex space-x-4">
                                <a href="hotel_reseñas_admin_agencia.php?id_hotel=<?= urlencode($hotel['id']) ?>" 
                                   class="flex-1 text-center bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
                                   Ver Reseñas
                                </a>
                                <a href="hotel_reservas_admin_agencia.php?id_hotel=<?= urlencode($hotel['id']) ?>" 
                                   class="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                                   Ver Reservas
                                </a>
                            </div>
                            <!-- Fila 2 -->
                            <div class="flex space-x-4">
                                <a href="ver_habitaciones_admin_agencia.php?id=<?= $hotel['id'] ?>" 
                                   class="flex-1 text-center bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                                   Ver Habitaciones
                                </a>
                                <a href="cambiar_estado_hotel.php?id=<?= $hotel['id'] ?>" 
                                   class="flex-1 text-center bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                                   Cambiar estado
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </main>

</body>
</html>
