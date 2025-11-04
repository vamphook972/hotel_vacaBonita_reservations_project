<?php
$errorMsg = ""; // variable para guardar el error del servidor

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recibir datos del formulario
    $user = $_POST['user'];
    $occupants_number = $_POST['occupants_number'];
    $id_room = $_POST['id_room'];
    $start_date = $_POST['start_date'];
    $end_date = $_POST['end_date'];

    // Construir arreglo para enviar al backend
    $data = array(
        "user" => $user,
        "occupants_number" => $occupants_number,
        "id_room" => $id_room,
        "start_date" => $start_date,
        "end_date" => $end_date
    );

    // Convertir a JSON
    $payload = json_encode($data);

    // URL de la API
    $url = "http://dns.vacabonita.com:3003/reservations";

    // Inicializar cURL
    $ch = curl_init($url);

    // Configuración de cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

    // Ejecutar la petición
    $response = curl_exec($ch);

    // Manejar errores
    if (curl_errno($ch)) {
        $errorMsg = "Error en la solicitud: " . curl_error($ch);
    } else {
        $decoded = json_decode($response, true);
        if (isset($decoded['error'])) {
            // Si viene un error desde la API
            $errorMsg = $decoded['error'];
        } else {
            // Si todo salió bien (puedes redirigir o mostrar un mensaje de éxito)
            header("Location: cliente.php?success=1");
            exit;
        }
    }

    // Cerrar cURL
    curl_close($ch);
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Crear Reserva</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <h1 class="text-2xl font-bold mb-4 text-center">Crear Reserva</h1>
        <form method="POST" action="">
            <div class="mb-4">
                <label class="block text-gray-700">Usuario</label>
                <input type="text" name="user" required class="w-full px-3 py-2 border rounded">
            </div>
            <div class="mb-4">
                <label class="block text-gray-700">Número de Ocupantes</label>
                <input type="number" name="occupants_number" required min="1" class="w-full px-3 py-2 border rounded">
            </div>
            <div class="mb-4">
                <label class="block text-gray-700">ID Habitación</label>
                <input type="number" name="id_room" required class="w-full px-3 py-2 border rounded">
            </div>
            <div class="mb-4">
                <label class="block text-gray-700">Fecha de Inicio</label>
                <input type="date" name="start_date" required class="w-full px-3 py-2 border rounded">
            </div>
            <div class="mb-4">
                <label class="block text-gray-700">Fecha de Fin</label>
                <input type="date" name="end_date" required class="w-full px-3 py-2 border rounded">
            </div>
            <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 mb-2">Crear Reserva</button>
        </form>

        <!-- Mostrar mensaje de error si existe -->
        <?php if (!empty($errorMsg)): ?>
            <div class="mt-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
                ⚠️ <?php echo htmlspecialchars($errorMsg); ?>
            </div>
        <?php endif; ?>

        <!-- Botón para regresar -->
        <div class="mt-4 text-center">
            <a href="cliente.php"
               class="inline-block bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">
                ⬅️ Volver
            </a>
        </div>
    </div>
</body>
</html>