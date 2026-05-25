<?php
require_once '../../db.php';
$input = json_decode(file_get_contents('php://input'), true);
$id = (int)$input['id'];
if ($id) {
    $stmt = $pdo->prepare("UPDATE users SET comment = NULL WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'invalid']);
}