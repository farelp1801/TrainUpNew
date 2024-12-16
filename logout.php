<?php
// logout.php
session_start();

// Periksa apakah permintaan adalah POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Hapus semua data sesi
    session_unset();
    session_destroy();
    
    // Kirim respons JSON
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Logout berhasil.']);
} else {
    // Jika bukan POST, alihkan ke halaman login
    header('Location: login.html');
    exit;
}
?>
