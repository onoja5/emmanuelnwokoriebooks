<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Method not allowed.']);
}

$host = strtolower(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    if ($host === '' || !hash_equals($host, $originHost)) {
        respond(403, ['error' => 'Request origin was not accepted.']);
    }
}

$raw = file_get_contents('php://input');
$input = json_decode($raw === false ? '' : $raw, true);
if (!is_array($input)) {
    $input = $_POST;
}

if (trim((string) ($input['website'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

$email = trim((string) ($input['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 || preg_match('/[\r\n]/', $email)) {
    respond(422, ['error' => 'Please enter a valid email address.']);
}

$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR .
    'ecn-contact-' . hash('sha256', $host . '|' . $ip) . '.json';
$now = time();
$attempts = [];
$handle = @fopen($rateFile, 'c+');
if ($handle !== false && flock($handle, LOCK_EX)) {
    $saved = stream_get_contents($handle);
    $decoded = json_decode($saved === false ? '' : $saved, true);
    if (is_array($decoded)) {
        $attempts = array_values(array_filter($decoded, static fn($time): bool => is_int($time) && $time > $now - 300));
    }
    if (count($attempts) >= 4) {
        flock($handle, LOCK_UN);
        fclose($handle);
        respond(429, ['error' => 'Please wait a few minutes before sending another message.']);
    }
    $attempts[] = $now;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($attempts));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

$recipient = 'info@emmanuelnwokoriebooks.com';
$from = 'website@emmanuelnwokoriebooks.com';
$type = (string) ($input['type'] ?? 'contact');

if ($type === 'newsletter') {
    $mailSubject = '[Website] Newsletter subscription';
    $body = "A reader requested newsletter updates.\n\nEmail: {$email}\nSubmitted: " . gmdate('c') . "\n";
} else {
    $name = trim(strip_tags((string) ($input['name'] ?? '')));
    $subject = trim(strip_tags((string) ($input['subject'] ?? 'General enquiry')));
    $message = trim((string) ($input['message'] ?? ''));
    $message = str_replace("\0", '', $message);
    if ($name === '' || strlen($name) > 120 || strlen($subject) < 1 || strlen($subject) > 100 || strlen($message) < 10 || strlen($message) > 5000) {
        respond(422, ['error' => 'Please complete every field and keep the message between 10 and 5,000 characters.']);
    }
    $safeSubject = preg_replace('/[\r\n]+/', ' ', $subject);
    $mailSubject = '[Website] ' . $safeSubject;
    $body = "New website enquiry\n\nName: {$name}\nEmail: {$email}\nSubject: {$safeSubject}\nSubmitted: " . gmdate('c') . "\n\nMessage:\n{$message}\n";
}

$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Emmanuel Nwokorie Books <' . $from . '>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . PHP_VERSION,
]);

if (!mail($recipient, $mailSubject, $body, $headers)) {
    respond(503, ['error' => 'Your message could not be sent. Please use WhatsApp or email the publisher directly.']);
}

respond(200, ['ok' => true]);
