<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Content-Security-Policy: upgrade-insecure-requests");

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $especials = $_POST['especials']; // Recibirá '1' o '0'

    $sql = "UPDATE Administrador SET especials = $especials LIMIT 1";
    
    if ($pdo->query($sql)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false]);
    }
}
?>
