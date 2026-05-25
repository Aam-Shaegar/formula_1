<?php
header('Content-Type: application/json; charset=utf-8');

$dsn = getenv('DB_DSN');
if (!$dsn) {
    http_response_code(500);
    die(json_encode(['error' => 'DB_DSN not set']));
}

if (!preg_match('/^([^:]+):([^@]+)@tcp\(([^:]+):(\d+)\)\/(.+)$/', $dsn, $matches)) {
    http_response_code(500);
    die(json_encode(['error' => 'Invalid DB_DSN format']));
}

$user = $matches[1];
$password = $matches[2];
$host = $matches[3];
$port = $matches[4];
$dbname = $matches[5];

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'DB connection failed']));
}