<?php
/* =============================================================
   IT 327 - Activity 3, Part B : SERVER-SIDE PROXY
   -------------------------------------------------------------
   Server-side proxy for the Open-Meteo Geocoding API
   ============================================================= */

header('Content-Type: application/json; charset=utf-8');

/* ---------- Load configuration ---------- */

$config = require __DIR__ . '/config.php';

/* ---------- Accept only expected parameters ---------- */

$name = isset($_GET['name']) ? trim($_GET['name']) : '';
$count = isset($_GET['count']) ? (int) $_GET['count'] : 5;

if ($name === '') {
    http_response_code(400);
    echo json_encode([
        'error' => 'name is required'
    ]);
    exit;
}

/* ---------- Build the upstream URL ---------- */

$url = $config['upstream'] . '?' . http_build_query([
    'name'     => $name,
    'count'    => max(1, min($count, 10)),
    'language' => 'en',
    'format'   => 'json'
]);

/* ---------- Call the upstream API ---------- */

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Could not reach the upstream service.'
    ]);
    curl_close($ch);
    exit;
}

/* ---------- Forward the HTTP status code ---------- */

$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

http_response_code($statusCode);

/* ---------- Return the API response ---------- */

echo $response;