<?php
/**
 * Janogon News - Backblaze B2 & MariaDB Asset Management Helper
 */

require_once __DIR__ . '/config.php';

if (!function_exists('b2AuthorizeAccountHelper')) {
    function b2AuthorizeAccountHelper() {
        if (empty(B2_KEY_ID) || empty(B2_APPLICATION_KEY)) {
            return null;
        }
        $url = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, B2_KEY_ID . ":" . B2_APPLICATION_KEY);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        $res = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http === 200 && $res) {
            return json_decode($res, true);
        }
        return null;
    }
}

if (!function_exists('cleanB2StorageKey')) {
    function cleanB2StorageKey($keyOrUrl) {
        if (empty($keyOrUrl) || !is_string($keyOrUrl)) {
            return '';
        }

        $clean = trim($keyOrUrl);
        // Remove query parameters
        $clean = explode('?', $clean)[0];
        $clean = explode('#', $clean)[0];

        // Replace backslashes
        $clean = str_replace('\\', '/', $clean);

        // Check if it's a URL
        if (preg_match('#^https?://#i', $clean)) {
            $parsedPath = parse_url($clean, PHP_URL_PATH) ?: '';
            if (preg_match('#/file/[^/]+/(.+)$#i', $parsedPath, $m)) {
                $clean = $m[1];
            } elseif (preg_match('#(uploads/.+)$#i', $parsedPath, $m)) {
                $clean = $m[1];
            } else {
                $clean = basename($parsedPath);
            }
        }

        // If 'uploads/' exists anywhere inside string
        if (preg_match('#(uploads/[^?\#]+)#i', $clean, $m)) {
            $clean = $m[1];
        }

        $clean = ltrim($clean, '/');
        return $clean;
    }
}

