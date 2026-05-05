<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = isset($_POST['token']) ? $_POST['token'] : null;
    $nuevaPassword = isset($_POST['password']) ? $_POST['password'] : null;

    if (!$token || !$nuevaPassword) {
        echo json_encode(["success" => false, "message" => "Datos incompletos"]);
        exit;
    }

    try {
        // 1. Buscar el token y verificar que no haya expirado
        $sql = "SELECT id_usuario FROM Usuario WHERE reset_token = :token AND token_expira > NOW() LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['token' => $token]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(["success" => false, "message" => "El enlace es inválido o ha expirado"]);
            exit;
        }

        // 2. Cifrar la nueva contraseña
        $passHash = password_hash($nuevaPassword, PASSWORD_BCRYPT);

        // 3. Actualizar la contraseña y borrar el token
        $sqlActualizar = "UPDATE Usuario SET contrasena = :pass, reset_token = NULL, token_expira = NULL WHERE id_usuario = :id";
        $stmtActualizar = $pdo->prepare($sqlActualizar);
        $stmtActualizar->execute([
            'pass' => $passHash,
            'id'   => $usuario['id_usuario']
        ]);

        echo json_encode(["success" => true, "message" => "Contraseña actualizada correctamente"]);

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
    }
}
?>
