<?php
// kelola_trainer_user.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

// Cek apakah pengguna sudah login dan memiliki peran Admin
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda harus login terlebih dahulu sebagai Admin.']);
    exit;
}

try {
    // Ambil data pengguna yang sedang login
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = :id");
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $current_user = $stmt->fetch();

    if (!$current_user || $current_user['role'] !== 'Admin') {
        echo json_encode(['success' => false, 'message' => 'Anda tidak memiliki izin untuk mengakses halaman ini.']);
        exit;
    }

    // Ambil semua Trainer dan User
    $stmt = $pdo->query("SELECT id, fullName, username, email, contact, role FROM users");
    $users = $stmt->fetchAll();

    echo json_encode(['success' => true, 'users' => $users]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat mengambil data pengguna.']);
}
?>
