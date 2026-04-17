<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Content-Security-Policy: upgrade-insecure-requests");

require_once 'conexion.php';

$nombre = $_POST['nombre'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$precio = $_POST['precio'] ?? 0;
$tipo = $_POST['tipo'] ?? '';
$subtipo = $_POST['subtipo'] ?? '';
$imagen = $_POST['imagen'] ?? '';
try {
    $sql = "INSERT INTO Producto (nombre, descripcion, precio, tipo, subtipo, imagen) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nombre, $descripcion, $precio, $tipo, $subtipo, $imagen]);
    echo json_encode(["success" => true, "message" => "Producto insertado"]);
} catch(Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>