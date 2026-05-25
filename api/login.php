<?php
require_once '../db.php';
require_once '../vendor/autoload.php'; // если используете composer для firebase/php-jwt
// Если нет композера, скачайте библиотеку вручную или используйте простую самодельную JWT (я покажу упрощённый вариант)

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'email_and_password_required']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'invalid_credentials']);
    exit;
}

$secret = getenv('JWT_SECRET');
if (!$secret) {
    http_response_code(500);
    echo json_encode(['error' => 'JWT_SECRET not set']);
    exit;
}

$payload = [
    'user_id' => $user['id'],
    'email' => $user['email'],
    'exp' => time() + 3600 // 1 час
];
$jwt = JWT::encode($payload, $secret, 'HS256');

echo json_encode(['token' => $jwt]);