<?php
header("Access-Control-Allow-Origin: *");
/* ---------- CONEXIÓN BD ---------- */
$server = "localhost";
$user = "fogon";
$pw = "fogon2019+";
$bd = "fogon";

try {
    $pdo = new PDO(
        "mysql:host=$server;dbname=$bd;charset=utf8",
        $user,
        $pw,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}
?>
