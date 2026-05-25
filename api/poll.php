<?php
require_once '../db.php';

$stmt = $pdo->query("
    SELECT d.name, COUNT(ud.driver_id) as count 
    FROM drivers d 
    LEFT JOIN users_drivers ud ON d.id = ud.driver_id 
    GROUP BY d.id
    ORDER BY count DESC
");
$result = [];
while ($row = $stmt->fetch()) {
    $result[$row['name']] = (int)$row['count'];
}
echo json_encode($result);