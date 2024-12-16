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

if(!isset($data['client_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID client tidak ditemukan.']);
    exit;
}

$client_id = intval($data['client_id']);

// Pastikan jadwal-jadwal ini milik trainer yang sedang login
$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM trainer_schedules WHERE trainer_id = :trainer_id AND client_id = :client_id");
$stmt->execute(['trainer_id' => $trainer_id, 'client_id' => $client_id]);
$count = $stmt->fetch(PDO::FETCH_ASSOC);

if ($count['total'] == 0) {
    echo json_encode(['success' => false, 'message' => 'Tidak ada jadwal untuk client ini atau anda tidak berhak menghapusnya.']);
    exit;
}

// Hapus semua jadwal client ini yang dimiliki trainer ini
$stmt = $pdo->prepare("DELETE FROM trainer_schedules WHERE trainer_id = :trainer_id AND client_id = :client_id");
$deleted = $stmt->execute(['trainer_id' => $trainer_id, 'client_id' => $client_id]);

if ($deleted) {
    echo json_encode(['success' => true, 'message' => 'Semua jadwal untuk client ini berhasil dihapus.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus semua jadwal.']);
}
