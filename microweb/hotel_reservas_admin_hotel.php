<?php
session_start();

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['usuario'])) {
    header("Location: index.php");
    exit;
}

// Validar que venga el id_hotel por GET
if (!isset($_GET['id_hotel'])) {
    die("No se especificó el hotel.");
}

$id_hotel = intval($_GET['id_hotel']);

// URL del microservicio de reservas por hotel
$API_URL = "http://dns.vacabonita.com:3003/reservations/hotel/" . urlencode($id_hotel);

$reservas = [];
$error = null;

$response = @file_get_contents($API_URL);

if ($response !== FALSE) {
    $reservas = json_decode($response, true);
} else {
    $error = "No se pudieron obtener las reservas del hotel.";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reservas del Hotel <?= htmlspecialchars($id_hotel) ?> - Agencia Vaca Bonita</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">

  <div class="max-w-5xl mx-auto py-10">
    <h1 class="text-3xl font-bold text-indigo-700 mb-6">Reservas del Hotel (ID: <?= htmlspecialchars($id_hotel) ?>)</h1>

    <?php if ($error): ?>
      <p class="text-red-600 font-semibold"><?= $error ?></p>
    <?php elseif (empty($reservas)): ?>
      <p class="text-gray-600">Este hotel no tiene reservas registradas aún.</p>
    <?php else: ?>
      <div class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full text-sm text-gray-700">
          <thead class="bg-indigo-600 text-white">
            <tr>
              <th class="px-4 py-2">ID Reserva</th>
              <th class="px-4 py-2">Usuario</th>
              <th class="px-4 py-2">Habitación</th>
              <th class="px-4 py-2">Ocupantes</th>
              <th class="px-4 py-2">Inicio</th>
              <th class="px-4 py-2">Fin</th>
              <th class="px-4 py-2">Estado</th>
              <th class="px-4 py-2">Costo</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($reservas as $row): ?>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-2"><?= htmlspecialchars($row['id']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['user']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['id_room']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['occupants_number']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['start_date']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['end_date']) ?></td>
                <td class="px-4 py-2 font-semibold 
                    <?= $row['state'] === 'pending' ? 'text-yellow-600' : ($row['state'] === 'finished' ? 'text-green-600' : 'text-indigo-600') ?>">
                    <?= ucfirst(htmlspecialchars($row['state'])) ?>
                </td>
                <td class="px-4 py-2">$<?= number_format($row['cost'], 2) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>

    <div class="mt-6">
      <a href="admin_hotel.php" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Volver</a>
    </div>
  </div>

</body>
</html>