if (!function_exists('deleteFileFromB2')) {
    function deleteFileFromB2($storageKey, $b2Auth = null, $fileId = '') {
        $cleanKey = cleanB2StorageKey($storageKey);
        if (empty($cleanKey)) {
            return false;
        }

        // If not hosted in uploads or bucket, return early
        if (strpos($cleanKey, 'uploads/') !== 0 && !preg_match('#\.(webp|jpg|jpeg|png|gif)$#i', $cleanKey)) {
            return false;
        }

        if (!$b2Auth) {
            $b2Auth = b2AuthorizeAccountHelper();
        }
        if (!$b2Auth || empty($b2Auth['apiUrl']) || empty($b2Auth['authorizationToken'])) {
            return false;
        }

        $apiUrl = $b2Auth['apiUrl'];
        $authToken = $b2Auth['authorizationToken'];
        $deletedAny = false;

        // 1. Delete all versions found via b2_list_file_versions
        try {
            $listVerUrl = "$apiUrl/b2api/v2/b2_list_file_versions";
            $ch = curl_init($listVerUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'bucketId' => B2_BUCKET_ID,
                'startFileName' => $cleanKey,
                'prefix' => $cleanKey,
                'maxFileCount' => 20
            ]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: $authToken",
                "Content-Type: application/json"
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 12);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            $vRes = curl_exec($ch);
            curl_close($ch);

            if ($vRes) {
                $vData = json_decode($vRes, true);
                if (!empty($vData['files']) && is_array($vData['files'])) {
                    foreach ($vData['files'] as $vf) {
                        if ($vf['fileName'] === $cleanKey || strpos($vf['fileName'], $cleanKey) === 0) {
                            $delCh = curl_init("$apiUrl/b2api/v2/b2_delete_file_version");
                            curl_setopt($delCh, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($delCh, CURLOPT_POST, true);
                            curl_setopt($delCh, CURLOPT_POSTFIELDS, json_encode([
                                'fileName' => $vf['fileName'],
                                'fileId' => $vf['fileId']
                            ]));
                            curl_setopt($delCh, CURLOPT_HTTPHEADER, [
                                "Authorization: $authToken",
                                "Content-Type: application/json"
                            ]);
                            curl_setopt($delCh, CURLOPT_TIMEOUT, 10);
                            curl_setopt($delCh, CURLOPT_SSL_VERIFYPEER, false);
                            curl_setopt($delCh, CURLOPT_SSL_VERIFYHOST, 0);
                            curl_exec($delCh);
                            $dHttp = curl_getinfo($delCh, CURLINFO_HTTP_CODE);
                            curl_close($delCh);
                            if ($dHttp === 200) {
                                $deletedAny = true;
                            }
                        }
                    }
                }
            }
        } catch (Exception $e) {}

        // 2. Also check b2_list_file_names if not deleted
        try {
            $listNamesUrl = "$apiUrl/b2api/v2/b2_list_file_names";
            $ch = curl_init($listNamesUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'bucketId' => B2_BUCKET_ID,
                'startFileName' => $cleanKey,
                'maxFileCount' => 3
            ]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: $authToken",
                "Content-Type: application/json"
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            $lRes = curl_exec($ch);
            curl_close($ch);

            if ($lRes) {
                $lData = json_decode($lRes, true);
                if (!empty($lData['files']) && is_array($lData['files'])) {
                    foreach ($lData['files'] as $lf) {
                        if ($lf['fileName'] === $cleanKey) {
                            $delCh = curl_init("$apiUrl/b2api/v2/b2_delete_file_version");
                            curl_setopt($delCh, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($delCh, CURLOPT_POST, true);
                            curl_setopt($delCh, CURLOPT_POSTFIELDS, json_encode([
                                'fileName' => $lf['fileName'],
                                'fileId' => $lf['fileId']
                            ]));
                            curl_setopt($delCh, CURLOPT_HTTPHEADER, [
                                "Authorization: $authToken",
                                "Content-Type: application/json"
                            ]);
                            curl_setopt($delCh, CURLOPT_TIMEOUT, 10);
                            curl_setopt($delCh, CURLOPT_SSL_VERIFYPEER, false);
                            curl_setopt($delCh, CURLOPT_SSL_VERIFYHOST, 0);
                            curl_exec($delCh);
                            $dHttp = curl_getinfo($delCh, CURLINFO_HTTP_CODE);
                            curl_close($delCh);
                            if ($dHttp === 200) {
                                $deletedAny = true;
                            }
                        }
                    }
                }
            }
        } catch (Exception $e) {}

        // 3. If explicit fileId was supplied and starts with '4_'
        if (!empty($fileId) && strpos((string)$fileId, '4_') === 0) {
            try {
                $delCh = curl_init("$apiUrl/b2api/v2/b2_delete_file_version");
                curl_setopt($delCh, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($delCh, CURLOPT_POST, true);
                curl_setopt($delCh, CURLOPT_POSTFIELDS, json_encode([
                    'fileName' => $cleanKey,
                    'fileId' => $fileId
                ]));
                curl_setopt($delCh, CURLOPT_HTTPHEADER, [
                    "Authorization: $authToken",
                    "Content-Type: application/json"
                ]);
                curl_setopt($delCh, CURLOPT_TIMEOUT, 10);
                curl_setopt($delCh, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($delCh, CURLOPT_SSL_VERIFYHOST, 0);
                curl_exec($delCh);
                $dHttp = curl_getinfo($delCh, CURLINFO_HTTP_CODE);
                curl_close($delCh);
                if ($dHttp === 200) {
                    $deletedAny = true;
                }
            } catch (Exception $e) {}
        }

        return $deletedAny;
    }
}

if (!function_exists('deleteMediaComplete')) {
    function deleteMediaComplete($pdo, $id = null, $storageKey = '', $fileName = '', $fileId = '', $b2Auth = null) {
        // If row exists in DB, fetch complete metadata
        if ($pdo && !empty($id)) {
            try {
                $q = $pdo->prepare("SELECT * FROM `media_gallery` WHERE `id` = ?");
                $q->execute([$id]);
                $r = $q->fetch(PDO::FETCH_ASSOC);
                if ($r) {
                    if (empty($storageKey)) $storageKey = $r['storage_key'] ?: ($r['file_name'] ?? '');
                    if (empty($fileName)) $fileName = $r['file_name'] ?: ($r['original_name'] ?? '');
                }
            } catch (Exception $e) {}
        }

        $cleanKey = cleanB2StorageKey($storageKey ?: $fileName);
        $baseName = basename($cleanKey ?: $fileName);

        // 1. Delete from Backblaze B2
        deleteFileFromB2($cleanKey, $b2Auth, $fileId);

        // 2. Delete from MariaDB media_gallery
        if ($pdo) {
            try {
                if (!empty($id)) {
                    $pdo->prepare("DELETE FROM `media_gallery` WHERE `id` = ?")->execute([$id]);
                }
                if (!empty($cleanKey)) {
                    $pdo->prepare("DELETE FROM `media_gallery` WHERE `storage_key` = ? OR `storage_key` LIKE ? OR `file_url` LIKE ? OR `public_url` LIKE ?")
                        ->execute([$cleanKey, "%$cleanKey%", "%$cleanKey%", "%$cleanKey%"]);
                }
                if (!empty($baseName)) {
                    $pdo->prepare("DELETE FROM `media_gallery` WHERE `file_name` = ? OR `original_name` = ?")
                        ->execute([$baseName, $baseName]);
                }
            } catch (Exception $e) {}

            // Also delete from media_uploads if table exists
            try {
                if (!empty($id)) {
                    $pdo->prepare("DELETE FROM `media_uploads` WHERE `id` = ?")->execute([$id]);
                }
                if (!empty($cleanKey)) {
                    $pdo->prepare("DELETE FROM `media_uploads` WHERE `storage_key` = ? OR `storage_key` LIKE ? OR `public_url` LIKE ?")
                        ->execute([$cleanKey, "%$cleanKey%", "%$cleanKey%"]);
                }
                if (!empty($baseName)) {
                    $pdo->prepare("DELETE FROM `media_uploads` WHERE `original_name` = ?")->execute([$baseName]);
                }
            } catch (Exception $e) {}
        }

        // 3. Delete from local server disk
        if (!empty($cleanKey) && strpos($cleanKey, 'uploads/') !== false) {
            $localPath = __DIR__ . '/../' . substr($cleanKey, strpos($cleanKey, 'uploads/'));
            if (file_exists($localPath) && is_file($localPath)) {
                @unlink($localPath);
            }
        }

        return true;
    }
}

if (!function_exists('deletePostAssetsAndRecord')) {
    function deletePostAssetsAndRecord($pdo, $postIdOrId) {
        if (!$pdo || empty($postIdOrId)) {
            return false;
        }

        $b2Auth = b2AuthorizeAccountHelper();

        // 1. Fetch the post record first
        $post = null;
        try {
            $stmt = $pdo->prepare("SELECT * FROM `news_posts` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?");
            $stmt->execute([$postIdOrId, $postIdOrId, $postIdOrId]);
            $post = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {}

        if (!$post) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM `news` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?");
                $stmt->execute([$postIdOrId, $postIdOrId, $postIdOrId]);
                $post = $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (Exception $e) {}
        }

        // 2. Extract and delete all associated images from B2 & MariaDB
        if ($post) {
            $imageUrls = [];

            // Featured Image
            if (!empty($post['featured_image'])) {
                $imageUrls[] = $post['featured_image'];
            }
            if (!empty($post['thumbnail_image'])) {
                $imageUrls[] = $post['thumbnail_image'];
            }

            // Gallery Images (JSON)
            if (!empty($post['gallery_images'])) {
                $decoded = json_decode($post['gallery_images'], true);
                if (is_array($decoded)) {
                    foreach ($decoded as $gi) {
                        if (is_string($gi)) $imageUrls[] = $gi;
                        elseif (is_array($gi) && !empty($gi['url'])) $imageUrls[] = $gi['url'];
                    }
                }
            }

            // Content & Blocks (find any uploaded image URLs)
            $allContent = ($post['content_bn'] ?? '') . ' ' . ($post['content_en'] ?? '') . ' ' . ($post['blocks'] ?? '');
            if (preg_match_all('#https?://[^"\'\s<>]+#i', $allContent, $matches)) {
                foreach ($matches[0] as $foundUrl) {
                    if (strpos($foundUrl, 'uploads/') !== false || strpos($foundUrl, 'jonogon.news') !== false || strpos($foundUrl, 'backblazeb2.com') !== false) {
                        $imageUrls[] = $foundUrl;
                    }
                }
            }

            $uniqueUrls = array_unique(array_filter($imageUrls));
            foreach ($uniqueUrls as $u) {
                deleteMediaComplete($pdo, null, $u, basename($u), '', $b2Auth);
            }
        }

        // 3. Delete the post row from news_posts
        try {
            $delStmt = $pdo->prepare("DELETE FROM `news_posts` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?");
            $delStmt->execute([$postIdOrId, $postIdOrId, $postIdOrId]);
        } catch (Exception $e) {}

        // Also delete from news table if present
        try {
            $delStmt2 = $pdo->prepare("DELETE FROM `news` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?");
            $delStmt2->execute([$postIdOrId, $postIdOrId, $postIdOrId]);
        } catch (Exception $e) {}

        return true;
    }
}
