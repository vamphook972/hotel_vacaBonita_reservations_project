<?php
session_start();

// Verificar si el usuario ha iniciado sesión y es cliente
if (!isset($_SESSION['usuario']) || $_SESSION['tipo_usuario'] !== 'cliente') {
    header("Location: index.php");
    exit;
}

$usuario = $_SESSION['usuario'];

// URL del microservicio de reservas
$API_URL = "http://dns.vacabonita.com:3003/reservations/user/" . urlencode($usuario);

$reservas = [];
$error = null;

$response = @file_get_contents($API_URL);

if ($response !== FALSE) {
    $reservas = json_decode($response, true);
} else {
    $error = "No se pudieron obtener tus reservas desde la API.";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mis Reservas - Agencia Vaca Bonita</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">

  <div class="max-w-5xl mx-auto py-10">
    <h1 class="text-3xl font-bold text-indigo-700 mb-6">Mis Reservas</h1>

    <?php if ($error): ?>
      <p class="text-red-600 font-semibold"><?= $error ?></p>
    <?php elseif (empty($reservas)): ?>
      <p class="text-gray-600">No tienes reservas registradas aún.</p>
    <?php else: ?>
      <div class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full text-sm text-gray-700">
          <thead class="bg-indigo-600 text-white">
            <tr>
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Hotel</th>
              <th class="px-4 py-2">Habitación</th>
              <th class="px-4 py-2">Ocupantes</th>
              <th class="px-4 py-2">Inicio</th>
              <th class="px-4 py-2">Fin</th>
              <th class="px-4 py-2">Estado</th>
              <th class="px-4 py-2">Costo</th>
              <th class="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($reservas as $row): ?>
              <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-2"><?= htmlspecialchars($row['id']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['id_hotel']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['id_room']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['occupants_number']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['start_date']) ?></td>
                <td class="px-4 py-2"><?= htmlspecialchars($row['end_date']) ?></td>
                <td class="px-4 py-2 font-semibold 
                    <?= $row['state'] === 'pending' ? 'text-yellow-600' : ($row['state'] === 'finished' ? 'text-green-600' : 'text-indigo-600') ?>">
                    <?= ucfirst(htmlspecialchars($row['state'])) ?>
                </td>
                <td class="px-4 py-2">$<?= number_format($row['cost'], 2) ?></td>
                <td class="px-4 py-2">
                  <?php if ($row['state'] === 'pending'): ?>
                    <button onclick="pagarReserva(<?= $row['id'] ?>)" 
                      class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                      Pagar
                    </button>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>

    <div class="mt-6">
      <a href="cliente.php" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Volver</a>
    </div>
  </div>

  <script>
  async function pagarReserva(id) {
    if (!confirm("¿Deseas pagar y confirmar esta reserva?")) return;

    try {
      const response = await fetch(`http://dns.vacabonita.com:3003/reservations/${id}/state`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ state: "confirm" })
      });

      if (response.ok) {
        alert("Reserva confirmada con éxito.");
        location.reload();
      } else {
        const error = await response.json();
        alert("Error: " + error.error);
      }
    } catch (err) {
      alert("No se pudo conectar con el servidor.");
      console.error(err);
    }
  }
  </script>

</body>
</html>