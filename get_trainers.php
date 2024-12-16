<?php
// get_trainers.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

// Cek apakah pengguna sudah login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda harus login terlebih dahulu.']);
    exit;
}

try {
    // Ambil semua trainer
    $stmt = $pdo->prepare("SELECT id, fullName FROM users WHERE role = 'Trainer'");
    $stmt->execute();
    $trainers = $stmt->fetchAll();

    echo json_encode(['success' => true, 'trainers' => $trainers]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat mengambil daftar trainer.']);
}
?>
