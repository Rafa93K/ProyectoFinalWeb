<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Content-Security-Policy: upgrade-insecure-requests");

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = isset($_POST['nombre']) ? $_POST['nombre'] : null;
    $telefono = isset($_POST['telefono']) ? $_POST['telefono'] : null;
    $contrasena = isset($_POST['contrasena']) ? $_POST['contrasena'] : null;
    $confirmar_password = isset($_POST['confirmar_password']) ? $_POST['confirmar_password'] : null;

    if (!$nombre || !$telefono || !$contrasena || !$confirmar_password) {
        echo json_encode(["success" => false, "message" => "Faltan datos en el formulario"]);
        exit;
    }

    if ($contrasena !== $confirmar_password) {
        echo json_encode(["success" => false, "message" => "Las contraseñas no coinciden"]);
        exit;
    }

    if (strlen($telefono) < 9) {
        echo json_encode(["success" => false, "message" => "El número de teléfono debe tener al menos 9 dígitos"]);
        exit;
    }

    try {
        // 1. Verificar si el teléfono ya existe
        $sqlCheck = "SELECT nombre FROM Usuario WHERE telefono = :tel LIMIT 1";
        $stmtCheck = $pdo->prepare($sqlCheck);
        $stmtCheck->execute(['tel' => $telefono]);
        
        if ($stmtCheck->fetch()) {
            echo json_encode(["success" => false, "message" => "Este teléfono ya está registrado"]);
            exit;
        }

        // 2. Insertar (Ciframos la contraseña)
        $passHash = password_hash($contrasena, PASSWORD_BCRYPT);
        
        $sqlInsert = "INSERT INTO Usuario (nombre, telefono, contrasena) VALUES (:nom, :tel, :pass)";
        $stmtInsert = $pdo->prepare($sqlInsert);
        
        $resultado = $stmtInsert->execute([
            'nom'  => $nombre,
            'tel'  => $telefono,
            'pass' => $passHash
        ]);

        if ($resultado) {
            echo json_encode(["success" => true, "message" => "¡Registro completado!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al guardar en la base de datos"]);
        }

    } catch (PDOException $e) {
        // Si hay un error de SQL, este mensaje te lo dirá en la consola de React
        echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
    }
}
?>