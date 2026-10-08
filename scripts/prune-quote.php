<?php
// CLI only. Deploy outside the document root; run daily with CEGFORMA_CONFIG set.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$path = getenv('CEGFORMA_CONFIG');
if (!$path || !is_file($path)) { fwrite(STDERR, "CEGFORMA_CONFIG missing\n"); exit(1); }
$config = require $path;
$file = rtrim($config['private_dir'], '/') . '/requests.json';
if (!is_file($file)) exit(0);
$handle = fopen($file, 'r+');
if (!$handle || !flock($handle, LOCK_EX)) exit(1);
try {
    $state = json_decode(stream_get_contents($handle), true, 512, JSON_THROW_ON_ERROR);
    $now = time();
    $state['requests'] = array_filter($state['requests'], fn($entry) => $entry['time'] >= $now - 86400);
    foreach ($state['limits'] as $key => $times) {
        $times = array_values(array_filter($times, fn($t) => $t > $now - 3600));
        if ($times) $state['limits'][$key] = $times; else unset($state['limits'][$key]);
    }
    $json = json_encode($state, JSON_THROW_ON_ERROR);
    rewind($handle);
    if (!ftruncate($handle, 0) || fwrite($handle, $json) !== strlen($json) || !fflush($handle)) throw new RuntimeException('Write failed');
} finally { flock($handle, LOCK_UN); fclose($handle); }
