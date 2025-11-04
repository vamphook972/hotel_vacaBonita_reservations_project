<?php
session_start();

// Verificar si hay usuario logueado
if (!isset($_SESSION['usuario'])) {
    header("Location: index.php");
    exit();
}

// Consumir API de hoteles SOLO en estado activo
$API_URL = "http://dns.vacabonita.com:3002/hoteles/estado/activo"; 
$hoteles = [];

$response = @file_get_contents($API_URL);
if ($response !== FALSE) {
    $hoteles = json_decode($response, true);
} else {
    $error = "No se pudo obtener la lista de hoteles.";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Agencia Vaca Bonita - Hoteles</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">

  <!-- CABECERA -->
  <header class="bg-indigo-700 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Agencia Vaca Bonita</h1>
      <nav class="space-x-6">
        <a href="reservar.php" class="hover:underline">Hacer reservas</a>
        <a href="mis_reservas.php" class="hover:underline">Mis reservas</a>
        <a href="reseñas.php" class="hover:underline">Reseñas</a>
        <a href="cambiar_contraseña_cliente.php" class="hover:underline">Cambiar contraseña</a>
        <a href="logout.php" class="hover:underline text-red-300">Cerrar sesión</a>
      </nav>
    </div>
  </header>

  <!-- CONTENIDO -->
  <main class="max-w-7xl mx-auto px-4 py-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Hoteles Internacionales Disponibles</h2>

    <?php if (isset($error)): ?>
      <p class="text-red-600 font-semibold"><?= $error ?></p>
    <?php elseif (empty($hoteles)): ?>
      <p class="text-gray-600 font-semibold">No hay hoteles activos en este momento.</p>
    <?php else: ?>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ($hoteles as $hotel): ?>
          <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
            <h3 class="text-xl font-bold text-indigo-700 mb-2">
              <?= htmlspecialchars($hotel['nombre_hotel']) ?>
            </h3>
            <p class="text-gray-600">
              <strong>Ubicación:</strong> <?= htmlspecialchars($hotel['ciudad_direccion']) ?>, <?= htmlspecialchars($hotel['pais']) ?>
            </p>
            
            <!-- Enlace pasando el ID del hotel -->
            <a href="hotel_habitaciones_cliente.php?id=<?= urlencode($hotel['id']) ?>" 
               class="mt-4 inline-block w-full text-center bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
              Ver habitaciones
            </a>

            <!-- Enlace reseñas -->
            <a href="hotel_reseñas_cliente.php?id_hotel=<?= urlencode($hotel['id']) ?>" 
              class="mt-4 inline-block w-full text-center bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
              Ver reseñas
            </a>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </main>

</body>
</html>
