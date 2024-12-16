<?php
// hapus_user.php
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

    // Cek apakah permintaan adalah POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
        exit;
    }

    // Ambil data JSON dari permintaan
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Data user tidak valid.']);
        exit;
    }

    $user_id = intval($input['user_id']);

    // Jangan izinkan Admin menghapus dirinya sendiri
    if ($user_id === $_SESSION['user_id']) {
        echo json_encode(['success' => false, 'message' => 'Anda tidak dapat menghapus akun Anda sendiri.']);
        exit;
    }

    // Hapus pengguna
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
    $stmt->execute(['id' => $user_id]);

    echo json_encode(['success' => true, 'message' => 'Pengguna berhasil dihapus.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat menghapus pengguna.']);
}
?>
