<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Content-Security-Policy: upgrade-insecure-requests");

require_once 'conexion.php';

try {
    $sql = "SELECT especials FROM Administrador LIMIT 1";
    $resultado = $pdo->query($sql);
    $fila = $resultado->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "especials" => (int)$fila['especials']
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
