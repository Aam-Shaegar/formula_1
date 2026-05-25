<?php
require_once '../db.php';

function generatePlainPassword($len = 10) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return substr(str_shuffle($chars), 0, $len);
}

function validateName($name) {
    $name = trim($name);
    if (empty($name)) return false;
    if (preg_match('/^[а-яА-ЯёЁ]+$/u', $name)) return true;
    if (preg_match('/^[a-zA-Z]+$/', $name)) return true;
    return false;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$birthdate = trim($input['birthdate'] ?? '');
$drivers = $input['drivers'] ?? [];
$comment = trim($input['comment'] ?? '');
$terms = $input['terms'] ?? false;

// Валидация
if (!validateName($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'name_invalid']);
    exit;
}
if (strlen($name) > 100) {
    http_response_code(400);
    echo json_encode(['error' => 'name_length']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'email_invalid']);
    exit;
}
if (strlen($email) > 255) {
    http_response_code(400);
    echo json_encode(['error' => 'email_length']);
    exit;
}
$date = DateTime::createFromFormat('Y-m-d', $birthdate);
if (!$date || $date->format('Y-m-d') !== $birthdate) {
    http_response_code(400);
    echo json_encode(['error' => 'birthdate_invalid']);
    exit;
}
$age = (new DateTime())->diff($date)->y;
if ($age < 12) {
    http_response_code(400);
    echo json_encode(['error' => 'age_too_young']);
    exit;
}
if (empty($drivers) || !is_array($drivers)) {
    http_response_code(400);
    echo json_encode(['error' => 'drivers_empty']);
    exit;
}
if (!$terms) {
    http_response_code(400);
    echo json_encode(['error' => 'terms_not_accepted']);
    exit;
}

// Проверка уникальности email
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'email_exists']);
    exit;
}

// Сохранение
$plainPassword = generatePlainPassword();
$passwordHash = password_hash($plainPassword, PASSWORD_DEFAULT);

$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, birthdate, comment) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $passwordHash, $birthdate, $comment ?: null]);
    $userId = $pdo->lastInsertId();

    $driverStmt = $pdo->prepare("INSERT INTO users_drivers (user_id, driver_id) VALUES (?, (SELECT id FROM drivers WHERE name = ?))");
    foreach ($drivers as $driverName) {
        $driverStmt->execute([$userId, $driverName]);
    }
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'email' => $email,
        'password' => $plainPassword
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'db_error']);
}