<?php
require_once __DIR__ . '/db.php';

function addColIfNotExists($pdo, $table, $col, $def) {
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM `{$table}` LIKE '{$col}'");
        if (!$stmt->fetch()) {
            $pdo->exec("ALTER TABLE `{$table}` ADD `{$col}` {$def}");
            echo "Added {$col} to {$table}\n";
        } else {
            echo "{$col} already exists in {$table}\n";
        }
    } catch (Exception $e) {
        echo "Error on {$table}.{$col}: " . $e->getMessage() . "\n";
    }
}

addColIfNotExists($pdo, 'news_posts', 'card_title_font_size', 'INT DEFAULT 24');
addColIfNotExists($pdo, 'news_posts', 'card_kicker_font_size', 'INT DEFAULT 15');
addColIfNotExists($pdo, 'news_posts', 'card_color_mode', "VARCHAR(32) DEFAULT 'dual'");
addColIfNotExists($pdo, 'news_posts', 'card_manual_line_break', 'TEXT NULL');
addColIfNotExists($pdo, 'news_posts', 'card_image_position', "VARCHAR(50) DEFAULT 'center center'");

addColIfNotExists($pdo, 'news', 'card_title_font_size', 'INT DEFAULT 24');
addColIfNotExists($pdo, 'news', 'card_kicker_font_size', 'INT DEFAULT 15');
addColIfNotExists($pdo, 'news', 'card_color_mode', "VARCHAR(32) DEFAULT 'dual'");
addColIfNotExists($pdo, 'news', 'card_manual_line_break', 'TEXT NULL');
addColIfNotExists($pdo, 'news', 'card_image_position', "VARCHAR(50) DEFAULT 'center center'");

echo "Done adding columns.\n";
