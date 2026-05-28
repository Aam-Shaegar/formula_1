<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../db.php';

$id = (int)($_POST['id'] ?? 0);

if ($id) {
    $stmt = $pdo->prepare("UPDATE users SET comment = NULL WHERE id = ?");
    $stmt->execute([$id]);
}
header('Location: index.php');