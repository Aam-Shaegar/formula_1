<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}
require_once '../db.php';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Админка F1</title>
    <meta charset="UTF-8">
    <style>
        body { background: #0b0b0b; font-family: Arial; padding: 20px; color: white; }
        h1 { color: #e10600; }
        .comment-box { border: 1px solid #333; margin: 10px 0; padding: 10px; border-radius: 10px; background: #1a1a1a; }
        textarea { width: 100%; background: #2a2a2a; border: none; color: white; padding: 10px; border-radius: 8px; }
        button { background: #e10600; border: none; padding: 5px 15px; color: white; border-radius: 5px; cursor: pointer; margin-right: 10px; }
        .logout { margin-bottom: 20px; }
        .logout a { color: #ff6666; }
    </style>
</head>
<body>
    <div class="logout">
        <a href="logout.php">🚪 Выйти из админки</a>
    </div>
    <h1>📝 Управление комментариями</h1>
    <div id="comments-list"></div>
    <script>
    async function loadComments() {
        const res = await fetch('/api/admin/comments.php');
        const comments = await res.json();
        const container = document.getElementById('comments-list');
        container.innerHTML = comments.map(c => `
            <div class="comment-box">
                <strong>${escapeHtml(c.name)}</strong> (${escapeHtml(c.email)})<br>
                <textarea id="comment-${c.id}">${escapeHtml(c.comment)}</textarea><br>
                <button onclick="updateComment(${c.id})">💾 Сохранить</button>
                <button onclick="deleteComment(${c.id})">🗑 Удалить</button>
            </div>
        `).join('');
    }
    async function updateComment(id) {
        const comment = document.getElementById(`comment-${id}`).value;
        await fetch('/api/admin/update_comment.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id, comment})
        });
        loadComments();
    }
    async function deleteComment(id) {
        if(confirm('Удалить комментарий?')) {
            await fetch('/api/admin/delete_comment.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id})
            });
            loadComments();
        }
    }
    function escapeHtml(str) { 
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) { 
            if(m==='&') return '&amp;'; 
            if(m==='<') return '&lt;'; 
            if(m==='>') return '&gt;'; 
            return m; 
        }); 
    }
    loadComments();
    </script>
</body>
</html>