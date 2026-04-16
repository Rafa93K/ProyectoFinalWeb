<?php
/**
 * Script Actualizar Reserva: Permite a un usuario modificar los datos de su reserva existente.
 * Valida de nuevo la disponibilidad según las reglas del restaurante.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

require_once 'conexion.php';

// Obtener datos del POST
$id_reserva = isset($_POST['id_reserva']) ? $_POST['id_reserva'] : null;
$fecha = isset($_POST['fecha']) ? $_POST['fecha'] : null;
$hora = isset($_POST['hora']) ? $_POST['hora'] : null;
$personas = isset($_POST['personas']) ? intval($_POST['personas']) : null;
$mensaje = isset($_POST['mensaje']) ? $_POST['mensaje'] : '';

if (!$id_reserva || !$fecha || !$hora || !$personas) {
    echo json_encode(["success" => false, "message" => "Datos incompletos para actualizar."]);
    exit;
}

try {
    // 1. Validar reglas de negocio (Martes Cerrado, Horarios)
    $diaSemana = date('w', strtotime($fecha)); // 0 (Domingo) - 6 (Sábado)
    
    // Martes (2) cerrado
    if ($diaSemana == 2) {
        echo json_encode(["success" => false, "message" => "Lo sentimos, los martes estamos cerrados."]);
        exit;
    }

    // Validar Turnos (Simplificado pero coherente con el frontend)
    $esFinDeSemana = ($diaSemana == 5 || $diaSemana == 6); // Viernes o Sábado
    $esTurnoAlmuerzo = ($hora >= "13:30" && $hora <= "15:45");
    $esTurnoCena = ($hora >= "20:30" && $hora <= "22:45");

    if (!$esTurnoAlmuerzo && !($esFinDeSemana && $esTurnoCena)) {
        echo json_encode(["success" => false, "message" => "El horario seleccionado no es válido para este día."]);
        exit;
    }

    // 2. Control de Aforo (50 personas máximo por tramo horario, excluyendo la reserva actual)
    $sqlAforo = "SELECT SUM(personas) as total FROM Reserva WHERE fecha = :fecha AND hora = :hora AND id_reserva != :id";
    $stmtAforo = $pdo->prepare($sqlAforo);
    $stmtAforo->execute(['fecha' => $fecha, 'hora' => $hora, 'id' => $id_reserva]);
    $resultadoAforo = $stmtAforo->fetch(PDO::FETCH_ASSOC);
    $totalActual = $resultadoAforo['total'] ? intval($resultadoAforo['total']) : 0;

    if (($totalActual + $personas) > 50) {
        echo json_encode(["success" => false, "message" => "Lo sentimos, no hay suficiente aforo para ese horario. Capacidad restante: " . (50 - $totalActual)]);
        exit;
    }

    // 3. Ejecutar actualización
    $sql = "UPDATE Reserva 
            SET fecha = :fecha, hora = :hora, personas = :personas, mensaje = :mensaje 
            WHERE id_reserva = :id";
    
    $stmt = $pdo->prepare($sql);
    $resultado = $stmt->execute([
        'fecha' => $fecha,
        'hora' => $hora,
        'personas' => $personas,
        'mensaje' => $mensaje,
        'id' => $id_reserva
    ]);

    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Reserva actualizada con éxito."]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo actualizar la reserva."]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
