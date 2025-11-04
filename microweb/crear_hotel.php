<?php
session_start();

// Verificar sesión de usuario
if (!isset($_SESSION['usuario'])) {
    header("Location: index.php");
    exit;
}

$mensaje = null;
$error = null;

// Cuando el formulario se envía
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = $_SESSION['usuario']; // El usuario logueado
    $nombre_hotel = trim($_POST['nombre_hotel'] ?? '');
    $pais = trim($_POST['pais'] ?? '');
    $ciudad_direccion = trim($_POST['ciudad_direccion'] ?? '');
    $costo_habitacion = $_POST['costo_habitacion'] ?? [];
    $cantidad_habitaciones = $_POST['cantidad_habitaciones'] ?? [];

    if (!$nombre_hotel || !$pais || !$ciudad_direccion) {
        $error = "Todos los campos son obligatorios.";
    } else {
        $payload = [
            "usuario" => $usuario,
            "nombre_hotel" => $nombre_hotel,
            "pais" => $pais,
            "ciudad_direccion" => $ciudad_direccion,
            "costo_habitacion" => $costo_habitacion,
            "cantidad_habitaciones" => $cantidad_habitaciones
        ];

        $API_URL = "http://dns.vacabonita.com:3002/hoteles";

        // --- USANDO CURL ---
        $ch = curl_init($API_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            $error = "Error en la petición: " . curl_error($ch);
        } else {
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            if ($httpCode >= 200 && $httpCode < 300) {
                $data = json_decode($response, true);
                if (isset($data['error'])) {
                    $error = $data['error'];
                } else {
                    $mensaje = "✅ Hotel creado exitosamente con ID " . htmlspecialchars($data['id_hotel']);
                }
            } else {
                $error = "El servicio devolvió HTTP $httpCode → " . htmlspecialchars($response);
            }
        }
        curl_close($ch);
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Crear Hotel - Agencia Vaca Bonita</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">
  <div class="max-w-3xl mx-auto py-10">
    <h1 class="text-3xl font-bold text-indigo-700 mb-6">Crear un Nuevo Hotel</h1>

    <?php if ($error): ?>
      <p class="bg-red-100 text-red-700 px-4 py-2 rounded mb-4"><?= htmlspecialchars($error) ?></p>
    <?php elseif ($mensaje): ?>
      <p class="bg-green-100 text-green-700 px-4 py-2 rounded mb-4"><?= htmlspecialchars($mensaje) ?></p>
    <?php endif; ?>

    <form method="POST" class="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label class="block font-semibold">Nombre del Hotel:</label>
        <input type="text" name="nombre_hotel" class="w-full border px-3 py-2 rounded" required>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block font-semibold">País:</label>
          <input type="text" name="pais" class="w-full border px-3 py-2 rounded" required>
        </div>
        <div>
          <label class="block font-semibold">Ciudad y direccion:</label>
          <input type="text" name="ciudad_direccion" class="w-full border px-3 py-2 rounded" required>
        </div>
      </div>

      <h2 class="text-xl font-bold text-gray-700 mt-4">Habitaciones</h2>
      <p class="text-gray-500 mb-2">Ingrese costo y cantidad para cada tipo de habitación</p>

      <div class="grid grid-cols-2 gap-4">
        <!-- ESTANDAR -->
        <div>
          <label class="block">Costo Habitación Estándar:</label>
          <input type="number" step="0.01" name="costo_habitacion[estandar]" class="w-full border px-3 py-2 rounded">
        </div>
        <div>
          <label class="block">Cantidad Habitación Estándar:</label>
          <input type="number" name="cantidad_habitaciones[estandar]" class="w-full border px-3 py-2 rounded">
        </div>

        <!-- DELUXE -->
        <div>
          <label class="block">Costo Habitación Deluxe:</label>
          <input type="number" step="0.01" name="costo_habitacion[deluxe]" class="w-full border px-3 py-2 rounded">
        </div>
        <div>
          <label class="block">Cantidad Habitación Deluxe:</label>
          <input type="number" name="cantidad_habitaciones[deluxe]" class="w-full border px-3 py-2 rounded">
        </div>

        <!-- SUITE -->
        <div>
          <label class="block">Costo Habitación Suite:</label>
          <input type="number" step="0.01" name="costo_habitacion[suite]" class="w-full border px-3 py-2 rounded">
        </div>
        <div>
          <label class="block">Cantidad Habitación Suite:</label>
          <input type="number" name="cantidad_habitaciones[suite]" class="w-full border px-3 py-2 rounded">
        </div>
      </div>

      <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        Crear Hotel
      </button>
    </form>

    <div class="mt-6">
      <a href="admin_hotel.php" class="text-indigo-600 hover:underline">Volver</a>
    </div>
  </div>
</body>
</html>