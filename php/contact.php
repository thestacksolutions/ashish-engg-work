<?php
/**
 * Ashish Engineering Works — contact form handler
 * Receives the enquiry form as POST, validates it, stores it in MySQL
 * (if configured) and emails a notification. Responds with JSON so the
 * front-end script.js can show an inline success/error message.
 *
 * Setup:
 *   1. Create a MySQL database in Hostinger hPanel and run sql/schema.sql.
 *   2. Copy php/config.sample.php to php/config.php and fill in your
 *      real database credentials.
 *   3. If config.php is missing, this script still emails the enquiry —
 *      it just skips the database step. The site works either way.
 */

header('Content-Type: application/json');

function respond($success, $message = '') {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Method not allowed.');
}

// --- Basic honeypot spam guard: add a hidden "website" field in the form
// if you start getting bot spam, and reject any submission that fills it. ---
if (!empty($_POST['website'])) {
    respond(true); // silently pretend success to the bot
}

$name    = trim($_POST['name'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$email   = trim($_POST['email'] ?? '');
$product = trim($_POST['product'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $phone === '' || $email === '' || $message === '') {
    respond(false, 'Please fill in all required fields.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.');
}

$name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$phone   = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$product = htmlspecialchars($product, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
$ip      = $_SERVER['REMOTE_ADDR'] ?? '';

$configPath = __DIR__ . '/config.php';
$config = file_exists($configPath) ? require $configPath : null;

// --- 1. Store in MySQL, if configured ------------------------------------
if ($config) {
    try {
        $dsn = "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['db_user'], $config['db_password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
        $stmt = $pdo->prepare(
            'INSERT INTO enquiries (name, phone, email, product, message, ip_address)
             VALUES (:name, :phone, :email, :product, :message, :ip)'
        );
        $stmt->execute([
            ':name' => $name, ':phone' => $phone, ':email' => $email,
            ':product' => $product, ':message' => $message, ':ip' => $ip,
        ]);
    } catch (Exception $e) {
        error_log('AEW contact form DB error: ' . $e->getMessage());
        // Continue — the email notification below still tries to send.
    }
}

// --- 2. Email notification -------------------------------------------------
$notifyEmail = $config['notify_email'] ?? 'ashishengineeringworks9820@gmail.com';
$subject = 'New website enquiry — ' . ($product !== '' ? $product : 'General');
$body = "New enquiry from the website:\n\n"
      . "Name: $name\nPhone: $phone\nEmail: $email\nProduct: $product\n\nMessage:\n$message\n";
$headers = "From: no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'ashishengineeringworks.com') . "\r\n"
         . "Reply-To: $email\r\n";

$mailSent = @mail($notifyEmail, $subject, $body, $headers);

respond(true, $mailSent ? 'Enquiry sent.' : 'Enquiry saved.');
