<?php
require_once __DIR__ . '/../db.php';

if (!isset($_SERVER['PHP_AUTH_USER'])) {
    header('WWW-Authenticate: Basic realm="Admin"');
    header('HTTP/1.1 401 Unauthorized');
    echo 'Access denied';
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ?");
$stmt->execute([$_SERVER['PHP_AUTH_USER']]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($_SERVER['PHP_AUTH_PW'], $admin['password'])) {
    header('WWW-Authenticate: Basic realm="Admin"');
    header('HTTP/1.1 401 Unauthorized');
    echo 'Invalid login or password';
    exit;
}

// УСПЕШНЫЙ ВХОД
echo '<h1>Admin panel</h1>';
echo '<p>Welcome, ' . htmlspecialchars($_SERVER['PHP_AUTH_USER']) . '!</p>';
echo '<p>You are logged in.</p>';