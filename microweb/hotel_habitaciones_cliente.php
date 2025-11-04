<?php
// hotel_habitaciones.php
// Obtener el id del hotel desde la URL
$id_hotel = isset($_GET['id']) ? intval($_GET['id']) : 0;

$API_URL = "http://dns.vacabonita.com:3005/habitacionesHotel/$id_hotel";
$response = @file_get_contents($API_URL);

if ($response !== FALSE) {
    $habitaciones = json_decode($response, true);

    // DEBUG: muestra lo que devuelve la API (usar solo en pruebas)
// echo "<pre>API URL: $API_URL\nRespuesta:\n";
// print_r($habitaciones);
// echo "</pre>";
// exit;

} else {
    $error = "No hay habitaciones diponibles para este hotel";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Habitaciones del Hotel</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">

  <!-- CABECERA -->
  <header class="bg-indigo-700 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Agencia Vaca Bonita</h1>
      <nav class="space-x-6">
        <a href="cliente.php" class="hover:underline">Hoteles</a>
       <a href="habitaciones_disponibles.php?id=<?= $id_hotel ?>" class="hover:underline">Ver habitaciones disponibles</a>
        <a href="reservar.php" class="hover:underline">Hacer reservas</a>
        <a href="mis_reservas.php" class="hover:underline">Mis reservas</a>
        <a href="reseñas.php" class="hover:underline">Reseñas</a>
        <a href="logout.php" class="hover:underline text-red-300">Cerrar sesión</a>
      </nav>
    </div>
  </header>

  <!-- CONTENIDO -->
  <main class="max-w-7xl mx-auto px-4 py-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Habitaciones del Hotel</h2>

    <?php if (isset($error)): ?>
      <p class="text-red-600 font-semibold"><?= $error ?></p>
    <?php else: ?>
      <?php if (empty($habitaciones)): ?>
        <p class="text-gray-700">No hay habitaciones disponibles en este hotel.</p>
      <?php else: ?>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <?php foreach ($habitaciones as $habitacion): ?>
            <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
              <h3 class="text-xl font-bold text-indigo-700 mb-2">Habitación <?= htmlspecialchars($habitacion['numero_habitacion']) ?></h3>
              <p class="text-gray-600"><strong>Tipo:</strong> <?= htmlspecialchars($habitacion['tipo_habitacion']) ?></p>
              <p class="text-gray-600"><strong>Ocupantes:</strong> <?= htmlspecialchars($habitacion['numero_ocupantes']) ?></p>
              <p class="text-gray-600"><strong>Estado:</strong> <?= htmlspecialchars($habitacion['estado']) ?></p>
              <p class="text-gray-600"><strong>Costo:</strong> $<?= number_format($habitacion['costo_habitacion'], 2) ?></p>

              <a href="reservar.php?habitacion=<?= $habitacion['id_habitacion'] ?>" 
                 class="mt-4 inline-block w-full text-center bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Reservar
              </a>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    <?php endif; ?>
  </main>

</body>
</html>