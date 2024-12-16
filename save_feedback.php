<?php
// save_feedback.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

// Cek apakah permintaan adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Ambil data JSON atau POST data
$input = json_decode(file_get_contents('php://input'), true);

// Jika data tidak tersedia dalam JSON, coba ambil dari POST
if (!$input) {
    $input = $_POST;
}

if (!isset($input['feedback']) || empty(trim($input['feedback']))) {
    echo json_encode(['success' => false, 'message' => 'Feedback tidak boleh kosong.']);
    exit;
}

$feedback = trim($input['feedback']);
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

try {
    // Insert feedback ke database
    $stmt = $pdo->prepare("INSERT INTO feedback (user_id, feedback) VALUES (:user_id, :feedback)");
    $stmt->execute([
        'user_id' => $user_id,
        'feedback' => $feedback
    ]);

    echo json_encode(['success' => true, 'message' => 'Feedback berhasil disimpan.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat menyimpan feedback.']);
}
?>
