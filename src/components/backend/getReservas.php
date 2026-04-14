<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'conexion.php';

$telefono = isset($_GET['telefono']) ? $_GET['telefono'] : null;

if (!$telefono) {
    echo json_encode(["error" => "Teléfono no proporcionado"]);
    exit;
}

try {

    $sql = "SELECT id_reserva, fecha, hora, personas, mensaje 
            FROM Reserva 
            WHERE telefono = :tel 
            ORDER BY fecha ASC, hora ASC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['tel' => $telefono]);
    $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($reservas);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
