<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

session_start();
require_once "./conexion.php"; // Asegúrate de que pdo esté definido aquí

if ($_SERVER['REQUEST_METHOD'] == "POST") {

    // 1. Recoger datos (Mapeando los nombres de tu form de React)
    $nombre = $_POST['nombre_cliente'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $hora = $_POST['hora'] ?? '';
    $personas = (int)($_POST['personas'] ?? 0);
    $mensaje = $_POST['mensaje'] ?? '';

    // 2. Manejo de Sesión y IDs Opcionales
    $id_usuario = null;
    $id_admin = null;

    if (isset($_SESSION['usuarioFogon'])) {
        // Si hay sesión, usamos esos datos y guardamos el ID
        $nombre = $_SESSION['usuarioFogon']['nombre'];
        $telefono = $_SESSION['usuarioFogon']['telefono'];
        $id_usuario = $_SESSION['usuarioFogon']['id'] ?? null;
    }

    // 3. Validaciones de campos obligatorios
    if (empty($nombre) || empty($telefono) || empty($fecha) || empty($hora) || $personas <= 0) {
        echo json_encode(["success" => false, "message" => "Rellene todos los campos obligatorios."]);
        exit;
    }

    if (strlen($telefono) !== 9) {
        echo json_encode(["success" => false, "message" => "El número de teléfono debe tener exactamente 9 dígitos."]);
        exit;
    }

    // 4. Lógica de Horarios y Turnos (Sincronizada con React)
    $capacidadMaxima = 50;
    $diaSemana = date('N', strtotime($fecha)); // 1 (Lu) a 7 (Dom)
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

    // 5. Control de Aforo por Turno
    try {
        $sqlCapacidad = "
            SELECT COALESCE(SUM(personas), 0) as total
            FROM Reserva
            WHERE fecha = ?
            AND hora BETWEEN ? AND ?
        ";

        $stmtCapacidad = $pdo->prepare($sqlCapacidad);
        $stmtCapacidad->execute([$fecha, $inicioTurno, $finTurno]);
        $totalActual = $stmtCapacidad->fetch(PDO::FETCH_ASSOC)['total'];

        if (($totalActual + $personas) > $capacidadMaxima) {
            echo json_encode(["success" => false, "message" => "No hay disponibilidad. ¡Aforo completo para este turno!"]);
            exit;
        }

        // 6. Inserción en Base de Datos
        $sql = "INSERT INTO Reserva (nombre_cliente, telefono, fecha, hora, personas, mensaje, id_usuario, id_admin)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $nombre, 
            $telefono, 
            $fecha, 
            $hora, 
            $personas, 
            $mensaje, 
            $id_usuario, 
            $id_admin
        ]);

        echo json_encode(["success" => true, "message" => "¡Reserva realizada con éxito!"]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
        exit;
    }
}
?>
