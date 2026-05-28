<?php
require_once '../db.php';

$headers = apache_request_headers();
$auth = $headers['Authorization'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $auth)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = (int)($input['id'] ?? 0);

if ($id) {
    $stmt = $pdo->prepare("UPDATE users SET comment = NULL WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid id']);
}