<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Content-Security-Policy: upgrade-insecure-requests");

require_once 'conexion.php';

$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'carta';

try {
    // Adaptamos la consulta para que mantenga el orden que usabas antes
    $sql = "SELECT id_producto, nombre, descripcion, precio, tipo, subtipo, imagen 
            FROM Producto 
            WHERE tipo = :tipo 
            ORDER BY subtipo ASC, nombre ASC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['tipo' => $tipo]);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($productos);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
