<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recibir datos del formulario
    $usuario = $_POST['usuario'];
    $nombre_hotel = $_POST['nombre_hotel'];
    $calificacion = $_POST['calificacion'];
    $comentario = $_POST['comentario'];
    $puntaje_limpieza = $_POST['puntaje_limpieza'];
    $puntaje_facilidades = $_POST['puntaje_facilidades'];
    $puntaje_comodidades = $_POST['puntaje_comodidades'];

    // Construir arreglo para enviar al backend
    $data = array(
        "usuario" => $usuario,
        "nombre_hotel" => $nombre_hotel,
        "calificacion" => $calificacion,
        "comentario" => $comentario,
        "puntaje_limpieza" => $puntaje_limpieza,
        "puntaje_facilidades" => $puntaje_facilidades,
        "puntaje_comodidades" => $puntaje_comodidades
    );

    // Convertir a JSON
    $payload = json_encode($data);

    // URL de la API
    $url = "http://dns.vacabonita.com:3004/resenas";

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
        $mensaje = "❌ Error en la solicitud: " . curl_error($ch);
        $clase = "text-red-600 font-bold text-center mt-4";
    } else {
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($http_code == 200 || $http_code == 201) {
            $mensaje = "✅ Reseña enviada con éxito";
            $clase = "text-green-600 font-bold text-center mt-4";
        } else {
            $mensaje = "⚠️ Error al enviar la reseña. Respuesta: " . htmlspecialchars($response);
            $clase = "text-red-600 font-bold text-center mt-4";
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
  <title>Agencia Vaca Bonita - Crear Reseña</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex flex-col items-center justify-center">

  <!-- Encabezado -->
  <header class="w-full bg-indigo-700 text-white py-4 shadow-lg text-center">
    <h1 class="text-3xl font-bold">Agencia Vaca Bonita</h1>
    <p class="text-sm">Comparte tu experiencia en nuestros hoteles</p>
  </header>

  <!-- Contenedor -->
  <main class="bg-white shadow-md rounded-2xl p-8 mt-6 w-full max-w-lg">

    <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Crear Reseña</h2>

    <!-- Formulario -->
    <form method="POST" class="space-y-4">

      <!-- Usuario -->
      <div>
        <label class="block text-gray-700 font-semibold">Usuario</label>
        <input type="text" name="usuario" required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
      </div>

      <!-- Hotel -->
      <div>
        <label class="block text-gray-700 font-semibold">Nombre del Hotel</label>
        <input type="text" name="nombre_hotel" required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
      </div>

      <!-- Calificación -->
      <div>
        <label class="block text-gray-700 font-semibold">Calificación (1-5)</label>
        <input type="number" name="calificacion" min="1" max="5" required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
      </div>

      <!-- Comentario -->
      <div>
        <label class="block text-gray-700 font-semibold">Comentario</label>
        <textarea name="comentario" rows="3"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
      </div>

      <!-- Puntajes -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-gray-700 font-semibold text-sm">Limpieza (1-10)</label>
          <input type="number" name="puntaje_limpieza" min="1" max="10" required
            class="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-gray-700 font-semibold text-sm">Facilidades (1-10)</label>
          <input type="number" name="puntaje_facilidades" min="1" max="10" required
            class="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-gray-700 font-semibold text-sm">Comodidades (1-10)</label>
          <input type="number" name="puntaje_comodidades" min="1" max="10" required
            class="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-indigo-500">
        </div>
      </div>

      <!-- Botón -->
      <button type="submit"
        class="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition">
        Enviar Reseña
      </button>
    </form>

    <!-- Mensajes -->
    <?php if (!empty($mensaje)): ?>
      <p class="<?= $clase ?>"><?= $mensaje ?></p>
    <?php endif; ?>

    <!-- Botón para regresar -->
    <div class="mt-4 text-center">
      <a href="cliente.php"
         class="inline-block bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">
        ⬅️ Volver
      </a>
    </div>
  </main>
</body>
</html>