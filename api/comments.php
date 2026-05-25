<?php
require_once '../db.php';

$stmt = $pdo->query("
    SELECT 
        u.id, 
        u.name, 
        u.comment, 
        DATE_FORMAT(u.updated_at, '%d.%m.%Y %H:%i') as updated_at,
        GROUP_CONCAT(d.name SEPARATOR ', ') as favorite_drivers
    FROM users u
    LEFT JOIN users_drivers ud ON u.id = ud.user_id
    LEFT JOIN drivers d ON ud.driver_id = d.id
    WHERE u.comment IS NOT NULL AND LENGTH(TRIM(u.comment)) > 10
    GROUP BY u.id
    ORDER BY u.updated_at DESC
    LIMIT 10
");
$comments = $stmt->fetchAll();

// Для красоты убираем лишние пробелы в комментариях
foreach ($comments as &$c) {
    $c['comment'] = trim($c['comment']);
    $c['name'] = trim($c['name']);
}
echo json_encode($comments);