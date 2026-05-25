<?php
require_once '../../db.php';
// Простая проверка админа (можно вынести в отдельный файл)
$stmt = $pdo->query("
    SELECT u.id, u.name, u.email, u.comment, u.updated_at
    FROM users u
    WHERE u.comment IS NOT NULL
    ORDER BY u.updated_at DESC
");
echo json_encode($stmt->fetchAll());