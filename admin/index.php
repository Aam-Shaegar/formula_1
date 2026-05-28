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
<head><title>Админка F1</title><meta charset="UTF-8"></head>
<body>
    <h1>Управление комментариями</h1>
    <p><a href="logout.php">Выйти</a></p>
    <div id="comments-list"></div>
    <script>
    async function loadComments() {
        const res = await fetch('/api/admin/comments.php');
        const comments = await res.json();
        const container = document.getElementById('comments-list');
        container.innerHTML = comments.map(c => `
            <div style="border:1px solid #ccc; margin:10px; padding:10px;">
                <strong>${escapeHtml(c.name)}</strong> (${escapeHtml(c.email)})<br>
                <textarea id="comment-${c.id}">${escapeHtml(c.comment)}</textarea><br>
                <button onclick="updateComment(${c.id})">Сохранить</button>
                <button onclick="deleteComment(${c.id})">Удалить</button>
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
        if(confirm('Удалить?')) {
            await fetch('/api/admin/delete_comment.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id})
            });
            loadComments();
        }
    }
    function escapeHtml(str) { return str.replace(/[&<>]/g, function(m) { if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m; }); }
    loadComments();
    </script>
</body>
</html>