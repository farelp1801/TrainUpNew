<?php
// edit_trainer_schedule.php
session_start();
header('Content-Type: application/json');
require 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'Trainer') {
    echo json_encode(['success' => false, 'message' => 'Hanya trainer yang dapat mengubah jadwal.']);
    exit;
}

$trainer_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'], $data['time_start'], $data['time_end'], $data['activity'])) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit;
}

$id = intval($data['id']);
$day = isset($data['day']) ? $data['day'] : null; // Bisa null
$time_start = $data['time_start'];
$time_end = $data['time_end'];
$activity = $data['activity'];

// Pastikan jadwal ini milik trainer yang login
$stmt = $pdo->prepare("SELECT trainer_id, day FROM trainer_schedules WHERE id = :id");
$stmt->execute(['id' => $id]);
$schedule = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$schedule || $schedule['trainer_id'] != $trainer_id) {
    echo json_encode(['success' => false, 'message' => 'Anda tidak berhak mengubah jadwal ini.']);
    exit;
}

// Jika day null, gunakan day yang lama
if ($day === null) {
    $day = $schedule['day'];
}

$stmt = $pdo->prepare("
    UPDATE trainer_schedules
    SET day = :day, time_start = :time_start, time_end = :time_end, activity = :activity, updated_at = NOW()
    WHERE id = :id
");

$updated = $stmt->execute([
    'day' => $day,
    'time_start' => $time_start,
    'time_end' => $time_end,
    'activity' => $activity,
    'id' => $id
]);

if ($updated) {
    echo json_encode(['success' => true, 'message' => 'Jadwal berhasil diubah.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal mengubah jadwal.']);
}
