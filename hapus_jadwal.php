<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

if(!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'Trainer') {
    echo json_encode(['success' => false, 'message' => 'Hanya trainer yang dapat menghapus jadwal.']);
    exit;
}

$trainer_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents('php://input'), true);

if(!isset($data['schedule_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID jadwal tidak ditemukan.']);
    exit;
}

$schedule_id = intval($data['schedule_id']);

// Pastikan jadwal ini milik trainer yang sedang login
$stmt = $pdo->prepare("SELECT trainer_id FROM trainer_schedules WHERE id = :id");
$stmt->execute(['id' => $schedule_id]);
$schedule = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$schedule) {
    echo json_encode(['success' => false, 'message' => 'Jadwal tidak ditemukan.']);
    exit;
}

if ($schedule['trainer_id'] != $trainer_id) {
    echo json_encode(['success' => false, 'message' => 'Anda tidak berhak menghapus jadwal ini.']);
    exit;
}

// Hapus jadwal
$stmt = $pdo->prepare("DELETE FROM trainer_schedules WHERE id = :id");
$deleted = $stmt->execute(['id' => $schedule_id]);

if ($deleted) {
    echo json_encode(['success' => true, 'message' => 'Jadwal berhasil dihapus.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus jadwal.']);
}
