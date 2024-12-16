<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'Trainer') {
    echo json_encode(['success' => false, 'message' => 'Hanya trainer yang dapat menambah jadwal.']);
    exit;
}

$trainer_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents('php://input'), true);

// Jika data schedules tidak ada, coba ambil dari field tunggal
if (!isset($data['schedules']) || !is_array($data['schedules'])) {
    // Cek apakah mungkin field tunggal sudah diberikan
    if (isset($data['client_id'], $data['day'], $data['time_start'], $data['time_end'], $data['activity'])) {
        // Bentuk array schedules dari satu jadwal saja
        $data['schedules'] = [[
            'day' => $data['day'],
            'time_start' => $data['time_start'],
            'time_end' => $data['time_end'],
            'activity' => $data['activity']
        ]];
    } else {
        echo json_encode(['success' => false, 'message' => 'Data tidak lengkap atau format salah.']);
        exit;
    }
}

$client_id = intval($data['client_id']);

// Pastikan client ini ditangani oleh trainer yang login
$stmt = $pdo->prepare("SELECT * FROM user_trainers WHERE user_id = :client_id AND trainer_id = :trainer_id LIMIT 1");
$stmt->execute(['client_id' => $client_id, 'trainer_id' => $trainer_id]);
$rel = $stmt->fetch();

if (!$rel) {
    echo json_encode(['success' => false, 'message' => 'Client ini tidak terhubung dengan Anda.']);
    exit;
}

$successCount = 0;
foreach ($data['schedules'] as $sch) {
    if (isset($sch['day'], $sch['time_start'], $sch['time_end'], $sch['activity'])) {
        $day = $sch['day'];
        $time_start = $sch['time_start'];
        $time_end = $sch['time_end'];
        $activity = $sch['activity'];

        $stmt = $pdo->prepare("
            INSERT INTO trainer_schedules (trainer_id, client_id, day, time_start, time_end, activity, created_at, updated_at)
            VALUES (:trainer_id, :client_id, :day, :time_start, :time_end, :activity, NOW(), NOW())
        ");
        $inserted = $stmt->execute([
            'trainer_id' => $trainer_id,
            'client_id' => $client_id,
            'day' => $day,
            'time_start' => $time_start,
            'time_end' => $time_end,
            'activity' => $activity
        ]);
        if ($inserted) {
            $successCount++;
        }
    }
}

if ($successCount == count($data['schedules'])) {
    echo json_encode(['success' => true, 'message' => 'Semua jadwal berhasil ditambahkan.']);
} else if ($successCount > 0) {
    echo json_encode(['success' => false, 'message' => 'Beberapa jadwal gagal ditambahkan.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menambahkan jadwal.']);
}
