<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Content-Security-Policy: upgrade-insecure-requests");

require_once 'conexion.php';

$id = $_POST['id_producto'] ?? 0;

try {
    $sql = "DELETE FROM Producto WHERE id_producto = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    echo json_encode(["success" => true, "message" => "Producto eliminado"]);
} catch(Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}