<?php
require_once __DIR__ . '/../db.php';

if (!isset($_SERVER['PHP_AUTH_USER'])) {
    header('WWW-Authenticate: Basic realm="Admin"');
    header('HTTP/1.1 401 Unauthorized');
    echo 'Login required';
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ?");
$stmt->execute([$_SERVER['PHP_AUTH_USER']]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($_SERVER['PHP_AUTH_PW'], $admin['password'])) {
    header('WWW-Authenticate: Basic realm="Admin"');
    header('HTTP/1.1 401 Unauthorized');
    echo 'Invalid credentials';
    exit;
}

echo "Welcome to admin panel, " . htmlspecialchars($_SERVER['PHP_AUTH_USER']);