<?php
// konsultasi_pelanggan.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

// Cek apakah pengguna sudah login dan memiliki peran Trainer
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda harus login terlebih dahulu sebagai Trainer.']);
    exit;
}

try {
    // Ambil data pengguna yang sedang login
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = :id");
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $current_user = $stmt->fetch();

    if (!$current_user || $current_user['role'] !== 'Trainer') {
        echo json_encode(['success' => false, 'message' => 'Anda tidak memiliki izin untuk mengakses halaman ini.']);
        exit;
    }

    // Ambil daftar pelanggan yang terkait dengan Trainer
    $stmt = $pdo->prepare("
        SELECT users.id, users.fullName, users.username, users.email, users.contact, user_trainers.assigned_at
        FROM user_trainers
        JOIN users ON user_trainers.user_id = users.id
        WHERE user_trainers.trainer_id = :trainer_id
    ");
    $stmt->execute(['trainer_id' => $_SESSION['user_id']]);
    $customers = $stmt->fetchAll();

    echo json_encode(['success' => true, 'customers' => $customers]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat mengambil data pelanggan.']);
}
