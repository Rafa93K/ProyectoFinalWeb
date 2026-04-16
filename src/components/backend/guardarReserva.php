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

    // 4. Lógica de Horarios y Turnos (Sincronizada con React)
    $capacidadMaxima = 50;
    $diaSemana = date('N', strtotime($fecha)); // 1 (Lu) a 7 (Dom)
    $esMediodia = false;
    $esNoche = false;
    $inicioTurno = '';
    $finTurno = '';

    // Almuerzo: 13:30 - 15:45 (Todos menos Martes)
    if ($hora >= '13:30' && $hora <= '15:45') {
        $inicioTurno = '13:30';
        $finTurno = '15:45';
        $esMediodia = true;
    } 
    // Cena: 20:30 - 22:45 (Solo Viernes y Sábado)
    elseif ($hora >= '20:30' && $hora <= '22:45') {
        $inicioTurno = '20:30';
        $finTurno = '22:45';
        $esNoche = true;
    } else {
        echo json_encode(["success" => false, "message" => "El horario seleccionado no está disponible (Turnos: 13:30-15:45 o 20:30-22:45)."]);
        exit;
    }

    // Martes cerrado
    if ($diaSemana == 2) {
        echo json_encode(["success" => false, "message" => "Los martes estamos cerrados por descanso del personal."]);
        exit;
    }

    // Lunes, Miércoles, Jueves y Domingo -> Solo mediodía
    $diasSoloMediodia = [1, 3, 4, 7]; // 1:Lu, 3:Mi, 4:Ju, 7:Do
    if (in_array($diaSemana, $diasSoloMediodia) && $esNoche) {
        echo json_encode(["success" => false, "message" => "En el día seleccionado solo abrimos para almuerzos (mediodía)."]);
        exit;
    }

    // 5. Control de Aforo
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
            echo json_encode(["success" => false, "message" => "Lo sentimos, aforo completo para este turno."]);
            exit;
        }

        // 6. Inserción en Base de Datos (con campos opcionales)
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
        echo json_encode(["success" => false, "message" => "Error en el servidor: " . $e->getMessage()]);
        exit;
    }
}
?>
