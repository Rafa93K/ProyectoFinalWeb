<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_usuario = isset($_POST['id_usuario']) ? $_POST['id_usuario'] : null;
    $id_producto = isset($_POST['id_producto']) ? $_POST['id_producto'] : null;
    $puntuacion = isset($_POST['puntuacion']) ? $_POST['puntuacion'] : 5; // Por defecto 5 si no se especifica

    if (!$id_usuario || !$id_producto) {
        echo json_encode(["success" => false, "message" => "Faltan datos obligatorios"]);
        exit;
    }

    try {
        // Comprobamos si ya ha votado y qué puntuación dio
        $sqlCheck = "SELECT puntuacion FROM Voto WHERE id_usuario = :u AND id_producto = :p";
        $stmtCheck = $pdo->prepare($sqlCheck);
        $stmtCheck->execute(['u' => $id_usuario, 'p' => $id_producto]);
        $votoExistente = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        
        if ($votoExistente) {
            if ($votoExistente['puntuacion'] == $puntuacion) {
                // Si pulsa la MISMA puntuación, eliminamos el voto (Toggle off)
                $sql = "DELETE FROM Voto WHERE id_usuario = :u AND id_producto = :p";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(['u' => $id_usuario, 'p' => $id_producto]);
                echo json_encode(["success" => true, "message" => "Voto eliminado", "action" => "deleted"]);
            } else {
                // Si pulsa una puntuación DISTINTA, actualizamos
                $sql = "UPDATE Voto SET puntuacion = :score WHERE id_usuario = :u AND id_producto = :p";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(['u' => $id_usuario, 'p' => $id_producto, 'score' => $puntuacion]);
                echo json_encode(["success" => true, "message" => "Voto actualizado", "action" => "updated"]);
            }
        } else {
            // Si no existe, INSERTAMOS
            $sql = "INSERT INTO Voto (id_usuario, id_producto, puntuacion) VALUES (:u, :p, :score)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['u' => $id_usuario, 'p' => $id_producto, 'score' => $puntuacion]);
            echo json_encode(["success" => true, "message" => "Voto registrado", "action" => "inserted"]);
        }

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
    }
}
?>
