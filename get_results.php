<?php
// get_results.php – отладочная версия (покажет причину проблемы)

// Включаем вывод всех ошибок, чтобы видеть что идёт не так
ini_set('display_errors', 1);
error_reporting(E_ALL);

function httpGet($url) {
    $options = [
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: Mozilla/5.0 (compatible; F1Site/1.0)\r\n",
            'timeout' => 30
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ];
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        $error = error_get_last();
        return false;
    }
    return $response;
}

$season = 2026;
$url = "https://api.jolpi.ca/ergast/f1/{$season}/results.json?limit=100";

$response = httpGet($url);
if ($response === false) {
    echo "<p style='color:red'>❌ Ошибка: не удалось получить данные от API. Проверьте, разрешены ли на хостинге внешние запросы (allow_url_fopen).</p>";
    exit;
}

$data = json_decode($response, true);
if (!$data) {
    echo "<p style='color:red'>❌ Ошибка: не удалось разобрать JSON. Первые 200 символов ответа: <br>" . htmlspecialchars(substr($response, 0, 200)) . "...</p>";
    exit;
}

if (!isset($data['MRData']['RaceTable']['Races'])) {
    echo "<p style='color:red'>❌ Ошибка: структура ответа не содержит гонок. Ключи ответа: " . htmlspecialchars(implode(', ', array_keys($data))) . "</p>";
    echo "<p>Первые 500 символов JSON: <pre>" . htmlspecialchars(substr($response, 0, 500)) . "</pre></p>";
    exit;
}

$races = $data['MRData']['RaceTable']['Races'];

if (empty($races)) {
    echo "<p>⚠️ Нет данных о гонках за сезон 2026. Возможно, сезон ещё не начался или API не возвращает результаты.</p>";
    exit;
}

// Если всё ок, выводим таблицу
?>
<div class="table-wrapper">
    <table class="results-table">
        <thead>
            <tr><th>ГРАН-ПРИ</th><th>ДАТА</th><th>ПОБЕДИТЕЛЬ</th><th>КОМАНДА</th><th>КРУГИ</th><th>ВРЕМЯ</th></tr>
        </thead>
        <tbody>
            <?php foreach ($races as $race):
                if (empty($race['Results'])) continue;
                $winner = $race['Results'][0];
                $driver = $winner['Driver'];
                $constructor = $winner['Constructor'];
                $time = $winner['Time']['time'] ?? $winner['status'] ?? '—';
            ?>
            <tr>
                <td><?= htmlspecialchars($race['raceName']) ?></td>
                <td><?= date('d M', strtotime($race['date'])) ?></td>
                <td><?= htmlspecialchars($driver['familyName'] ?? '—') ?></td>
                <td><?= htmlspecialchars($constructor['name'] ?? '—') ?></td>
                <td><?= htmlspecialchars($winner['laps'] ?? '—') ?></td>
                <td><strong><?= htmlspecialchars($time) ?></strong></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>