<?php
// regadmin.php
header('Content-Type: application/json');

require 'db.php'; // Mengimpor koneksi database

// Cek apakah ada admin yang sudah terdaftar
try {
    $stmt = $pdo->query("SELECT COUNT(*) as admin_count FROM users WHERE role = 'Admin'");
    $result = $stmt->fetch();
    if ($result['admin_count'] > 0) {
        echo json_encode(['success' => false, 'message' => 'Admin sudah terdaftar.']);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat memeriksa keberadaan admin.']);
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

// Validasi data yang diperlukan
$required_fields = ['fullName', 'username', 'gender', 'email', 'contact', 'programGoals', 'password'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        echo json_encode(['success' => false, 'message' => ucfirst($field) . ' harus diisi.']);
        exit;
    }
}

// Validasi role
if (!isset($input['role']) || $input['role'] !== 'Admin') {
    echo json_encode(['success' => false, 'message' => 'Role harus Admin.']);
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

// Cek apakah password dan confirmPassword cocok
if (isset($input['confirmPassword'])) {
    $confirmPassword = trim($input['confirmPassword']);
    if ($password !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'Password dan Konfirmasi Password tidak cocok.']);
        exit;
    }
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    // Cek apakah username atau email sudah digunakan
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
    $stmt->execute(['username' => $username, 'email' => $email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Username atau Email sudah digunakan.']);
        exit;
    }

    // Siapkan data admin baru
    $new_admin = [
        'fullName' => $fullName,
        'username' => $username,
        'gender' => $gender,
        'email' => $email,
        'contact' => $contact,
        'programGoals' => $programGoals,
        'medicalHistory' => $medicalHistory,
        'password' => $hashedPassword,
        'role' => 'Admin'
    ];

    // Buat query INSERT
    $columns = array_keys($new_admin);
    $placeholders = array_map(function($col) { return ':' . $col; }, $columns);
    $sql = "INSERT INTO users (" . implode(", ", $columns) . ") VALUES (" . implode(", ", $placeholders) . ")";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($new_admin);

    echo json_encode(['success' => true, 'message' => 'Registrasi Admin berhasil. Silakan login.']);
} catch (Exception $e) {
    // Tangani error
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat registrasi Admin.']);
}
?>
