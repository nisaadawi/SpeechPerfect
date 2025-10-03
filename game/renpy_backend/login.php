<?php
header("Content-Type: application/json");
require 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->password)) {
    $email = strtolower(trim($data->email));
    $password = $data->password;

    $stmt = $pdo->prepare("SELECT id, username, age, gender, email, password FROM users WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->rowCount() === 1) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($password, $user['password'])) {
            // Remove password before sending
            unset($user['password']);
            echo json_encode(["success" => true, "user" => $user]);
            exit();
        }
    }

    echo json_encode(["success" => false, "message" => "Invalid credentials."]);
} else {
    echo json_encode(["success" => false, "message" => "Missing email or password."]);
}
?>
