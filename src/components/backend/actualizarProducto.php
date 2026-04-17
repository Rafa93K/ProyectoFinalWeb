<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Content-Security-Policy: upgrade-insecure-requests");

require_once 'conexion.php';

$id = $_POST['id_producto'] ?? 0;
$nombre = $_POST['nombre'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$precio = $_POST['precio'] ?? 0;
$tipo = $_POST['tipo'] ?? '';
$subtipo = $_POST['subtipo'] ?? '';
$imagen = $_POST['imagen'] ?? '';

try {
    $sql = "UPDATE Producto SET nombre = ?, descripcion = ?, precio = ?, tipo = ?, subtipo = ?, imagen = ? WHERE id_producto = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nombre, $descripcion, $precio, $tipo, $subtipo, $imagen, $id]);
    echo json_encode(["success" => true, "message" => "Producto actualizado"]);
} catch(Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}