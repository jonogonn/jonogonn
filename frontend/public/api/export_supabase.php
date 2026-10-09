<?php
/**
 * Jonogon News - Supabase Schema SQL Exporter
 * Provides 1-click download of the hardened supabase_schema.sql file.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$schemaPath = __DIR__ . '/../supabase_schema.sql';
if (!file_exists($schemaPath)) {
    http_response_code(404);
    echo "Supabase schema file not found.";
    exit;
}

$content = file_get_contents($schemaPath);
$dateStr = date('Y-m-d_H-i-s');
$filename = "jonogon_supabase_schema_{$dateStr}.sql";

header('Content-Type: application/sql; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . strlen($content));
header('Pragma: no-cache');
header('Expires: 0');

echo $content;
exit;
