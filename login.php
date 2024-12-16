<?php
// login.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

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

// Validasi data yang diperlukan
$required_fields = ['username', 'password'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        echo json_encode(['success' => false, 'message' => ucfirst($field) . ' harus diisi.']);
        exit;
    }
}

$username = strtolower(trim($input['username']));
$password = trim($input['password']);

try {
    // Cari pengguna berdasarkan username
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Password cocok, set sesi
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role']; // Set user_role di sesi server

        // Ambil informasi pengguna
        $user_data = [
            'id' => $user['id'],
            'fullName' => $user['fullName'],
            'username' => $user['username'],
            'gender' => $user['gender'],
            'email' => $user['email'],
            'contact' => $user['contact'],
            'programGoals' => $user['programGoals'],
            'medicalHistory' => $user['medicalHistory'],
            'role' => $user['role']
        ];

        // Jika pengguna adalah Trainer, tambahkan deskripsi dan spesialisasi
        if ($user['role'] === 'Trainer') {
            $user_data['specialization'] = $user['specialization'];
            $user_data['experience'] = $user['experience'];
            $user_data['description'] = $user['description'];
        }

        // Jika pengguna adalah Client, ambil trainer yang ditugaskan
        if ($user['role'] === 'Client') {
            $stmt = $pdo->prepare("SELECT u.id, u.fullName FROM user_trainers ut JOIN users u ON ut.trainer_id = u.id WHERE ut.user_id = :user_id");
            $stmt->execute(['user_id' => $user['id']]);
            $trainer = $stmt->fetch();
            if ($trainer) {
                $user_data['trainer'] = [
                    'id' => $trainer['id'],
                    'fullName' => $trainer['fullName']
                ];
            } else {
                $user_data['trainer'] = null;
            }
        }

        echo json_encode(['success' => true, 'message' => 'Login berhasil.', 'user' => $user_data]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Username atau password salah.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat login.']);
}
