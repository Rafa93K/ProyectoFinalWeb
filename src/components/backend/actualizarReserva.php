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
    $diaSemana = date('N', strtotime($fecha)); // 1 (Lu) - 7 (Dom)
    $esMediodia = false;
    $esNoche = false;
    $inicioTurno = '';
    $finTurno = '';

    // Turno Mediodía: 13:30 - 15:30
    if ($hora >= '13:30' && $hora <= '15:30') {
        $inicioTurno = '13:30';
        $finTurno = '15:30';
        $esMediodia = true;
    } 
    // Turno Noche: 20:30 - 22:30
    elseif ($hora >= '20:30' && $hora <= '22:30') {
        $inicioTurno = '20:30';
        $finTurno = '22:30';
        $esNoche = true;
    } else {
        echo json_encode(["success" => false, "message" => "Horario fuera de servicio (Turnos: 13:30-15:30 o 20:30-22:30)."]);
        exit;
    }

    // Martes (2) cerrado
    if ($diaSemana == 2) {
        echo json_encode(["success" => false, "message" => "El martes estamos cerrados."]);
        exit;
    }

    // Lunes, Miércoles, Jueves (1,3,4) y Domingo (7) -> Solo mediodía
    if (in_array($diaSemana, [1, 3, 4, 7]) && $esNoche) {
        echo json_encode(["success" => false, "message" => "En el día seleccionado solo abrimos para almuerzos (mediodía)."]);
        exit;
    }

    // 2. Control de Aforo por Turno (Excluyendo la propia reserva que se edita)
    $sqlCapacidad = "
        SELECT COALESCE(SUM(personas), 0) as total
        FROM Reserva
        WHERE fecha = ?
        AND (hora BETWEEN ? AND ?)
        AND id_reserva != ?
    ";
    
    $stmtCapacidad = $pdo->prepare($sqlCapacidad);
    $stmtCapacidad->execute([$fecha, $inicioTurno, $finTurno, $id_reserva]);
    $totalActual = $stmtCapacidad->fetch(PDO::FETCH_ASSOC)['total'];

    if (($totalActual + $personas) > 50) {
        echo json_encode(["success" => false, "message" => "No hay disponibilidad suficiente para ese turno. Capacidad restante: " . (50 - $totalActual)]);
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
    echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
}
?>
