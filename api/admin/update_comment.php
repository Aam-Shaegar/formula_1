<?php
require_once '../../db.php';
$input = json_decode(file_get_contents('php://input'), true);
$id = (int)$input['id'];
$comment = trim($input['comment']);
if ($id && $comment) {
    $stmt = $pdo->prepare("UPDATE users SET comment = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$comment, $id]);
    echo json_encode(['success' => true]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'invalid']);
}