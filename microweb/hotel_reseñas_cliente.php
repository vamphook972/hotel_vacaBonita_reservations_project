<?php
// Ver reseñas de un hotel específico
$reseñas = [];
$promedios = null;
$error = null;

if (isset($_GET['id_hotel'])) {
    $id_hotel = intval($_GET['id_hotel']); // seguridad

    // --- Obtener reseñas ---
    $API_RESEÑAS = "http://dns.vacabonita.com:3004/resenas/hotel/" . $id_hotel;
    $response = @file_get_contents($API_RESEÑAS);

    if ($response !== FALSE) {
        $reseñas = json_decode($response, true);
    } else {
        $error = "No se pudieron obtener las reseñas para este hotel.";
    }

    // --- Obtener promedios ---
    $API_PROMEDIOS = "http://dns.vacabonita.com:3004/resenas/promedios/" . $id_hotel;
    $promResponse = @file_get_contents($API_PROMEDIOS);

    if ($promResponse !== FALSE) {
        $promedios = json_decode($promResponse, true);
    }

} else {
    $error = "No se especificó ningún hotel.";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Agencia Vaca Bonita - Reseñas</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">
    <!-- CABECERA -->
    <header class="bg-indigo-700 text-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold">Agencia Vaca Bonita</h1>
            <nav class="space-x-6">
                <a href="cliente.php" class="hover:underline">Volver</a>
                <a href="logout.php" class="hover:underline text-red-300">Cerrar sesión</a>
            </nav>
        </div>
    </header>

    <!-- CONTENIDO -->
    <main class="max-w-4xl mx-auto px-4 py-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
            Reseñas del Hotel (ID: <?= isset($_GET['id_hotel']) ? htmlspecialchars($_GET['id_hotel']) : "Desconocido" ?>)
        </h2>

        <!-- Mostrar promedios si existen -->
        <?php if ($promedios): ?>
            <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold text-indigo-700 mb-3">⭐ Promedios del Hotel</h3>
                <p class="text-gray-700">Estrellas: <span class="font-semibold"><?= htmlspecialchars($promedios['promedio_estrellas']) ?>/5</span></p>
                <p class="text-gray-700">Limpieza: <span class="font-semibold"><?= htmlspecialchars($promedios['promedio_limpieza']) ?>/10</span></p>
                <p class="text-gray-700">Facilidades: <span class="font-semibold"><?= htmlspecialchars($promedios['promedio_facilidades']) ?>/10</span></p>
                <p class="text-gray-700">Comodidades: <span class="font-semibold"><?= htmlspecialchars($promedios['promedio_comodidades']) ?>/10</span></p>
            </div>
        <?php endif; ?>

        <?php if ($error): ?>
            <p class="text-red-600 font-semibold"><?= $error ?></p>
        <?php elseif (empty($reseñas)): ?>
            <p class="text-gray-600">No hay reseñas para este hotel.</p>
        <?php else: ?>
            <div class="space-y-6">
                <?php foreach ($reseñas as $reseña): ?>
                    <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
                        <h3 class="text-lg font-bold text-indigo-700 mb-2">
                            Usuario: <?= htmlspecialchars($reseña['usuario']) ?>
                        </h3>
                        <p class="text-yellow-600 font-semibold mb-1">
                            ⭐ Calificación: <?= htmlspecialchars($reseña['numero_estrellas']) ?>/5
                        </p>
                        <?php if (!empty($reseña['comentario'])): ?>
                            <p class="text-gray-700 italic mb-2">
                                "<?= htmlspecialchars($reseña['comentario']) ?>"
                            </p>
                        <?php endif; ?>
                        <p class="text-gray-600 text-sm">
                            Limpieza: <?= htmlspecialchars($reseña['puntaje_limpieza']) ?>/10 |
                            Facilidades: <?= htmlspecialchars($reseña['puntaje_facilidades']) ?>/10 |
                            Comodidades: <?= htmlspecialchars($reseña['puntaje_comodidades']) ?>/10
                        </p>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>
