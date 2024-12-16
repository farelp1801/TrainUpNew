<?php
// update_user.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

// Cek apakah pengguna sudah login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda harus login terlebih dahulu.']);
    exit;
}

// Cek apakah permintaan adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Ambil data JSON dari permintaan
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data.']);
    exit;
}

try {
    // Ambil data pengguna yang sedang login
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Pengguna tidak ditemukan.']);
        exit;
    }

    // Persiapkan data yang diperbarui
    $fields_to_update = ['contact', 'programGoals', 'medicalHistory'];
    $update_data = [];
    $update_fields = [];

    foreach ($fields_to_update as $field) {
        if (isset($input[$field])) {
            $update_fields[] = "$field = :$field";
            $update_data[$field] = trim($input[$field]);
        }
    }

    // Perbarui deskripsi jika pengguna adalah Trainer
    if ($user['role'] === 'Trainer' && isset($input['description'])) {
        $update_fields[] = "description = :description";
        $update_data['description'] = trim($input['description']);
    }

    if (!empty($update_fields)) {
        $sql = "UPDATE users SET " . implode(", ", $update_fields) . " WHERE id = :id";
        $update_data['id'] = $_SESSION['user_id'];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($update_data);
    }

    // Handle trainer assignment
    if (array_key_exists('trainer_id', $input)) { // Changed to array_key_exists to allow null
        $trainer_id = $input['trainer_id'] !== null ? intval($input['trainer_id']) : null;

        if ($trainer_id !== null) {
            // Cek apakah trainer valid
            $stmt = $pdo->prepare("SELECT id FROM users WHERE id = :id AND role = 'Trainer'");
            $stmt->execute(['id' => $trainer_id]);
            if (!$stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Trainer tidak valid.']);
                exit;
            }
        }

        // Cek apakah sudah ada penugasan
        $stmt = $pdo->prepare("SELECT id FROM user_trainers WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $_SESSION['user_id']]);
        $assignment = $stmt->fetch();

        if ($trainer_id !== null) {
            if ($assignment) {
                // Update penugasan yang sudah ada
                $stmt = $pdo->prepare("UPDATE user_trainers SET trainer_id = :trainer_id, assigned_at = NOW() WHERE user_id = :user_id");
                $stmt->execute([
                    'trainer_id' => $trainer_id,
                    'user_id' => $_SESSION['user_id']
                ]);
            } else {
                // Insert penugasan baru
                $stmt = $pdo->prepare("INSERT INTO user_trainers (user_id, trainer_id) VALUES (:user_id, :trainer_id)");
                $stmt->execute([
                    'user_id' => $_SESSION['user_id'],
                    'trainer_id' => $trainer_id
                ]);
            }
        } else {
            if ($assignment) {
                // Hapus penugasan yang ada
                $stmt = $pdo->prepare("DELETE FROM user_trainers WHERE user_id = :user_id");
                $stmt->execute(['user_id' => $_SESSION['user_id']]);
            }
        }
    }

    echo json_encode(['success' => true, 'message' => 'Informasi berhasil diperbarui.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat memperbarui informasi.']);
}
?>
