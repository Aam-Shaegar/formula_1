<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../db.php';

$id = (int)($_POST['id'] ?? 0);
$comment = trim($_POST['comment'] ?? '');

if ($id && $comment) {
    $stmt = $pdo->prepare("UPDATE users SET comment = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$comment, $id]);
}
header('Location: index.php');