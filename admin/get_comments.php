<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
require_once __DIR__ . '/../db.php';

$stmt = $pdo->query("SELECT id, name, email, comment, updated_at FROM users WHERE comment IS NOT NULL ORDER BY updated_at DESC");
$comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($comments);