<?php
// get_users.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

// Cek apakah permintaan adalah GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

try {
    // Ambil semua pengguna dari database
    $stmt = $pdo->query("SELECT * FROM users");
    $users = $stmt->fetchAll();

    // Hapus password dari setiap pengguna
    foreach ($users as &$user) {
        unset($user['password']);
    }

    echo json_encode(['success' => true, 'users' => $users]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat mengambil data pengguna.']);
}
?>
