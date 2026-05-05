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
    $email = isset($_POST['email']) ? $_POST['email'] : null;

    if (!$nombre || !$telefono || !$contrasena || !$confirmar_password || !$email) {
        echo json_encode(["success" => false, "message" => "Faltan datos en el formulario"]);
        exit;
    }

    if ($contrasena !== $confirmar_password) {
        echo json_encode(["success" => false, "message" => "Las contraseñas no coinciden"]);
        exit;
    }

    if (strlen($telefono) !== 9) {
        echo json_encode(["success" => false, "message" => "El número de teléfono debe tener exactamente 9 dígitos"]);
        exit;
    }

    try {
        // 1. Verificar si el teléfono o el email ya existen
        $sqlCheck = "SELECT nombre FROM Usuario WHERE telefono = :tel OR email = :email LIMIT 1";
        $stmtCheck = $pdo->prepare($sqlCheck);
        $stmtCheck->execute(['tel' => $telefono, 'email' => $email]);
        
        $usuarioExistente = $stmtCheck->fetch();
        if ($usuarioExistente) {
            echo json_encode(["success" => false, "message" => "El teléfono o el correo ya están registrados"]);
            exit;
        }

        // 2. Insertar (Ciframos la contraseña)
        $passHash = password_hash($contrasena, PASSWORD_BCRYPT);
        
        $sqlInsert = "INSERT INTO Usuario (nombre, telefono, email, contrasena) VALUES (:nom, :tel, :email, :pass)";
        $stmtInsert = $pdo->prepare($sqlInsert);
        
        $resultado = $stmtInsert->execute([
            'nom'   => $nombre,
            'tel'   => $telefono,
            'email' => $email,
            'pass'  => $passHash
        ]);

        if ($resultado) {
            $id_usuario = $pdo->lastInsertId();
            echo json_encode([
                "success" => true, 
                "message" => "¡Registro completado!",
                "id_usuario" => $id_usuario
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al guardar en la base de datos"]);
        }

    } catch (PDOException $e) {
        // Si hay un error de SQL, este mensaje te lo dirá en la consola de React
        echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
    }
}
?>