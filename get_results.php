<?php
// get_results.php – читает данные из локального кэша (обновляется раз в сутки)

function getRaceResults($season = 2026) {
    $cacheFile = __DIR__ . '/races_cache.json';
    $cacheTime = 86400; // 24 часа

    // Если кэш существует и не устарел – берём из него
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
        $data = json_decode(file_get_contents($cacheFile), true);
        if ($data) return $data;
    }

    // Если кэша нет – получаем данные из API
    $url = "https://api.jolpi.ca/ergast/f1/{$season}/results.json?limit=100";
    
    // Пробуем разные методы запроса
    $response = false;
    
    // Способ 1: file_get_contents
    if (function_exists('file_get_contents') && ini_get('allow_url_fopen')) {
        $context = stream_context_create([
            'http' => ['timeout' => 30],
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
        ]);
        $response = @file_get_contents($url, false, $context);
    }
    
    // Способ 2: cURL (если есть)
    if ($response === false && function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        curl_close($ch);
    }
    
    if ($response === false) return false;
    
    $data = json_decode($response, true);
    if (!$data || !isset($data['MRData']['RaceTable']['Races'])) return false;
    
    // Сохраняем в кэш
    file_put_contents($cacheFile, $response);
    
    return $data['MRData']['RaceTable']['Races'];
}

$races = getRaceResults(2026);
?>
<?php if ($races): ?>
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
<?php else: ?>
    <div class="error-message" style="text-align:center; color:#ff6666; padding:2rem;">
        ⚠️ Не удалось загрузить результаты гонок. Проверьте подключение к интернету или попробуйте позже.
    </div>
<?php endif; ?>