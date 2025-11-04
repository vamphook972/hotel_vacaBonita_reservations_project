<?php
session_start();      // Inicia sesión
session_unset();      // Borra todas las variables de sesión
session_destroy();    // Destruye la sesión

// Redirige al login
header("Location: index.php?logout=1");
exit();
