<?php
$host = "localhost";       // Your DB host
$dbname = "your_database"; // Your DB name
$user = "your_username";   // Your DB username
$pass = "your_password";   // Your DB password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}
?>
