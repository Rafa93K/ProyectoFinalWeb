<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['usuario'] ?? '';
    $pass = $_POST['contrasena'] ?? '';

    if (empty($user) || empty($pass)) {
        echo json_encode(["success" => false, "message" => "Faltan datos"]);
        exit;
    }

    try {
        // Consulta a la tabla Administrador usando PDO (que es lo que hay en conexion.php)
        $stmt = $pdo->prepare("SELECT nombre FROM Administrador WHERE nombre = ? AND contrasena = ?");
        $stmt->execute([$user, $pass]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin) {
            echo json_encode([
                "success" => true,
                "message" => "Acceso concedido",
                "nombre" => $admin['nombre']
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Usuario o contraseña incorrectos"
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
    }
}
?>
