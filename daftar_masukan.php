<?php
// daftar_masukan.php
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

    // Ambil semua feedback beserta informasi pengguna
    $stmt = $pdo->query("
        SELECT feedback.id, feedback.feedback, feedback.created_at, users.fullName, users.username, users.role
        FROM feedback
        LEFT JOIN users ON feedback.user_id = users.id
        ORDER BY feedback.created_at DESC
    ");
    $feedbacks = $stmt->fetchAll();

    echo json_encode(['success' => true, 'feedbacks' => $feedbacks]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat mengambil data feedback.']);
}
?>
