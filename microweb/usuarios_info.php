<?php
session_start();

// Verifica si el usuario está logueado y es administrador de agencia
if (!isset($_SESSION['usuario']) || $_SESSION['tipo_usuario'] !== 'admin_agencia') {
    header("Location: index.php");
    exit();
}

$API_URL = "http://dns.vacabonita.com:3001/usuarios"; // Ajusta el puerto al de tu microservicio de usuarios
$usuarios = [];
$error = "";

// Llamada a la API de usuarios
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === FALSE || $httpcode !== 200) {
    $error = "Error al conectar con la API de usuarios. Código HTTP: $httpcode";
} else {
    $data = json_decode($response, true);
    if (!$data || isset($data['error'])) {
        $error = "No se encontraron usuarios.";
    } else {
        $usuarios = $data;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Información de Usuarios</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">

    <!-- Cabecera -->
    <header class="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
        <h1 class="text-xl font-bold">Agencia Vaca Bonita - Administrador de la Agencia</h1>
        <nav class="space-x-6">
            <a href="admin_agencia.php" class="hover:underline">Volver</a>
            <a href="logout.php" class="hover:underline text-red-300">Cerrar Sesión</a>
        </nav>
    </header>

    <!-- Contenido principal -->
    <main class="flex flex-col items-center mt-10 space-y-6 w-full">
        <div class="bg-white p-6 rounded-xl shadow-lg w-[1000px]">
            <h2 class="text-2xl font-bold text-indigo-700 mb-4">Usuarios Registrados</h2>

            <?php if ($error): ?>
                <p class="text-red-600 font-semibold"><?= $error ?></p>
            <?php elseif (!empty($usuarios)): ?>
                <div class="overflow-x-auto">
                    <table class="min-w-full border border-gray-200 rounded-lg shadow-sm">
                        <thead class="bg-indigo-600 text-white">
                            <tr>
                                <th class="px-4 py-2 text-left">Nombre</th>
                                <th class="px-4 py-2 text-left">Tipo de Usuario</th>
                                <th class="px-4 py-2 text-left">Género</th>
                                <th class="px-4 py-2 text-left">País</th>
                                <th class="px-4 py-2 text-left">Usuario</th>
                                <th class="px-4 py-2 text-left">Email</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <?php foreach ($usuarios as $u): ?>
                                <tr class="hover:bg-gray-100">
                                    <td class="px-4 py-2"><?= htmlspecialchars($u['nombre']) ?></td>
                                    <td class="px-4 py-2"><?= htmlspecialchars($u['tipo_usuario']) ?></td>
                                    <td class="px-4 py-2"><?= htmlspecialchars($u['genero']) ?></td>
                                    <td class="px-4 py-2"><?= htmlspecialchars($u['pais']) ?></td>
                                    <td class="px-4 py-2"><?= htmlspecialchars($u['usuario']) ?></td>
                                    <td class="px-4 py-2"><?= htmlspecialchars($u['email']) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php else: ?>
                <p class="text-gray-600">No hay usuarios registrados.</p>
            <?php endif; ?>
        </div>
    </main>

</body>
</html>
