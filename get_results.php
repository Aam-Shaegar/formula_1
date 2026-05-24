<?php
// get_results.php – возвращает HTML таблицу с результатами гонок 2026
// Работает без cURL (использует file_get_contents)

function httpGet($url) {
    // Создаём опции для HTTP-запроса
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
        return false;
    }
    return $response;
}

function getRaceResults($season = 2026) {
    $url = "https://api.jolpi.ca/ergast/f1/{$season}/results.json?limit=100";
    
    $response = httpGet($url);
    if ($response === false) return false;
    
    $data = json_decode($response, true);
    if (!isset($data['MRData']['RaceTable']['Races'])) return false;
    
    return $data['MRData']['RaceTable']['Races'];
}

$races = getRaceResults(2026);
?>

<?php if ($races): ?>
<div class="table-wrapper">
    <table class="results-table">
        <thead>
            <tr>
                <th>ГРАН-ПРИ</th>
                <th>ДАТА</th>
                <th>ПОБЕДИТЕЛЬ</th>
                <th>КОМАНДА</th>
                <th>КРУГИ</th>
                <th>ВРЕМЯ</th>
            </tr>
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
<?php else: ?>
    <div class="error-message" style="text-align:center; color:#ff6666; padding:2rem;">
        ⚠️ Не удалось загрузить результаты гонок. Проверьте соединение с интернетом или попробуйте позже.
    </div>
<?php endif; ?>