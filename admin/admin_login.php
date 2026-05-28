<?php
require_once '../db.php';

function generateSimpleJWT($payload, $secret) {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $b64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $b64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    $signature = hash_hmac('sha256', $b64Header . '.' . $b64Payload, $secret, true);
    $b64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $b64Header . '.' . $b64Payload . '.' . $b64Signature;
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password required']);
    exit;
}

$stmt = $pdo->prepare("SELECT password_hash FROM admins WHERE username = ?");
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

$secret = getenv('JWT_SECRET') ?: 'default-secret-change-me';
$token = generateSimpleJWT(['admin' => $username, 'exp' => time() + 7200], $secret);

echo json_encode(['success' => true, 'token' => $token]);