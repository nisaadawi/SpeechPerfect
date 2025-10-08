<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require 'db_config.php';

// Log incoming POST data for debugging
file_put_contents("debug_log.txt", date("Y-m-d H:i:s") . " | Emotion: " . ($_POST['emotion'] ?? 'NONE') . PHP_EOL, FILE_APPEND);

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB connection failed"]);
    exit;
}

$emotion = $_POST['emotion'] ?? '';

if ($emotion != '') {
    $sql = "INSERT INTO emotions (emotions) VALUES (?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $emotion);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Emotion stored"]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Insert failed"]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "No emotion received"]);
}

$conn->close();
?>
