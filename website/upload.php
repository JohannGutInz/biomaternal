<?php
// upload.php - Sube a Catbox ocultando tu userhash (evita CORS y NetworkError)
// Pon este archivo junto al HTML en tu hosting (cruzgarcia.com / Hostinger)
// Requiere PHP con curl activo

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$userhash = '591ad8f7c8b8711c8beed228d'; // tu hash de catbox

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error'=>'Solo POST']);
    exit;
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error'=>'No file']);
    exit;
}

$file = $_FILES['file']['tmp_name'];
$filename = $_FILES['file']['name'];

$ch = curl_init('https://catbox.moe/user/api.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
$post = [
    'reqtype' => 'fileupload',
    'userhash' => $userhash,
    'fileToUpload' => new CURLFile($file, mime_content_type($file), $filename)
];
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
$response = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$response = trim($response);

if ($http === 200 && strpos($response, 'http') === 0) {
    echo json_encode(['url'=>$response, 'host'=>'catbox-php']);
} else {
    http_response_code(500);
    echo json_encode(['error'=>$response]);
}
?>
