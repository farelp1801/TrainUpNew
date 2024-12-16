<?php
// get_assigned_trainer.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

// Cek apakah pengguna sudah login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda harus login terlebih dahulu.']);
    exit;
}

if (!isset($_GET['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User ID tidak diberikan.']);
    exit;
}

$user_id = intval($_GET['user_id']);

try {
    // Ambil trainer yang ditugaskan ke user
    $stmt = $pdo->prepare("
        SELECT users.id, users.fullName
        FROM user_trainers
        JOIN users ON user_trainers.trainer_id = users.id
        WHERE user_trainers.user_id = :user_id
        LIMIT 1
    ");
    $stmt->execute(['user_id' => $user_id]);
    $trainer = $stmt->fetch();

    if ($trainer) {
        echo json_encode(['success' => true, 'trainer' => $trainer]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Tidak ada trainer yang ditugaskan.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat mengambil trainer.']);
}
?>
