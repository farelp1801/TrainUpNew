<?php
// register.php
session_start();
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

// Fungsi Validasi Email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
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

// Validasi data yang diperlukan
$required_fields = ['fullName', 'username', 'gender', 'email', 'contact', 'programGoals', 'password'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        echo json_encode(['success' => false, 'message' => ucfirst($field) . ' harus diisi.']);
        exit;
    }
}

// Validasi email
if (!isValidEmail($input['email'])) {
    echo json_encode(['success' => false, 'message' => 'Email tidak valid.']);
    exit;
}

$fullName = trim($input['fullName']);
$username = strtolower(trim($input['username']));
$gender = trim($input['gender']);
$email = trim($input['email']);
$contact = trim($input['contact']);
$programGoals = trim($input['programGoals']);
$medicalHistory = isset($input['medicalHistory']) ? trim($input['medicalHistory']) : 'Tidak ada';
$password = trim($input['password']);

// Cek apakah password dan confirmPassword cocok (jika ada)
if (isset($input['confirmPassword'])) {
    $confirmPassword = trim($input['confirmPassword']);
    if ($password !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'Password dan Konfirmasi Password tidak cocok.']);
        exit;
    }
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Tentukan peran (role)
$role = isset($input['role']) ? trim($input['role']) : 'Client';
if (!in_array($role, ['Client', 'Trainer', 'Admin'])) {
    $role = 'Client'; // Default role
}

try {
    // Cek apakah username atau email sudah digunakan
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
    $stmt->execute(['username' => $username, 'email' => $email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Username atau Email sudah digunakan.']);
        exit;
    }

    // Siapkan data pengguna baru
    $new_user = [
        'fullName' => $fullName,
        'username' => $username,
        'gender' => $gender,
        'email' => $email,
        'contact' => $contact,
        'programGoals' => $programGoals,
        'medicalHistory' => $medicalHistory,
        'password' => $hashedPassword,
        'role' => $role
    ];

    if ($role === 'Trainer') {
        $new_user['specialization'] = isset($input['specialization']) ? trim($input['specialization']) : 'Spesialisasi belum diisi.';
        $new_user['experience'] = isset($input['experience']) ? intval($input['experience']) : 0;
        $new_user['description'] = isset($input['description']) ? trim($input['description']) : 'Deskripsi belum diisi.';
    }

    // Buat query INSERT
    $columns = array_keys($new_user);
    $placeholders = array_map(function($col) { return ':' . $col; }, $columns);
    $sql = "INSERT INTO users (" . implode(", ", $columns) . ") VALUES (" . implode(", ", $placeholders) . ")";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($new_user);

    echo json_encode(['success' => true, 'message' => 'Registrasi berhasil. Silakan login.']);
} catch (Exception $e) {
    // Tangani error
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat registrasi.']);
}
?>
