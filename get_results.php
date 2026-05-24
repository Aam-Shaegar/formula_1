<?php
// get_results.php – возвращает HTML таблицу с результатами гонок 2026

function getRaceResults($season = 2026) {
    $url = "https://api.jolpi.ca/ergast/f1/{$season}/results.json?limit=100";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) return false;
    
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
                // Время: может быть 'Time' или 'status' (если не финишировал, но победитель всегда финиширует)
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
    <div class="error-message">Не удалось загрузить результаты гонок. Попробуйте позже.</div>
<?php endif; ?>