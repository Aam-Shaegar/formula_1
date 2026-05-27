<?php
require_once '../db.php';

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function verifySimpleJWT($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($header64, $payload64, $signature) = $parts;
    $expectedSignature = hash_hmac('sha256', $header64 . "." . $payload64, $secret, true);
    $expectedSignature64 = rtrim(strtr(base64_encode($expectedSignature), '+/', '-_'), '=');
    if (!hash_equals($expectedSignature64, $signature)) return null;
    $payload = json_decode(base64url_decode($payload64), true);
    if ($payload && isset($payload['exp']) && $payload['exp'] < time()) return null;
    return $payload;
}

function validateName($name) {
    $name = trim($name);
    if (empty($name)) return false;
    if (preg_match('/^[а-яА-ЯёЁ]+$/u', $name)) return true;
    if (preg_match('/^[a-zA-Z]+$/', $name)) return true;
    return false;
}

$headers = apache_request_headers();
$auth = $headers['Authorization'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'no_token']);
    exit;
}
$token = $matches[1];
$secret = getenv('JWT_SECRET');
if (!$secret) {
    $secret = 'it-is-the-most-top-secret-key-from-Epstein-s-files';
}
$decoded = verifySimpleJWT($token, $secret);
if (!$decoded || !isset($decoded['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'invalid_token']);
    exit;
}
$userId = $decoded['user_id'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT u.name, u.email, u.birthdate, u.comment,
               GROUP_CONCAT(d.name SEPARATOR ',') as favorite_drivers
        FROM users u
        LEFT JOIN users_drivers ud ON u.id = ud.user_id
        LEFT JOIN drivers d ON ud.driver_id = d.id
        WHERE u.id = ?
        GROUP BY u.id
    ");
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();
    if (!$profile) {
        http_response_code(404);
        echo json_encode(['error' => 'not_found']);
        exit;
    }
    echo json_encode($profile);
} elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = trim($input['name'] ?? '');
    $birthdate = trim($input['birthdate'] ?? '');
    $comment = trim($input['comment'] ?? '');
    $drivers = $input['drivers'] ?? [];

    if (!validateName($name) || strlen($name) > 100) {
        http_response_code(400);
        echo json_encode(['error' => 'name_invalid']);
        exit;
    }
    $date = DateTime::createFromFormat('Y-m-d', $birthdate);
    if (!$date) {
        http_response_code(400);
        echo json_encode(['error' => 'birthdate_invalid']);
        exit;
    }
    if (empty($drivers)) {
        http_response_code(400);
        echo json_encode(['error' => 'drivers_empty']);
        exit;
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, birthdate = ?, comment = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$name, $birthdate, $comment ?: null, $userId]);

        $stmt = $pdo->prepare("DELETE FROM users_drivers WHERE user_id = ?");
        $stmt->execute([$userId]);
        $driverStmt = $pdo->prepare("INSERT INTO users_drivers (user_id, driver_id) VALUES (?, (SELECT id FROM drivers WHERE name = ?))");
        foreach ($drivers as $driverName) {
            $driverStmt->execute([$userId, $driverName]);
        }
        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'update_failed']);
    }
}
?>