<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../db.php';

$comments = $pdo->query("SELECT id, name, email, comment, updated_at FROM users WHERE comment IS NOT NULL ORDER BY updated_at DESC")->fetchAll();
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Админка</title>
    <style>
        body { background: #0b0b0b; font-family: Arial; padding: 20px; color: white; }
        h1 { color: #e10600; }
        .comment { background: #1a1a1a; margin: 10px 0; padding: 10px; border-radius: 10px; }
        textarea { width: 100%; background: #333; color: white; border: none; padding: 5px; }
        button { background: #e10600; border: none; padding: 5px 10px; color: white; cursor: pointer; margin-top: 5px; }
        .logout { margin-bottom: 20px; display: inline-block; background: #333; padding: 5px 10px; border-radius: 5px; text-decoration: none; color: white; }
    </style>
</head>
<body>
    <a href="logout.php" class="logout">Выйти</a>
    <h1>Комментарии пользователей</h1>
    <?php foreach ($comments as $c): ?>
        <div class="comment">
            <strong><?= htmlspecialchars($c['name']) ?></strong> (<?= htmlspecialchars($c['email']) ?>)<br>
            <form method="POST" action="update.php">
                <textarea name="comment"><?= htmlspecialchars($c['comment']) ?></textarea>
                <input type="hidden" name="id" value="<?= $c['id'] ?>">
                <button type="submit">Сохранить</button>
            </form>
            <form method="POST" action="delete.php" style="display:inline;">
                <input type="hidden" name="id" value="<?= $c['id'] ?>">
                <button type="submit" onclick="return confirm('Удалить?')">Удалить</button>
            </form>
        </div>
    <?php endforeach; ?>
</body>
</html>