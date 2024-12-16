<?php
// get_customer_contact.php
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

    // Cek apakah user_id diberikan
    if (!isset($_GET['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'User ID tidak diberikan.']);
        exit;
    }

    $user_id = intval($_GET['user_id']);

    // Ambil kontak pelanggan
    $stmt = $pdo->prepare("SELECT email, contact FROM users WHERE id = :id");
    $stmt->execute(['id' => $user_id]);
    $contact = $stmt->fetch();

    if ($contact) {
        echo json_encode(['success' => true, 'contact' => $contact]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Pelanggan tidak ditemukan.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat mengambil kontak pelanggan.']);
}
?>
