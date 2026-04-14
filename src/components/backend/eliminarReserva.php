<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_reserva = isset($_POST['id_reserva']) ? $_POST['id_reserva'] : null;

    if (!$id_reserva) {
        echo json_encode(["success" => false, "message" => "ID de reserva no proporcionado"]);
        exit;
    }

    try {
        $sql = "DELETE FROM Reserva WHERE id_reserva = :id";
        $stmt = $pdo->prepare($sql);
        $resultado = $stmt->execute(['id' => $id_reserva]);

        if ($resultado) {
            echo json_encode(["success" => true, "message" => "Reserva eliminada con éxito"]);
        } else {
            echo json_encode(["success" => false, "message" => "No se pudo eliminar la reserva"]);
        }

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
    }
}
?>
