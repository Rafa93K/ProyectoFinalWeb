<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Content-Security-Policy: upgrade-insecure-requests");

require_once 'conexion.php';

// Obtenemos el tipo o por defecto 'carta'
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'carta';
$id_usuario = isset($_GET['id_usuario']) ? $_GET['id_usuario'] : null;

try {
    // Base de la consulta: Seleccionamos campos de Producto y calculamos media y cuenta de votos
    $sql = "SELECT 
                p.id_producto, 
                p.nombre, 
                p.descripcion, 
                p.precio, 
                p.tipo, 
                p.subtipo, 
                p.imagen,
                (SELECT COUNT(*) FROM Voto v WHERE v.id_producto = p.id_producto) as total_votos,
                (SELECT ROUND(AVG(puntuacion), 1) FROM Voto v WHERE v.id_producto = p.id_producto) as media_votos,
                (SELECT puntuacion FROM Voto v WHERE v.id_producto = p.id_producto AND v.id_usuario = :id_u LIMIT 1) as mi_puntuacion
            FROM Producto p";

    // Si no queremos todos, añadimos el filtro WHERE
    if ($tipo !== 'all') {
        $sql .= " WHERE p.tipo = :tipo";
    }

    // Añadimos la ordenación (si es 'all', ordenamos primero por tipo para que no estén mezclados)
    if ($tipo === 'all') {
        $sql .= " ORDER BY p.tipo ASC, p.subtipo ASC, p.nombre ASC";
    } else {
        $sql .= " ORDER BY p.subtipo ASC, p.nombre ASC";
    }

    $stmt = $pdo->prepare($sql);
    
    // Preparamos los parámetros
    $params = ['id_u' => $id_usuario];
    if ($tipo !== 'all') {
        $params['tipo'] = $tipo;
    }

    $stmt->execute($params);

    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolvemos el JSON
    echo json_encode($productos);

} catch (PDOException $e) {
    // Es mejor devolver un código de error HTTP 500 si algo falla
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>