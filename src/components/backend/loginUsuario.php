<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $telefono = isset($_POST['telefono']) ? $_POST['telefono'] : null;
    $contrasena = isset($_POST['contrasena']) ? $_POST['contrasena'] : null;

    if (!$telefono || !$contrasena) {
        echo json_encode(["success" => false, "message" => "Faltan datos por rellenar"]);
        exit;
    }

    try {
        // Buscamos al usuario por su teléfono
        $sql = "SELECT id_usuario, nombre, contrasena FROM Usuario WHERE telefono = :tel LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['tel' => $telefono]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            // Verificamos si la contraseña coincide con el hash de la base de datos
            if (password_verify($contrasena, $usuario['contrasena'])) {
                echo json_encode([
                    "success" => true, 
                    "message" => "¡Bienvenido de nuevo!",
                    "nombre" => $usuario['nombre'],
                    "id_usuario" => $usuario['id_usuario']
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "La contraseña es incorrecta"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Este número de teléfono no está registrado"]);
        }

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
    }
}
?>
