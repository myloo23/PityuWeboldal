<?php
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
require __DIR__ . '/../server/quote.php';
function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
function persistState($handle, array $state): void {
    $json = json_encode($state, JSON_THROW_ON_ERROR);
    rewind($handle);
    if (!ftruncate($handle, 0) || fwrite($handle, $json) !== strlen($json) || !fflush($handle)) throw new RuntimeException('State write failed');
}
$lock = null; $attachments = [];
try {
    $method = $_SERVER['REQUEST_METHOD'];
    if (!in_array($method, ['GET','POST'], true)) { header('Allow: GET, POST'); throw new QuoteError('Nem támogatott kérés.', 405); }
    $configPath = realpath(getenv('CEGFORMA_CONFIG') ?: dirname(__DIR__, 2) . '/cegforma-private/quote.php');
    $publicRoot = realpath($_SERVER['DOCUMENT_ROOT']);
    if (!$configPath || !$publicRoot || str_starts_with($configPath, $publicRoot . DIRECTORY_SEPARATOR)) throw new QuoteError('Az online küldés még nem elérhető. Az összesítőt e-mailben is elküldheted.', 503);
    $config = require $configPath;
    if (empty($config['enabled'])) throw new QuoteError('Az online küldés jelenleg nem elérhető. Az összesítőt e-mailben is elküldheted.', 503);
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $development = !empty($config['development']) && in_array($ip, ['127.0.0.1','::1'], true) && preg_match('~^http://(127\.0\.0\.1|localhost)(:\d+)?$~D', $config['origin']);
    if (strlen($config['secret'] ?? '') < 64 || (!$development && (!str_starts_with($config['origin'], 'https://') || !in_array($config['smtp_security'] ?? '', ['tls','ssl'], true)))) throw new RuntimeException('Invalid configuration');
    if (!filter_var($config['from_email'] ?? '', FILTER_VALIDATE_EMAIL) || empty($config['smtp_host'])) throw new RuntimeException('SMTP configuration missing');
    if (!$development && (empty($config['smtp_username']) || empty($config['smtp_password']))) throw new RuntimeException('SMTP authentication missing');
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (($method === 'POST' || $origin !== '') && $origin !== $config['origin']) throw new QuoteError('A kérés eredete nem engedélyezett.', 403);
    if ($method === 'GET') {
        $payload = time() . '.' . bin2hex(random_bytes(16));
        respond(200, ['token' => $payload . '.' . signToken($payload, $ip, $config['secret'])]);
    }
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 11 * 1024 * 1024) throw new QuoteError('Túl nagy feltöltés. Összesen legfeljebb 10 MB csatolható.', 413);
    if (!$_POST) throw new QuoteError('Üres vagy túl nagy kérés. Ellenőrizd a csatolmányok méretét.', 413);
    $id = checkToken(textField($_POST, 'token', 120, true), $ip, $config['secret']);
    if (textField($_POST, 'website', 200) !== '') throw new QuoteError('A kérés nem fogadható el.', 422);
    $dir = realpath($config['private_dir'] ?? '');
    if (!$dir || $dir === $publicRoot || str_starts_with($dir, $publicRoot . DIRECTORY_SEPARATOR)) throw new RuntimeException('Private state directory missing');
    $lock = fopen($dir . '/requests.json', 'c+');
    if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) throw new QuoteError('A küldés átmenetileg foglalt. Próbáld újra egy perc múlva.', 503);
    chmod($dir . '/requests.json', 0600);
    $raw = stream_get_contents($lock);
    $state = $raw === '' ? ['requests'=>[], 'limits'=>[]] : json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    $now = time();
    foreach ($state['requests'] as $key => $entry) if ($entry['time'] < $now - 86400) unset($state['requests'][$key]);
    foreach ($state['limits'] as $key => $times) { $times = array_values(array_filter($times, fn($t) => $t > $now - 3600)); if ($times) $state['limits'][$key] = $times; else unset($state['limits'][$key]); }
    $reference = 'CF-' . strtoupper(substr($id, 0, 12));
    if (isset($state['requests'][$id])) {
        if ($state['requests'][$id]['status'] === 'sent') respond(200, ['ok'=>true, 'reference'=>$reference]);
        throw new QuoteError('Ennek az ajánlatkérésnek a kézbesítése nem igazolható. Ne küldd újra automatikusan; érdeklődj e-mailben ezzel az azonosítóval: ' . $reference, 409);
    }
    $ipKey = hash_hmac('sha256', $ip, $config['secret']);
    if (count($state['limits'][$ipKey] ?? []) >= 5 || count($state['limits']['global'] ?? []) >= 30) { header('Retry-After: 3600'); throw new QuoteError('Elérted az óránkénti küldési keretet. Próbáld később, vagy írj e-mailt.', 429); }
    $state['limits'][$ipKey][] = $now; $state['limits']['global'][] = $now;
    persistState($lock, $state);
    $catalog = json_decode(file_get_contents(__DIR__ . '/../server/catalog.json'), true, 512, JSON_THROW_ON_ERROR);
    $body = quoteBody($_POST, $catalog);
    $attachments = quoteFiles($_FILES, $_POST);
    $body .= "\n\nAzonosító: $reference\n\nGRAFIKÁK\n";
    foreach ($attachments as $file) $body .= $file['name'] . ' – ' . $file['original'] . ' – ' . $file['side'] . "\n";
    $body .= "\nA csatolmányok ügyféltől érkezett, nem vírusellenőrzött fájlok.\n";
    require __DIR__ . '/../server/vendor/phpmailer/Exception.php';
    require __DIR__ . '/../server/vendor/phpmailer/PHPMailer.php';
    require __DIR__ . '/../server/vendor/phpmailer/SMTP.php';
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP(); $mail->Host = $config['smtp_host']; $mail->Port = (int)$config['smtp_port'];
    $mail->SMTPAuth = !$development; $mail->Username = $config['smtp_username']; $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = $config['smtp_security']; $mail->SMTPAutoTLS = !$development;
    if ($development && !in_array($config['smtp_host'], ['127.0.0.1','localhost','::1'], true)) throw new RuntimeException('Development SMTP must be loopback');
    $mail->Timeout = 20; $mail->Timelimit = 30; $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['from_email'], 'Cégforma weboldal');
    $mail->addAddress('cegforma@gmail.com');
    $mail->addReplyTo(trim($_POST['email']));
    $mail->Subject = 'Cégforma árajánlatkérés – ' . $reference;
    $mail->MessageID = '<' . strtolower($reference) . '@' . explode('@', $config['from_email'])[1] . '>';
    $mail->Body = $body;
    foreach ($attachments as $file) $mail->addAttachment($file['path'], $file['name'], 'base64', $file['mime']);
    $state['requests'][$id] = ['time'=>$now, 'status'=>'pending']; persistState($lock, $state);
    try {
        $mail->send();
        $state['requests'][$id]['status'] = 'sent'; persistState($lock, $state);
    } catch (Throwable $error) {
        // An SMTP timeout may happen after acceptance: never blindly resend this token.
        $state['requests'][$id]['status'] = 'uncertain'; persistState($lock, $state);
        error_log('Cegforma SMTP failure ' . $reference); // No form data, file names or credentials.
        throw new QuoteError('A kézbesítés nem igazolható. Érdeklődj e-mailben ezzel az azonosítóval: ' . $reference, 409);
    }
    foreach ($attachments as $file) @unlink($file['path']);
    respond(200, ['ok'=>true, 'reference'=>$reference]);
} catch (QuoteError $error) {
    respond($error->status, ['ok'=>false, 'message'=>$error->getMessage()]);
} catch (Throwable $error) {
    error_log('Cegforma endpoint failure (' . get_class($error) . ')');
    respond(503, ['ok'=>false, 'message'=>'A küldés átmenetileg nem elérhető. Az adataid megmaradtak az oldalon; az összesítőt e-mailben is elküldheted.']);
} finally {
    // PHP also removes upload temporary files automatically at request shutdown.
    foreach ($attachments as $file) if (is_file($file['path'])) @unlink($file['path']);
    if (is_resource($lock)) { flock($lock, LOCK_UN); fclose($lock); }
}
