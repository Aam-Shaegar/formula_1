<?php
require_once '../db.php';

// Простая проверка токена (можно расширить)
$headers = apache_request_headers();
$auth = $headers['Authorization'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$stmt = $pdo->query("
    SELECT u.id, u.name, u.email, u.comment, u.updated_at
    FROM users u
    WHERE u.comment IS NOT NULL
    ORDER BY u.updated_at DESC
");
echo json_encode($stmt->fetchAll());