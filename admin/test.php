<?php
echo 'Step 1: script started<br>';
echo 'Current dir: ' . __DIR__ . '<br>';
echo 'Target path: ' . __DIR__ . '/../db.php<br>';
echo 'File exists: ' . (file_exists(__DIR__ . '/../db.php') ? 'YES' : 'NO') . '<br>';

if (file_exists(__DIR__ . '/../db.php')) {
    echo 'Step 2: trying to require...<br>';
    require_once __DIR__ . '/../db.php';
    echo 'Step 3: require successful<br>';
    echo 'PDO object exists: ' . (isset($pdo) ? 'YES' : 'NO') . '<br>';
} else {
    echo 'db.php NOT FOUND at that path<br>';
}
?>