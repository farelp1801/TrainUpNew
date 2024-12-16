<?php
// add_trainer_schedule.php
session_start();
header('Content-Type: application/json');
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda harus login terlebih dahulu.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['day'], $input['time_start'], $input['time_end'], $input['activity'])) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO trainer_schedules (trainer_id, day, time_start, time_end, activity)
        VALUES (:trainer_id, :day, :time_start, :time_end, :activity)
    ");
    $stmt->execute([
        'trainer_id' => $_SESSION['user_id'],
        'day' => $input['day'],
        'time_start' => $input['time_start'],
        'time_end' => $input['time_end'],
        'activity' => $input['activity']
    ]);

    echo json_encode(['success' => true, 'message' => 'Jadwal berhasil ditambahkan.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Gagal menambahkan jadwal.']);
}
?>
