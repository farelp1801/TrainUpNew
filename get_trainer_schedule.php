<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda harus login terlebih dahulu.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$user_role = $_SESSION['user_role'];
$trainer_id_param = isset($_GET['trainer_id']) ? intval($_GET['trainer_id']) : null;
$client_id_param = isset($_GET['client_id']) ? intval($_GET['client_id']) : null;

if ($user_role === 'Client') {
    // Ambil trainer yang terhubung dengan client ini
    $stmt = $pdo->prepare("SELECT trainer_id FROM user_trainers WHERE user_id = :user_id LIMIT 1");
    $stmt->execute(['user_id' => $user_id]);
    $rel = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$rel) {
        // Client belum punya trainer
        echo json_encode(['success' => true, 'schedules' => []]);
        exit;
    }
    $trainer_id = $rel['trainer_id'];

    // Hanya tampilkan jadwal untuk client ini saja
    $stmt = $pdo->prepare("
        SELECT ts.*, u.fullName AS trainer_name
        FROM trainer_schedules ts
        JOIN users u ON u.id = ts.trainer_id
        WHERE ts.trainer_id = :trainer_id
        AND ts.client_id = :client_id
        ORDER BY FIELD(day, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'), time_start
    ");
    $stmt->execute(['trainer_id' => $trainer_id, 'client_id' => $user_id]);
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'schedules' => $schedules]);
    exit;

} elseif ($user_role === 'Trainer') {
    // Jika ada client_id di GET, ambil jadwal client tersebut
    if ($client_id_param) {
        $stmt = $pdo->prepare("
            SELECT ts.*, c.fullName AS client_name
            FROM trainer_schedules ts
            JOIN users c ON c.id = ts.client_id
            WHERE ts.trainer_id = :trainer_id AND ts.client_id = :client_id
            ORDER BY FIELD(day, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'), time_start
        ");
        $stmt->execute(['trainer_id' => $user_id, 'client_id' => $client_id_param]);
    } else {
        // Ambil semua jadwal milik trainer ini
        $stmt = $pdo->prepare("
            SELECT ts.*, c.fullName AS client_name
            FROM trainer_schedules ts
            JOIN users c ON c.id = ts.client_id
            WHERE ts.trainer_id = :trainer_id
            ORDER BY FIELD(day, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'), time_start
        ");
        $stmt->execute(['trainer_id' => $user_id]);
    }

    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'schedules' => $schedules]);
    exit;

} elseif ($user_role === 'Admin') {
    if ($trainer_id_param) {
        $stmt = $pdo->prepare("
            SELECT ts.*, u.fullName AS trainer_name, c.fullName AS client_name
            FROM trainer_schedules ts
            JOIN users u ON u.id = ts.trainer_id
            JOIN users c ON c.id = ts.client_id
            WHERE ts.trainer_id = :trainer_id
            ORDER BY FIELD(day, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'), time_start
        ");
        $stmt->execute(['trainer_id' => $trainer_id_param]);
    } else {
        $stmt = $pdo->query("
            SELECT ts.*, u.fullName AS trainer_name, c.fullName AS client_name
            FROM trainer_schedules ts
            JOIN users u ON u.id = ts.trainer_id
            JOIN users c ON c.id = ts.client_id
            ORDER BY FIELD(day, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'), time_start
        ");
    }

    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'schedules' => $schedules]);
    exit;

} else {
    echo json_encode(['success' => false, 'message' => 'Role tidak dikenali.']);
    exit;
}
