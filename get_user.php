<?php
// get_user.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

if (isset($_SESSION['user_id'])) {
    try {
        // Ambil data pengguna berdasarkan sesi
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute(['id' => $_SESSION['user_id']]);
        $user = $stmt->fetch();

        if ($user) {
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

            echo json_encode(['success' => true, 'user' => $user_data]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Pengguna tidak ditemukan.']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat mengambil data pengguna.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Anda belum login.']);
}
?>
