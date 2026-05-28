<?php
session_start();
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (!$username || !$password) {
    echo json_encode(['success' => false, 'error' => 'Заполните все поля']);
    exit;
}

$stmt = $pdo->prepare("SELECT password_hash FROM admins WHERE username = ?");
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    echo json_encode(['success' => false, 'error' => 'Неверный логин или пароль']);
    exit;
}

$_SESSION['admin_logged_in'] = true;
echo json_encode(['success' => true]);