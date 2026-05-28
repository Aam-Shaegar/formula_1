<?php
session_start();
require_once '../db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    
    $stmt = $pdo->prepare("SELECT password_hash FROM admins WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    
    if ($admin && password_verify($password, $admin['password_hash'])) {
        $_SESSION['admin_logged_in'] = true;
        header('Location: index.php');
        exit;
    } else {
        $error = 'Неверный логин или пароль';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Вход в админку</title>
    <meta charset="UTF-8">
    <style>
        body { background: #0b0b0b; font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .login-box { background: #1a1a1a; padding: 2rem; border-radius: 20px; width: 300px; text-align: center; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #333; border: none; color: white; border-radius: 8px; }
        button { background: #e10600; border: none; padding: 10px; width: 100%; color: white; border-radius: 8px; cursor: pointer; }
        .error { color: #ff6666; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Вход в админку</h2>
        <?php if ($error): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <form method="POST">
            <input type="text" name="username" placeholder="Логин" required>
            <input type="password" name="password" placeholder="Пароль" required>
            <button type="submit">Войти</button>
        </form>
    </div>
</body>
</html>