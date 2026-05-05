<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Importar clases de PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer-6.10.0/src/Exception.php';
require 'PHPMailer-6.10.0/src/PHPMailer.php';
require 'PHPMailer-6.10.0/src/SMTP.php';
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? $_POST['email'] : null;

    if (!$email) {
        echo json_encode(["success" => false, "message" => "El email es obligatorio"]);
        exit;
    }

    try {
        // 1. Verificar si el email existe
        $sql = "SELECT id_usuario, nombre FROM Usuario WHERE email = :email LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['email' => $email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            // Por seguridad, a veces es mejor decir que se envió el correo aunque no exista
            // Pero aquí seremos directos por ahora
            echo json_encode(["success" => false, "message" => "Este correo no está registrado"]);
            exit;
        }

        // 2. Generar token único y expiración (1 hora)
        $token = bin2hex(random_bytes(32));
        $expiracion = date("Y-m-d H:i:s", strtotime('+1 hour'));

        // 3. Guardar token en la base de datos
        // NOTA: Asegúrate de haber añadido las columnas reset_token y token_expira a la tabla Usuario
        $sqlActualizar = "UPDATE Usuario SET reset_token = :token, token_expira = :exp WHERE id_usuario = :id";
        $stmtActualizar = $pdo->prepare($sqlActualizar);
        $stmtActualizar->execute([
            'token' => $token,
            'exp'   => $expiracion,
            'id'    => $usuario['id_usuario']
        ]);

        // 4. Enviar Email con PHPMailer
        $mail = new PHPMailer(true);

        try {
            // Configuración del servidor (DEBES RELLENAR ESTO)
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'rafa93k@gmail.com'; 
            $mail->Password   = 'yosk rvkh yioa dqjz';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            // Destinatarios
            $mail->setFrom('rafa93k@gmail.com', 'El Fogon');
            $mail->addAddress($email, $usuario['nombre']);

            // Contenido
            $mail->isHTML(true);
            $mail->Subject = 'Recuperar Contraseña - El Fogon';
            
            // El enlace debe apuntar a tu frontend
            $enlace = "https://rafa.cicloflorenciopintado.es/reset-password/" . $token;
            
            $mail->Body = "
                <h2>Hola, {$usuario['nombre']}</h2>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <p><a href='{$enlace}'>Restablecer mi contraseña</a></p>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no has solicitado esto, puedes ignorar este correo.</p>
            ";

            $mail->send();
            echo json_encode(["success" => true, "message" => "Correo enviado correctamente"]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error al enviar el correo: {$mail->ErrorInfo}"]);
        }

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
    }
}
?>
