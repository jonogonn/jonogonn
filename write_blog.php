<?php
// ============================================================
// #region PHP_BACKEND
// ============================================================
require_once __DIR__ . '/config.php';

$today      = date('Y-m-d');
$page_title = "Write Blog Post — HIRE X PRO";

$editParam = trim($_GET['edit'] ?? $_GET['slug'] ?? $_GET['id'] ?? '');
$editPostData = null;

if ($editParam !== '') {
    // 1. If numeric ID, query by ID
    if (is_numeric($editParam)) {
        $id = intval($editParam);
        $res = supabase_request("posts?id=eq.$id&select=*");
        if (!empty($res['data'][0])) {
            $editPostData = $res['data'][0];
        }
    }
    
    // 2. If not found or parameter is a slug string, query by slug
    if (!$editPostData) {
        $cleanSlug = preg_replace('/[^a-z0-9\-]/', '', strtolower($editParam));
        if ($cleanSlug) {
            $res = supabase_request("posts?slug=eq.$cleanSlug&select=*");
            if (!empty($res['data'][0])) {
                $editPostData = $res['data'][0];
            }
        }
    }

    // 3. Fallback: match against all posts in case of formatting mismatch
    if (!$editPostData) {
        $allRes = supabase_request("posts?select=*");
        if (!empty($allRes['data']) && is_array($allRes['data'])) {
            foreach ($allRes['data'] as $post) {
                if ((string)($post['id'] ?? '') === $editParam || (string)($post['slug'] ?? '') === $editParam) {
                    $editPostData = $post;
                    break;
                }
            }
        }
    }

    if ($editPostData) {
        $page_title = "Edit: " . htmlspecialchars($editPostData['title'] ?? 'Blog') . " — HIRE X PRO";
        $slug = $editPostData['slug'] ?? '';
        
        // Priority 1: Use content from database if available (contains WB_BLOCKS_DATA metadata)
        if (!empty($editPostData['content'])) {
            $editPostData['body_html'] = $editPostData['content'];
        } else if ($slug) {
            // Priority 2: Fallback to static HTML file on disk if database content was empty
            $htmlFile = __DIR__ . '/blog/' . $slug . '.html';
            if (file_exists($htmlFile)) {
                $htmlContent = file_get_contents($htmlFile);
                if (preg_match('/<div class="tp-blog-details-content[^"]*">([\s\S]*?)<\/div>\s*<div class="tp-blog-details-tag-wrap"/i', $htmlContent, $m)) {
                    $editPostData['body_html'] = trim($m[1]);
                }
            }
        }
    }
}

// Dynamic site root URL (works on localhost AND live server)
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
$siteRoot  = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http')
           . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost')
           . ($scriptDir === '/' ? '/' : rtrim($scriptDir, '/') . '/');

// PHP_POST_HANDLER — Route incoming AJAX/fetch requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // ----------------------------------------------------------
    // #region ACTION_SAVE_ASSETS
    // Receives base64-encoded images and audio files.
    // Uploads images directly to Cloudinary CDN with local fallback.
    // Returns {key → Cloudinary URL / local path} map so JS can
    // rewrite src/href in HTML before publishing.
    // ----------------------------------------------------------
    if (isset($_POST['action']) && $_POST['action'] === 'save_assets') {
        $slug     = preg_replace('/[^a-z0-9\-]/', '', $_POST['slug'] ?? 'post');
        $savedMap = []; // originalKey → saved path or Cloudinary URL
        $errors   = [];

        // -- Save images to Cloudinary (Folder: hirexpro/blog/images) --
        $imgDir = __DIR__ . '/blog/images/';
        if (!is_dir($imgDir)) @mkdir($imgDir, 0755, true);

        $images = isset($_POST['images']) ? json_decode($_POST['images'], true) : [];
        foreach ((array)$images as $item) {
            $key  = $item['key']  ?? '';
            $data = $item['data'] ?? '';
            if (!preg_match('/^data:image\/webp;base64,(.+)$/s', $data, $m)) {
                $errors[] = "Invalid WebP data for key: $key";
                continue;
            }

            // 1. Upload to Cloudinary CDN in 'hirexpro/blog/images'
            $publicId = $slug . '-' . substr(md5($key), 0, 8);
            $cloudRes = cloudinary_upload($data, 'hirexpro/blog/images', $publicId);

            if ($cloudRes['success'] && !empty($cloudRes['url'])) {
                $savedMap[$key] = $cloudRes['url'];
            } else {
                // 2. Fallback to local file if Cloudinary fails
                $bytes    = base64_decode($m[1]);
                $filename = $publicId . '.webp';
                if (file_put_contents($imgDir . $filename, $bytes, LOCK_EX) !== false) {
                    $savedMap[$key] = 'blog/images/' . $filename;
                } else {
                    $errors[] = "Failed to write image: $filename (" . ($cloudRes['error'] ?? '') . ")";
                }
            }
        }

        // -- Save audio files to Cloudinary (Folder: hirexpro/blog/audio) --
        $audDir = __DIR__ . '/blog/audios/';
        if (!is_dir($audDir)) @mkdir($audDir, 0755, true);

        $audios = isset($_POST['audios']) ? json_decode($_POST['audios'], true) : [];
        foreach ((array)$audios as $item) {
            $key  = $item['key']  ?? '';
            $data = $item['data'] ?? '';
            $ext  = preg_replace('/[^a-z0-9]/', '', strtolower($item['ext'] ?? 'mp3'));
            if (!preg_match('/^data:[^;]+;base64,(.+)$/s', $data, $m)) {
                $errors[] = "Invalid audio data for key: $key";
                continue;
            }

            $publicId = $slug . '-audio-' . substr(md5($key), 0, 8);
            // 1. Upload audio directly to Cloudinary 'hirexpro/blog/audio'
            $cloudRes = cloudinary_upload($data, 'hirexpro/blog/audio', $publicId);

            if ($cloudRes['success'] && !empty($cloudRes['url'])) {
                $savedMap[$key] = $cloudRes['url'];
            } else {
                // 2. Fallback to local file
                $bytes    = base64_decode($m[1]);
                $filename = $publicId . '.' . $ext;
                if (file_put_contents($audDir . $filename, $bytes, LOCK_EX) !== false) {
                    $savedMap[$key] = 'blog/audios/' . $filename;
                } else {
                    $errors[] = "Failed to write audio: $filename (" . ($cloudRes['error'] ?? '') . ")";
                }
            }
        }

        echo json_encode(['success' => empty($errors), 'map' => $savedMap, 'errors' => $errors]);
        exit;
    }
    // #endregion ACTION_SAVE_ASSETS

    // ----------------------------------------------------------
    // #region ACTION_ADD_TO_INDEX
    // 1. Insert new post card into blog.html (if exists)
    // 2. Sync full post row to Supabase Database (posts table)
    // ----------------------------------------------------------
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['action']) && $input['action'] === 'add_to_index') {
         $isScheduled = isset($input['scheduled']) && $input['scheduled'] === true;
         // Sanitize slug consistently
         $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($input['slug'] ?? ''));
         if (!$slug) { echo json_encode(['success'=>false,'error'=>'Invalid slug']); exit; }

         $postId = isset($input['post_id']) && is_numeric($input['post_id']) ? intval($input['post_id']) : null;

         $result = addToBlogHTML(
            __DIR__ . '/blog.html',
            $input['heading'],
            $slug,
            $input['category'],
            $input['publishDate'],
            $input['image'],
            $input['readTime'],
            $isScheduled
         );

        // -- Sync to Supabase Database (posts table) --
        $postPayload = [
            'title'          => $input['heading'] ?? '',
            'slug'           => $slug,
            'excerpt'        => $input['excerpt'] ?? '',
            'content'        => $input['content'] ?? '',
            'featured_image' => $input['image'] ?? '',
            'author'         => $input['author'] ?? 'HIRE X PRO',
            'reading_time'   => $input['readTime'] ?? '1 min read',
            'categories'     => is_array($input['categories'] ?? null) && count($input['categories']) > 0 ? $input['categories'] : (array)($input['category'] ?? ['Technology']),
            'tags'           => is_array($input['tags'] ?? null) ? $input['tags'] : [],
            'meta_title'     => $input['meta_title'] ?? '',
            'meta_desc'      => $input['meta_desc'] ?? '',
            'focus_keyword'  => $input['focus_keyword'] ?? '',
            'status'         => 'published',
            'updated_at'     => date('c')
        ];
        
        $savedId = $postId;
        $dbRes = null;

        if ($postId) {
            $dbRes = supabase_request("posts?id=eq.$postId", 'PATCH', $postPayload);
            if (!empty($dbRes['data'][0]['id'])) {
                $savedId = intval($dbRes['data'][0]['id']);
            }
        } else {
            $checkExisting = supabase_request("posts?slug=eq.$slug&select=id");
            if (!empty($checkExisting['data'][0]['id'])) {
                $matchedId = intval($checkExisting['data'][0]['id']);
                $dbRes = supabase_request("posts?id=eq.$matchedId", 'PATCH', $postPayload);
                $savedId = $matchedId;
            } else {
                $postPayload['created_at'] = date('c');
                $dbRes = supabase_request("posts", 'POST', $postPayload);
                if (!empty($dbRes['data'][0]['id'])) {
                    $savedId = intval($dbRes['data'][0]['id']);
                }
            }
        }

        echo json_encode([
            'success' => true,
            'post_id' => $savedId,
            'slug'    => $slug,
            'db'      => $dbRes
        ]);
        exit;
    }
    // #endregion ACTION_ADD_TO_INDEX

    // ----------------------------------------------------------
    // #region ACTION_SAVE_DRAFT
    // Saves a draft post directly into Supabase (status: 'draft')
    // and stores draft content so it shows in Admin Dashboard.
    // ----------------------------------------------------------
    if (isset($input['action']) && $input['action'] === 'save_draft') {
        $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($input['slug'] ?? ''));
        if (!$slug) {
            $slug = 'draft-' . time();
        }

        $postId = isset($input['post_id']) && is_numeric($input['post_id']) ? intval($input['post_id']) : null;

        $postPayload = [
            'title'          => trim($input['title'] ?? 'Untitled Draft'),
            'slug'           => $slug,
            'content'        => $input['content'] ?? '',
            'excerpt'        => trim($input['excerpt'] ?? ''),
            'featured_image' => trim($input['featured_image'] ?? 'https://res.cloudinary.com/ojaeefvp/image/upload/v1789066214/hirexpro/brands/b_1.webp'),
            'author'         => trim($input['author'] ?? 'HIRE X PRO'),
            'reading_time'   => trim($input['reading_time'] ?? '1 min read'),
            'categories'     => is_array($input['categories'] ?? null) ? $input['categories'] : (array)($input['category'] ?? ['Technology']),
            'tags'           => is_array($input['tags'] ?? null) ? $input['tags'] : [],
            'meta_title'     => trim($input['meta_title'] ?? ''),
            'meta_desc'      => trim($input['meta_desc'] ?? ''),
            'focus_keyword'  => trim($input['focus_keyword'] ?? ''),
            'status'         => 'draft',
            'updated_at'     => date('c')
        ];

        $savedId = $postId;
        $dbRes = null;

        if ($postId) {
            $dbRes = supabase_request("posts?id=eq.$postId", 'PATCH', $postPayload);
            if (!empty($dbRes['data'][0]['id'])) {
                $savedId = intval($dbRes['data'][0]['id']);
            }
        } else {
            $checkExisting = supabase_request("posts?slug=eq.$slug&select=id");
            if (!empty($checkExisting['data'][0]['id'])) {
                $matchedId = intval($checkExisting['data'][0]['id']);
                $dbRes = supabase_request("posts?id=eq.$matchedId", 'PATCH', $postPayload);
                $savedId = $matchedId;
            } else {
                $postPayload['created_at'] = date('c');
                $dbRes = supabase_request("posts", 'POST', $postPayload);
                if (!empty($dbRes['data'][0]['id'])) {
                    $savedId = intval($dbRes['data'][0]['id']);
                }
            }
        }

        echo json_encode([
            'success' => empty($dbRes['error']),
            'post_id' => $savedId,
            'slug'    => $slug,
            'db'      => $dbRes
        ]);
        exit;
    }
    // #endregion ACTION_SAVE_DRAFT

    // ----------------------------------------------------------
    // #region ACTION_GET_DRAFTS
    // Returns all draft posts from Supabase database
    // ----------------------------------------------------------
    if ((isset($_POST['action']) && $_POST['action'] === 'get_drafts') || (isset($input['action']) && $input['action'] === 'get_drafts')) {
        $res = supabase_request("posts?status=eq.draft&order=updated_at.desc");
        echo json_encode(['success' => $res['success'], 'data' => $res['data'] ?? []]);
        exit;
    }
    // #endregion ACTION_GET_DRAFTS

    // ----------------------------------------------------------
    // #region ACTION_DELETE_POST
    // Deletes from Supabase database and removes POST_CARD from blog.html
    // ----------------------------------------------------------
    if (isset($input['action']) && $input['action'] === 'delete_post') {
        $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($input['slug'] ?? ''));
        if (!$slug) { echo json_encode(['success'=>false,'error'=>'Invalid slug']); exit; }

        // Delete from Supabase
        supabase_request("posts?slug=eq.$slug", 'DELETE');

        $errors = [];

        // 1. Delete legacy HTML file if exists
        $postFile = __DIR__ . '/blog/' . $slug . '.html';
        if (file_exists($postFile)) {
            @unlink($postFile);
        }

        // 2. Remove POST_CARD block from blog.html
        $blogFile = __DIR__ . '/blog.html';
        if (file_exists($blogFile)) {
            $content = file_get_contents($blogFile);
            // Remove from <!-- POST_CARD slug="{slug}" ... --> to <!-- /POST_CARD -->
            $pattern = '/\n?\s*<!-- POST_CARD slug="' . preg_quote($slug, '/') . '"[\s\S]*?<!-- \/POST_CARD -->/m';
            $updated = preg_replace($pattern, '', $content);
            if ($updated !== null && $updated !== $content) {
                file_put_contents($blogFile, $updated, LOCK_EX);
            }
        }

        echo json_encode(['success' => true]);
        exit;
    }
    // #endregion ACTION_DELETE_POST
}
// ============================================================
// #endregion PHP_BACKEND
// ============================================================

// ============================================================
// #region PHP_FUNCTIONS — Helper functions for blog.html manipulation
// ============================================================

function addToBlogHTML($file, $title, $slug, $category, $date, $image, $readtime, $isScheduled = false) {
    $marker = '<!-- NEW_BLOG_POSTS_HERE -->';
    if (!file_exists($file)) return false;

    $imgSrc    = htmlspecialchars($image);
    $timestamp = time();

    // Determine link target based on scheduled status
    $linkHref = $isScheduled ? 'coming-soon.html' : 'blog/' . $slug . '.html';
    $scheduled = $isScheduled ? '1' : '0';

    // "Coming Soon" badge — only shown for scheduled posts
    $comingSoonBadge = $isScheduled
        ? '<span style="position:absolute;top:12px;left:12px;background:#f56004;color:#fff;
                font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;
                letter-spacing:0.6px;text-transform:uppercase;z-index:2;">Coming Soon</span>'
        : '';

    $card = '
    <!-- POST_CARD slug="' . $slug . '" date="' . $date . '" timestamp="' . $timestamp . '" category="' . htmlspecialchars($category) . '" readtime="' . htmlspecialchars($readtime) . '" scheduled="' . $scheduled . '" image="' . addslashes($image) . '" -->
    <div class="col-lg-4 col-md-6">
      <div class="tp-blog-item tp--hover-item mb-60 tp_fade_anim" data-delay=".4" data-fade-from="right" data-ease="bounce">
         <a href="' . $linkHref . '" class="tp-blog-thumb d-block mb-30 p-relative fix d-inline-block">
            ' . $comingSoonBadge . '
            <div class="tp--hover-img" data-displacement="assets/img/b_replace.webp" data-intensity="0.2" data-speedin="1" data-speedout="1">
               <img class="w-100" src="' . $imgSrc . '" alt="' . htmlspecialchars($title) . '">
            </div>
         </a>
         <div class="tp-blog-content text-center">
            <div class="tp-blog-meta mb-15">
               <span class="category">' . htmlspecialchars(ucwords($category)) . '</span>
               <span class="borders"></span>
               <span class="date">' . date('d M Y', strtotime($date)) . '</span>
               <span class="borders"></span>
               <span class="date">' . htmlspecialchars($readtime) . '</span>
            </div>
            <h3 class="fs-25 lh-120-per tp-text-common-white">
               <a class="underline-black" href="' . $linkHref . '">' . htmlspecialchars($title) . '</a>
            </h3>
         </div>
      </div>
   </div>
    <!-- /POST_CARD -->';

    $content = file_get_contents($file);
    if (strpos($content, $marker) === false) return false;

    // Extract all existing cards
    preg_match_all('/<!-- POST_CARD slug="([^"]+)" date="([^"]+)" timestamp="([^"]+)"[\s\S]*?<!-- \/POST_CARD -->/i', $content, $matches, PREG_SET_ORDER);
    $cards = [];
    foreach ($matches as $m) {
        $cSlug = $m[1];
        if ($cSlug === $slug) continue; // Skip old version of current slug
        $cDate = $m[2];
        $cTs   = (int)$m[3];
        if (!$cTs) $cTs = strtotime($cDate);
        $cards[$cSlug] = [
            'slug'      => $cSlug,
            'date'      => $cDate,
            'timestamp' => $cTs,
            'html'      => trim($m[0])
        ];
    }

    // Add new/updated card
    $cards[$slug] = [
        'slug'      => $slug,
        'date'      => $date,
        'timestamp' => $timestamp,
        'html'      => trim($card)
    ];

    // Sort descending by timestamp/date (newest first)
    uasort($cards, function($a, $b) {
        if ($b['timestamp'] === $a['timestamp']) {
            return strcmp($b['date'], $a['date']);
        }
        return $b['timestamp'] - $a['timestamp'];
    });

    // Remove all old card blocks from content
    $cleanContent = preg_replace('/\s*<!-- POST_CARD slug="[^"]+"[\s\S]*?<!-- \/POST_CARD -->/i', '', $content);
    $sortedCardsHtml = implode("\n    ", array_column($cards, 'html'));

    $updated = str_replace($marker, $sortedCardsHtml . "\n    " . $marker, $cleanContent);
    return file_put_contents($file, $updated, LOCK_EX);
}

// ============================================================
// #endregion PHP_FUNCTIONS — Helper functions for blog.html manipulation
// ============================================================



?>
<!DOCTYPE html>
<html class="no-js aleric-dark" lang="zxx">
<head>
   <meta charset="utf-8">
   <meta http-equiv="x-ua-compatible" content="ie=edge">
   <title>HIRE X PRO - Blog Details</title>
   <meta name="description" content="">
   <meta name="robots" content="noindex">
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <link rel="shortcut icon" type="image/x-icon" href="https://res.cloudinary.com/ojaeefvp/image/upload/v1789066253/hirexpro/ui/favicon.webp">

   <!-- CSS -->
   <link rel="stylesheet" href="css/atropos.min.css">
   <link rel="stylesheet" href="css/bootstrap.css">
   <link rel="stylesheet" href="css/font-awesome-pro.css">
   <link rel="stylesheet" href="css/magnific-popup.css">
   <link rel="stylesheet" href="css/main.css">
   <link rel="stylesheet" href="css/spacing.css">
   <link rel="stylesheet" href="css/swiper-bundle.css">
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
   <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>

   <!-- Header Styles -->
   <style>
      /* ==========================================================================
         WRITE BLOG PAGE — FULL RESPONSIVE STYLES
         Layout: [Left Toolbar / Drawer] [Editor Area] [Right Sidebar / Drawer]
         Supports Desktop, Laptop, Tablet, and Mobile devices (320px+)
         ========================================================================== */

      /* -- CSS Variables -------------------------------------------------------- */
      :root {
         --wb-accent:       #f56004;
         --wb-accent-dim:   rgba(245, 96, 4, 0.12);
         --wb-accent-glow:  rgba(245, 96, 4, 0.25);
         --wb-bg:           #0a0a0a;
         --wb-surface:      #111111;
         --wb-surface-2:    #161616;
         --wb-border:       rgba(255, 255, 255, 0.08);
         --wb-border-light: rgba(255, 255, 255, 0.14);
         --wb-text:         #cccccc;
         --wb-text-muted:   #777777;
         --wb-toolbar-w:    56px;   /* left toolbar width (desktop) */
         --wb-header-h:     58px;   /* sticky header height */
         --wb-sidebar-w:    280px;  /* right sidebar width (desktop) */
         --wb-sidebar-collapsed-w: 48px;
         --wb-drawer-w:     310px;  /* drawer width on tablet/mobile */
      }

      /* Global box sizing */
      *, *::before, *::after {
         box-sizing: border-box;
      }

      body.aleric-dark {
         background: var(--wb-bg);
         color: var(--wb-text);
         overflow-x: hidden;
         min-width: 320px;
      }

      /* Prevent body scroll when mobile drawer is open */
      body.wb-drawer-open {
         overflow: hidden !important;
      }

      /* ==========================================================================
         STICKY TOP HEADER
         ========================================================================== */
      #wb-header {
         position: sticky;
         top: 0;
         z-index: 200;
         min-height: var(--wb-header-h);
         background: #0d0d0d;
         border-bottom: 1px solid var(--wb-border);
         display: flex;
         flex-direction: column;
         justify-content: center;
         transition: background-color 0.2s ease;
      }
      .wb-header-inner {
         width: 100%;
         display: flex;
         align-items: center;
         justify-content: space-between;
         gap: 10px;
         padding: 0 16px;
         min-height: calc(var(--wb-header-h) - 3px);
      }
      .wb-header-left {
         display: flex;
         align-items: center;
         gap: 10px;
         min-width: 0;
         flex-shrink: 1;
      }
      .wb-back-btn {
         display: inline-flex;
         align-items: center;
         gap: 6px;
         color: #999;
         font-size: 13px;
         text-decoration: none;
         padding: 6px 10px;
         border: 1px solid var(--wb-border);
         border-radius: 6px;
         transition: all 0.2s;
         white-space: nowrap;
         flex-shrink: 0;
         background: rgba(255, 255, 255, 0.02);
      }
      .wb-back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); }
      
      .wb-page-title {
         font-size: 14px;
         font-weight: 600;
         color: #fff;
         margin: 0;
         max-width: 220px;
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: nowrap;
         transition: opacity 0.18s ease;
      }
      .wb-page-title.is-placeholder {
         opacity: 0.35;
         font-style: italic;
         font-weight: 400;
      }
      .wb-status-badge {
         font-size: 10px;
         font-weight: 700;
         padding: 3px 8px;
         border-radius: 20px;
         letter-spacing: 0.6px;
         text-transform: uppercase;
         background: rgba(255,255,255,0.07);
         color: #888;
         white-space: nowrap;
         flex-shrink: 0;
      }
      .wb-status-badge.published { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
      .wb-status-badge.draft, .wb-status-badge.draft-saved { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.35); }
      .wb-status-badge.editing { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.35); }

      /* Header action buttons */
      .wb-header-actions {
         display: flex;
         gap: 6px;
         align-items: center;
         flex-shrink: 0;
         margin-left: auto;
      }
      .wb-meta-stat-pill {
         display: inline-flex;
         align-items: center;
         gap: 6px;
         padding: 4px 8px;
         background: rgba(255, 255, 255, 0.03);
         border: 1px solid var(--wb-border);
         border-radius: 6px;
         font-size: 11px;
         color: var(--wb-text-muted);
         white-space: nowrap;
      }
      .wb-word-count {
         font-size: 11px;
         color: var(--wb-text-muted);
         white-space: nowrap;
      }

      /* Header buttons */
      .wb-btn {
         display: inline-flex;
         align-items: center;
         justify-content: center;
         gap: 6px;
         padding: 6px 12px;
         border-radius: 6px;
         font-size: 12px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.2s ease;
         border: 1px solid transparent;
         white-space: nowrap;
         line-height: 1.2;
         flex-shrink: 0;
      }
      .wb-btn-icon-only {
         width: 32px;
         height: 32px;
         padding: 0;
         font-size: 13px;
      }
      .wb-btn-draft { background: rgba(255,255,255,0.03); border-color: var(--wb-border); color: #bbb; }
      .wb-btn-draft:hover { border-color: var(--wb-accent); color: var(--wb-accent); background: var(--wb-accent-dim); }
      .wb-btn-preview { background: var(--wb-accent-dim); border-color: rgba(245,96,4,0.35); color: var(--wb-accent); }
      .wb-btn-preview:hover { background: rgba(245,96,4,0.2); border-color: var(--wb-accent); }
      .wb-btn-publish { background: var(--wb-accent); border-color: var(--wb-accent); color: #fff; box-shadow: 0 2px 10px rgba(245,96,4,0.3); }
      .wb-btn-publish:hover { background: #ff7722; border-color: #ff7722; box-shadow: 0 4px 14px rgba(245,96,4,0.45); }

      /* ==========================================================================
         BACKDROP OVERLAY (Mobile/Tablet Drawers)
         ========================================================================== */
      .wb-backdrop {
         position: fixed;
         inset: 0;
         background: rgba(0, 0, 0, 0.65);
         backdrop-filter: blur(4px);
         -webkit-backdrop-filter: blur(4px);
         z-index: 998;
         opacity: 0;
         pointer-events: none;
         transition: opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .wb-backdrop.active {
         opacity: 1;
         pointer-events: all;
      }

      /* Drawer header for mobile/tablet */
      .wb-drawer-header {
         display: none;
         align-items: center;
         justify-content: space-between;
         padding: 12px 14px;
         margin: -16px -16px 14px -16px;
         background: #151515;
         border-bottom: 1px solid var(--wb-border);
      }
      .wb-drawer-title {
         font-size: 13px;
         font-weight: 700;
         color: #fff;
         display: flex;
         align-items: center;
         gap: 8px;
         text-transform: uppercase;
         letter-spacing: 0.5px;
      }
      .wb-drawer-title i { color: var(--wb-accent); }
      .wb-drawer-close {
         width: 30px;
         height: 30px;
         border-radius: 6px;
         background: transparent;
         border: 1px solid var(--wb-border);
         color: #888;
         cursor: pointer;
         display: flex;
         align-items: center;
         justify-content: center;
         font-size: 14px;
         transition: all 0.2s;
         padding: 0;
      }
      .wb-drawer-close:hover { color: #fff; background: rgba(255,255,255,0.08); }

      /* Floating Action Button (FAB) on Mobile */
      .wb-mobile-insert-fab {
         display: none;
         position: fixed;
         bottom: 24px;
         right: 20px;
         width: 50px;
         height: 50px;
         border-radius: 50%;
         background: var(--wb-accent);
         color: #fff;
         border: none;
         box-shadow: 0 6px 20px rgba(245, 96, 4, 0.45);
         z-index: 150;
         align-items: center;
         justify-content: center;
         font-size: 20px;
         cursor: pointer;
         transition: all 0.22s ease;
      }
      .wb-mobile-insert-fab:hover,
      .wb-mobile-insert-fab:active {
         transform: scale(1.08);
         background: #ff7722;
         box-shadow: 0 8px 24px rgba(245, 96, 4, 0.6);
      }

      /* -- Three-Column Main Layout -------------------------------------------- */
      .wb-main {
         display: grid;
         /* Left toolbar | Editor | Right sidebar */
         grid-template-columns: var(--wb-toolbar-w) 1fr var(--wb-sidebar-w);
         min-height: calc(100vh - var(--wb-header-h));
         background: var(--wb-bg);
      }

      /* ==========================================================================
         LEFT INSERT TOOLBAR (vertical, sticky)
         ========================================================================== */
      .wb-insert-toolbar {
         position: sticky;
         top: var(--wb-header-h);
         width: var(--wb-toolbar-w);
         min-width: var(--wb-toolbar-w);
         max-width: var(--wb-toolbar-w);
         height: calc(100vh - var(--wb-header-h));
         background: #0d0d0d;
         border-right: 1px solid var(--wb-border);
         display: flex;
         flex-direction: column;
         align-items: center;
         padding: 14px 0;
         gap: 4px;
         overflow-x: hidden;
         overflow-y: auto;
         scrollbar-width: none; /* Firefox */
      }
      .wb-insert-toolbar::-webkit-scrollbar { display: none; } /* Chrome */

      /* "INSERT" label rotated vertically */
      .wb-toolbar-label {
         font-size: 9px;
         font-weight: 700;
         color: var(--wb-text-muted);
         letter-spacing: 1.5px;
         text-transform: uppercase;
         writing-mode: vertical-rl;
         text-orientation: mixed;
         transform: rotate(180deg);
         margin-bottom: 10px;
         padding-bottom: 10px;
         border-bottom: 1px solid var(--wb-border);
         width: 100%;
         text-align: center;
      }

      /* Each toolbar icon button */
      .wb-insert-btn {
         position: relative;
         width: 38px;
         height: 38px;
         border: none;
         background: transparent;
         color: var(--wb-text-muted);
         border-radius: 6px;
         cursor: pointer;
         display: flex;
         align-items: center;
         justify-content: center;
         font-size: 15px;
         transition: all 0.18s;
         flex-shrink: 0;
         overflow: hidden;
      }
      /* Hide text label on desktop (only show in mobile drawer) */
      .wb-insert-btn .wb-btn-label {
         display: none;
      }
      .wb-insert-btn:hover {
         background: var(--wb-accent-dim);
         color: var(--wb-accent);
      }
      /* Tooltip on hover */
      .wb-insert-btn::after {
         content: attr(data-tooltip);
         position: absolute;
         left: calc(100% + 10px);
         top: 50%;
         transform: translateY(-50%);
         background: #1a1a1a;
         color: #fff;
         font-size: 11px;
         font-weight: 600;
         white-space: nowrap;
         padding: 4px 10px;
         border-radius: 4px;
         border: 1px solid var(--wb-border);
         pointer-events: none;
         opacity: 0;
         transition: opacity 0.15s;
         z-index: 999;
      }
      .wb-insert-btn:hover::after { opacity: 1; }

      /* Thin divider between toolbar groups */
      .wb-toolbar-divider {
         width: 28px;
         height: 1px;
         background: var(--wb-border);
         margin: 6px 0;
         flex-shrink: 0;
      }

      /* ==========================================================================
         EDITOR AREA (centre column)
         ========================================================================== */
      .wb-editor-area {
         padding: 36px 40px 80px;
         max-width: 860px;
         width: 100%;
         margin: 0 auto;
      }

      /* -- Individual editor blocks -------------------------------------------- */
      .wb-block {
         position: relative;
         background: var(--wb-surface);
         border: 1px solid var(--wb-border);
         border-radius: 8px;
         margin-bottom: 20px;
         transition: border-color 0.2s;
      }
      .wb-block:hover { border-color: rgba(255,255,255,0.14); }
      .wb-block:focus-within { border-color: rgba(245,96,4,0.35); }

      /* Block header bar */
      .wb-block-header {
         display: flex;
         align-items: center;
         justify-content: space-between;
         padding: 10px 16px;
         border-bottom: 1px solid var(--wb-border);
      }
      .wb-block-label {
         font-size: 11px;
         font-weight: 700;
         color: var(--wb-accent);
         text-transform: uppercase;
         letter-spacing: 0.7px;
         display: flex;
         align-items: center;
         gap: 7px;
      }
      .wb-block-label i { font-size: 12px; }
      .wb-block-body  { padding: 16px; }

      /* Remove block button */
      .wb-block-remove {
         background: none;
         border: none;
         color: var(--wb-text-muted);
         cursor: pointer;
         font-size: 18px;
         line-height: 1;
         padding: 0 4px;
         transition: color 0.15s;
      }
      .wb-block-remove:hover { color: #ff4444; }

      .wb-block-move {
         background: none;
         border: none;
         color: var(--wb-text-muted);
         cursor: pointer;
         font-size: 18px;
         line-height: 1;
         padding: 0 4px;
         transition: color 0.15s;
      }
      .wb-block-move:hover { color: #ff4444; }

      /* -- Heading block ------------------------------------------------------- */
      .wb-heading-level-row {
         display: flex;
         align-items: center;
         gap: 10px;
         margin-bottom: 12px;
      }
      .wb-label-sm {
         font-size: 11px;
         color: var(--wb-text-muted);
         font-weight: 600;
         white-space: nowrap;
      }
      .wb-select {
         background: rgba(255,255,255,0.04);
         border: 1px solid var(--wb-border);
         color: var(--wb-text);
         padding: 5px 10px;
         border-radius: 4px;
         font-size: 13px;
         font-family: inherit;
         cursor: pointer;
      }
      .wb-select option { background: #1a1a1a; }
      .wb-select:focus  { outline: none; border-color: var(--wb-accent); }

      /* Contenteditable fields */
      [contenteditable="true"] {
         outline: none;
         min-height: 1.5em;
      }
      [contenteditable="true"]:empty::before {
         content: attr(placeholder);
         color: #444;
         pointer-events: none;
      }
      .wb-heading-content {
         font-size: 26px;
         font-weight: 700;
         color: #fff;
         line-height: 1.3;
         width: 100%;
      }

      /* -- Meta Info block ----------------------------------------------------- */
      .wb-meta-row {
         display: flex;
         align-items: center;
         gap: 16px;
         flex-wrap: wrap;
      }
      .wb-meta-avatar {
         width: 44px;
         height: 44px;
         border-radius: 50%;
         background: var(--wb-accent-dim);
         border: 1px solid rgba(245,96,4,0.3);
         display: flex;
         align-items: center;
         justify-content: center;
         font-size: 13px;
         font-weight: 700;
         color: var(--wb-accent);
         flex-shrink: 0;
         transition: all 0.2s;
      }
      .wb-meta-inputs {
         display: flex;
         gap: 10px;
         flex-wrap: wrap;
         flex: 1;
      }

      /* -- Tags block ---------------------------------------------------------- */
      .wb-tags-container {
         display: flex;
         flex-wrap: wrap;
         gap: 8px;
         min-height: 32px;
         margin-bottom: 12px;
      }
      .wb-tag {
         display: inline-flex;
         align-items: center;
         gap: 6px;
         background: var(--wb-accent-dim);
         border: 1px solid rgba(245,96,4,0.25);
         color: var(--wb-accent);
         padding: 4px 10px;
         border-radius: 20px;
         font-size: 12px;
         font-weight: 600;
      }
      .wb-tag-remove {
         cursor: pointer;
         opacity: 0.6;
         font-size: 14px;
         line-height: 1;
         background: none;
         border: none;
         color: inherit;
         padding: 0;
      }
      .wb-tag-remove:hover { opacity: 1; }
      .wb-tags-add-row {
         display: flex;
         gap: 8px;
         align-items: center;
      }

      /* -- Image / Banner block ------------------------------------------------- */
      .wb-image-dropzone {
         border: 2px dashed var(--wb-border);
         border-radius: 8px;
         padding: 32px 20px;
         text-align: center;
         cursor: pointer;
         transition: all 0.25s;
         position: relative;
      }
      .wb-image-dropzone.drag-over,
      .wb-image-dropzone:hover { border-color: var(--wb-accent); background: var(--wb-accent-dim); }
      .wb-image-dropzone i       { font-size: 32px; color: var(--wb-text-muted); margin-bottom: 10px; display: block; }
      .wb-image-dropzone p       { font-size: 13px; color: #666; margin: 0 0 4px; }
      .wb-image-dropzone small   { font-size: 11px; color: #555; }
      .wb-image-preview          { width: 100%; border-radius: 6px; display: none; }
      .wb-image-caption-input    { margin-top: 12px; }

      /* -- Paragraph block ----------------------------------------------------- */
      .wb-format-toolbar {
         display: flex;
         gap: 4px;
         margin-bottom: 12px;
         padding-bottom: 10px;
         border-bottom: 1px solid var(--wb-border);
      }
      .wb-format-btn {
         background: rgba(255,255,255,0.05);
         border: 1px solid var(--wb-border);
         color: var(--wb-text);
         width: 30px;
         height: 28px;
         border-radius: 4px;
         cursor: pointer;
         font-size: 12px;
         font-weight: 700;
         transition: all 0.15s;
         display: flex;
         align-items: center;
         justify-content: center;
      }
      .wb-format-btn:hover { background: var(--wb-accent-dim); border-color: var(--wb-accent); color: var(--wb-accent); }
      .wb-paragraph-content {
         font-size: 16px;
         line-height: 1.75;
         color: var(--wb-text);
         min-height: 100px;
         width: 100%;
      }

      .wb-editable-ul li, .wb-editable-ol li { 
         color: var(--wb-text) !important; 
      }

      /* ==========================================================================
         SHARED FORM INPUTS (used inside blocks and sidebar)
         ========================================================================== */
      .wb-input {
         width: 100%;
         background: rgba(255,255,255,0.04);
         border: 1px solid var(--wb-border);
         color: var(--wb-text);
         padding: 8px 12px;
         border-radius: 4px;
         font-size: 13px;
         font-family: inherit;
         transition: border-color 0.2s;
         color-scheme: dark;
      }

      input[type=text], input[type=url]{
         background: rgba(255,255,255,0.04) !important;
         border: 1px solid var(--wb-border) !important;
      }

      .wb-input:focus         { outline: none; border-color: var(--wb-accent); background: var(--wb-accent-dim); }
      .wb-input::placeholder  { color: #444; }
      .wb-input-sm            { padding: 6px 10px; font-size: 12px; }
      select.wb-input option  { background: #1a1a1a; }
      textarea.wb-input       { resize: vertical; min-height: 70px; }

      /* Small action button (inside blocks) */
      .wb-action-btn {
         padding: 6px 14px;
         background: transparent;
         border: 1px solid var(--wb-border);
         color: var(--wb-text);
         border-radius: 4px;
         font-size: 12px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.15s;
         white-space: nowrap;
      }
      .wb-action-btn:hover { border-color: var(--wb-accent); color: var(--wb-accent); }

      /* ==========================================================================
         RIGHT SIDEBAR
         ========================================================================== */
      .wb-sidebar {
         position: sticky;
         top: var(--wb-header-h);
         height: calc(100vh - var(--wb-header-h));
         overflow-y: auto;
         background: #0d0d0d;
         border-left: 1px solid var(--wb-border);
         padding: 20px 16px;
         scrollbar-width: thin;
         scrollbar-color: #222 transparent;
      }
      .wb-sidebar::-webkit-scrollbar       { width: 4px; }
      .wb-sidebar::-webkit-scrollbar-track { background: transparent; }
      .wb-sidebar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

      /* Sidebar section card */
      .wb-sidebar-card {
         background: var(--wb-surface);
         border: 1px solid var(--wb-border);
         border-radius: 8px;
         padding: 16px;
         margin-bottom: 16px;
      }
      .wb-sidebar-card-title {
         font-size: 10px;
         font-weight: 800;
         color: var(--wb-accent);
         text-transform: uppercase;
         letter-spacing: 0.8px;
         margin: 0 0 14px;
         padding-bottom: 10px;
         border-bottom: 1px solid var(--wb-border);
         display: flex;
         align-items: center;
         gap: 7px;
      }
      .wb-field { margin-bottom: 12px; }
      .wb-field:last-child { margin-bottom: 0; }
      .wb-field-label {
         display: block;
         font-size: 10px;
         font-weight: 700;
         color: #777;
         text-transform: uppercase;
         letter-spacing: 0.5px;
         margin-bottom: 5px;
      }
      .wb-meta-char-count { font-size: 10px; color: #555; margin-top: 3px; }

      /* Category checkboxes */
      .wb-category-list        { list-style: none; padding: 0; margin: 0; max-height: 150px; overflow-y: auto; }
      .wb-category-list li     { margin-bottom: 7px; }
      .wb-category-list label  { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #bbb; cursor: pointer; }
      .wb-category-list input  { accent-color: var(--wb-accent); width: 13px; height: 13px; flex-shrink: 0; }

      /* Schedule toggle */
      .wb-schedule-row         { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
      .wb-schedule-row label   { font-size: 12px; color: #888; cursor: pointer; }
      .wb-schedule-row input   { accent-color: var(--wb-accent); width: 13px; height: 13px; }

      /* Sidebar publish buttons */
      .wb-sidebar-publish-wrap { display: flex; flex-direction: column; gap: 8px; }
      .wb-btn-full             { width: 100%; padding: 10px; font-size: 13px; border-radius: 4px; }

      /* ==========================================================================
         TOAST NOTIFICATION
         ========================================================================== */
      .wb-toast {
         position: fixed;
         bottom: 28px;
         right: 28px;
         z-index: 9999;
         background: #1a1a1a;
         border: 1px solid var(--wb-border);
         color: #fff;
         padding: 13px 18px;
         border-radius: 8px;
         font-size: 13px;
         display: flex;
         align-items: center;
         gap: 8px;
         transform: translateY(80px);
         opacity: 0;
         transition: all 0.3s ease;
         pointer-events: none;
         box-shadow: 0 8px 32px rgba(0,0,0,0.5);
         max-width: 320px;
      }
      .wb-toast.show    { transform: translateY(0); opacity: 1; }
      .wb-toast.success { border-color: rgba(34,197,94,0.4); }
      .wb-toast.error   { border-color: rgba(239,68,68,0.4); }

      /* ======================================================
         #region SIDEBAR_TOGGLE_CSS
         Styles for left-toolbar and right-sidebar toggle
         buttons and their collapsed/expanded layout states.
         ====================================================== */

      /* -- Shared toggle icon button ----------------------- */
      .wb-toggle-btn {
         width: 34px;
         height: 34px;
         border: 1px solid var(--wb-border);
         background: rgba(255,255,255,0.02);
         color: var(--wb-text-muted);
         border-radius: 6px;
         cursor: pointer;
         display: inline-flex;
         align-items: center;
         justify-content: center;
         transition: all 0.2s ease;
         flex-shrink: 0;
         padding: 0;
      }
      .wb-toggle-btn:hover  { color: var(--wb-accent); border-color: rgba(245,96,4,0.4); background: var(--wb-accent-dim); }
      .wb-toggle-btn.active { color: var(--wb-accent); border-color: rgba(245,96,4,0.5); background: var(--wb-accent-dim); }

      /* -- Smooth grid transition on layout ---------------- */
      .wb-main {
         transition: grid-template-columns 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .wb-insert-toolbar,
      .wb-sidebar {
         transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                     opacity 0.22s ease,
                     padding 0.28s ease;
      }

      /* -- Left toolbar collapsed state (desktop) ---------- */
      .wb-main.wb-left-collapsed {
         grid-template-columns: 0px 1fr var(--wb-sidebar-w);
      }
      .wb-main.wb-left-collapsed .wb-insert-toolbar {
         width: 0;
         padding: 0;
         border-right: none;
         opacity: 0;
         pointer-events: none;
      }

      /* -- Right sidebar collapsed state (desktop) --------- */
      .wb-main.wb-right-collapsed {
         grid-template-columns: var(--wb-toolbar-w) 1fr 0px;
      }
      .wb-main.wb-right-collapsed .wb-sidebar {
         width: 0;
         padding: 0;
         border-left: none;
         opacity: 0;
         pointer-events: none;
      }

      /* ======================================================
         #endregion SIDEBAR_TOGGLE_CSS
         ====================================================== */


      /* ======================================================
         #region DYNAMIC_HEADER_TITLE_CSS
         Styles for the live-updating header title element.
         ====================================================== */

      .wb-page-title {
         transition: opacity 0.18s ease;
         max-width: 300px;
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: nowrap;
      }
      .wb-page-title.is-placeholder {
         opacity: 0.32;
         font-style: italic;
         font-weight: 400;
      }

      /* ======================================================
         #endregion DYNAMIC_HEADER_TITLE_CSS
         ====================================================== */

      /* ======================================================
         #region BUG_FIXES_AND_FEATURES_CSS
         Fix1: text visibility + link color
         Fix2: custom modal | Fix3: compact block controls
         Fix4: sidebar scroll | Fix5: code copy button
         Fix6: autosave status + reading progress bar
         Fix7: youtube iframe + audio src handling
         Fix8: claude-style sidebar (expanded/collapsed)
         Fix9a: table row/col delete icons
         Fix9b: list item delete icons
         ====================================================== */

      /* -- Fix 1a: Force readable text in paragraph blocks - */
      .wb-paragraph-content,
      .wb-paragraph-content p,
      .wb-paragraph-content span,
      .wb-paragraph-content div { color: var(--wb-text) !important; }
      [contenteditable="true"] { color: var(--wb-text); }

      /* -- Fix 1b: Link colour = brand orange, visually distinct */
      .wb-paragraph-content a,
      [contenteditable="true"] a {
         color: #f56004 !important;
         text-decoration: underline;
         text-underline-offset: 3px;
         font-weight: 600;
         transition: opacity 0.15s;
      }
      .wb-paragraph-content a:hover,
      [contenteditable="true"] a:hover { opacity: 0.75; }

      /* -- Fix 3: Clean, aligned block header controls ----- */
      .wb-block-header {
         gap: 6px !important;
      }
      .wb-block-controls {
         display: flex;
         align-items: center;
         gap: 2px;
         margin-left: auto;
      }
      .wb-block-remove,
      .wb-block-move {
         width: 26px !important;
         height: 26px !important;
         display: inline-flex !important;
         align-items: center !important;
         justify-content: center !important;
         padding: 0 !important;
         font-size: 12px !important;
         border-radius: 4px !important;
         border: 1px solid transparent !important;
         transition: all 0.15s !important;
      }
      .wb-block-move:hover  { background: rgba(255,255,255,0.07) !important; color: #ccc !important; border-color: rgba(255,255,255,0.1) !important; }
      .wb-block-remove:hover { background: rgba(239,68,68,0.12) !important; color: #f87171 !important; border-color: rgba(239,68,68,0.3) !important; }

      /* -- Fix 4: Sidebar scroll --------------------------- */
      .wb-sidebar { overflow-y: auto !important; overscroll-behavior: contain; }

      /* -- Fix 5: Code copy button (editor + published) ---- */
      .wb-code-wrap { position: relative; }
      .wb-code-copy {
         position: absolute; top: 8px; right: 8px;
         background: rgba(255,255,255,0.08);
         border: 1px solid rgba(255,255,255,0.12);
         color: #aaa; padding: 4px 10px; border-radius: 4px;
         font-size: 11px; font-weight: 600; cursor: pointer;
         display: flex; align-items: center; gap: 5px;
         transition: all 0.15s;
      }
      .wb-code-copy:hover {
         background: var(--wb-accent-dim); color: var(--wb-accent);
         border-color: rgba(245,96,4,0.4);
      }

      /* -- Fix 6a: Reading-progress bar ------------------- */
      #wb-header { flex-direction: column; height: auto; min-height: var(--wb-header-h); }
      .wb-header-inner { flex: 1; width: 100%; }
      #wb-progress-wrap {
         width: 100%; height: 3px;
         background: rgba(255,255,255,0.05);
         overflow: hidden; flex-shrink: 0;
      }
      #wb-progress-fill {
         height: 100%; width: 0%;
         background: linear-gradient(90deg, var(--wb-accent), #ff9c44);
         transition: width 0.25s ease;
         border-radius: 0 2px 2px 0;
      }

      /* -- Fix 6b: Auto-save status indicator ------------- */
      .wb-autosave-status {
         font-size: 11px; color: #555;
         white-space: nowrap; display: flex;
         align-items: center; gap: 5px;
         transition: color 0.3s;
      }
      .wb-autosave-status .wb-as-dot {
         width: 6px; height: 6px; border-radius: 50%;
         background: currentColor; flex-shrink: 0;
      }
      .wb-autosave-status.saving { color: var(--wb-accent); }
      .wb-autosave-status.saved  { color: #22c55e; }
      .wb-autosave-status.saving .wb-as-dot {
         animation: wbDotBlink 0.7s infinite;
      }
      @keyframes wbDotBlink { 0%,100%{opacity:1;} 50%{opacity:0.15;} }

      /* -- Fix 2: Custom dark confirm/prompt modal --------- */
      #wb-modal-overlay {
         position: fixed; inset: 0; z-index: 99999;
         background: rgba(0,0,0,0.72);
         display: flex; align-items: center; justify-content: center;
         opacity: 0; pointer-events: none;
         transition: opacity 0.2s ease;
      }
      #wb-modal-overlay.wb-modal-visible { opacity: 1; pointer-events: all; }
      #wb-modal-box {
         background: #181818;
         border: 1px solid rgba(255,255,255,0.1);
         border-radius: 12px; padding: 30px 32px;
         max-width: 400px; width: 90%;
         box-shadow: 0 32px 80px rgba(0,0,0,0.7);
         transform: scale(0.94); transition: transform 0.2s ease;
      }
      #wb-modal-overlay.wb-modal-visible #wb-modal-box { transform: scale(1); }
      #wb-modal-icon  { font-size: 26px; margin-bottom: 12px; display:block; text-align:center; }
      #wb-modal-title { font-size: 16px; font-weight: 700; color: #fff; margin: 0 0 8px; text-align: center; }
      #wb-modal-body  { font-size: 13px; color: #999; text-align: center; line-height: 1.65; margin: 0 0 18px; }
      #wb-modal-input {
         display: none;
         width: 100%; background: rgba(255,255,255,0.05);
         border: 1px solid rgba(255,255,255,0.12); color: #ccc;
         padding: 9px 12px; border-radius: 6px; font-size: 13px;
         margin-bottom: 18px; box-sizing: border-box;
         font-family: inherit; transition: border-color 0.2s;
      }
      #wb-modal-input:focus { outline: none; border-color: var(--wb-accent); }
      .wb-modal-actions { display: flex; gap: 10px; justify-content: center; }
      .wb-modal-btn {
         padding: 9px 22px; border-radius: 6px;
         font-size: 13px; font-weight: 600;
         cursor: pointer; transition: all 0.18s;
         border: 1px solid transparent;
      }
      .wb-modal-cancel  { background: transparent; border-color: rgba(255,255,255,0.15); color: #888; }
      .wb-modal-cancel:hover  { border-color: rgba(255,255,255,0.3); color: #ccc; }
      .wb-modal-confirm { background: var(--wb-accent); border-color: var(--wb-accent); color: #fff; }
      .wb-modal-confirm:hover { background: #ff7722; border-color: #ff7722; }
      .wb-modal-danger  { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #f87171; }
      .wb-modal-danger:hover  { background: rgba(239,68,68,0.28); }

      /* -- Fix 8: Claude-style sidebar — expanded vs collapsed */
      /* The right sidebar has two states:
         Expanded  → full width, shows icon + label text
         Collapsed → icon-only strip (48 px wide), labels hidden
         The icon bar is always visible. Transition is smooth.    */
      :root { --wb-sidebar-collapsed-w: 48px; }

      /* Collapsed-sidebar grid tweak */
      .wb-main.wb-right-icon-only {
         grid-template-columns: var(--wb-toolbar-w) 1fr var(--wb-sidebar-collapsed-w);
      }

      /* Sidebar in icon-only mode */
      .wb-sidebar.wb-sidebar-icon-only {
         width: var(--wb-sidebar-collapsed-w);
         min-width: var(--wb-sidebar-collapsed-w);
         overflow: hidden;
         padding: 12px 4px;
      }
      /* Hide text content in icon-only mode */
      .wb-sidebar.wb-sidebar-icon-only .wb-sidebar-card,
      .wb-sidebar.wb-sidebar-icon-only .wb-field,
      .wb-sidebar.wb-sidebar-icon-only .wb-sidebar-publish-wrap { display: none; }
      /* Show only the icon-strip in icon-only mode */
      .wb-sidebar-icon-strip {
         display: none;
         flex-direction: column;
         align-items: center;
         gap: 8px;
         padding-top: 8px;
      }
      .wb-sidebar.wb-sidebar-icon-only .wb-sidebar-icon-strip { display: flex; }
      .wb-sidebar-icon-pill {
         width: 36px; height: 36px;
         background: rgba(255,255,255,0.04);
         border: 1px solid var(--wb-border);
         border-radius: 7px;
         display: flex; align-items: center; justify-content: center;
         color: var(--wb-text-muted);
         font-size: 14px;
         cursor: default;
         transition: all 0.15s;
         position: relative;
      }
      .wb-sidebar-icon-pill:hover { color: var(--wb-accent); border-color: rgba(245,96,4,0.4); background: var(--wb-accent-dim); }
      /* Tooltip for icon pills */
      .wb-sidebar-icon-pill::after {
         content: attr(data-tip);
         position: absolute; right: calc(100% + 8px); top: 50%;
         transform: translateY(-50%);
         background: #1a1a1a; color: #fff;
         font-size: 11px; font-weight: 600;
         white-space: nowrap; padding: 4px 10px;
         border-radius: 4px; border: 1px solid var(--wb-border);
         pointer-events: none; opacity: 0; transition: opacity 0.15s; z-index: 999;
      }
      .wb-sidebar-icon-pill:hover::after { opacity: 1; }

      /* Fix 9a: Table row/col delete buttons -------------- */
      .wb-table-row-del, .wb-table-col-del {
         display: inline-flex;
         align-items: center;
         justify-content: center;
         width: 20px; height: 20px;
         background: rgba(239,68,68,0.0);
         border: none;
         border-radius: 3px;
         color: #555;
         cursor: pointer;
         padding: 0;
         transition: all 0.15s;
         flex-shrink: 0;
         vertical-align: middle;
      }
      .wb-table-row-del:hover, .wb-table-col-del:hover {
         background: rgba(239,68,68,0.15);
         color: #f87171;
      }
      /* Wrapper cell that holds delete + header/cell content */
      .wb-th-wrap, .wb-td-wrap {
         display: flex;
         align-items: center;
         gap: 4px;
         min-width: 0;
      }
      .wb-th-wrap [contenteditable], .wb-td-wrap [contenteditable] {
         flex: 1;
         min-width: 0;
      }
      /* Delete row button lives at start of each body row's first cell */
      .wb-row-del-cell {
         width: 28px;
         padding: 6px 4px !important;
         border-right: 1px dashed rgba(255,255,255,0.06) !important;
         text-align: center;
         vertical-align: middle;
      }
      /* Del-col header cell */
      .wb-col-del-th {
         padding: 6px 4px !important;
         background: rgba(239,68,68,0.04) !important;
         border-bottom: 1px dashed rgba(239,68,68,0.2) !important;
         text-align: center;
         vertical-align: middle;
      }

      /* Fix 9b: List item delete icon -------------------- */
      .wb-li-wrap {
         display: flex;
         align-items: flex-start;
         gap: 6px;
         width: 100%;
      }
      .wb-li-wrap [contenteditable] {
         flex: 1;
         outline: none;
      }
      .wb-li-del {
         flex-shrink: 0;
         width: 20px; height: 20px;
         display: inline-flex;
         align-items: center;
         justify-content: center;
         background: none;
         border: none;
         color: #444;
         border-radius: 3px;
         cursor: pointer;
         padding: 0;
         margin-top: 3px;
         transition: all 0.15s;
      }
      .wb-li-del:hover { background: rgba(239,68,68,0.12); color: #f87171; }

      /* ======================================================
         #endregion BUG_FIXES_AND_FEATURES_CSS
         ====================================================== */

      /* ==========================================================================
         RESPONSIVE MEDIA QUERIES
         ========================================================================== */

      /* Tablet & Small Desktop (<= 1100px) */
      @media (max-width: 1100px) {
         .wb-main {
            display: block;
            width: 100%;
         }

         /* Convert Left Toolbar to Offcanvas Drawer */
         .wb-insert-toolbar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 280px !important;
            min-width: 0 !important;
            max-width: 85vw !important;
            height: 100vh !important;
            z-index: 1001 !important;
            transform: translateX(-105%) !important;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            background: #111111 !important;
            border-right: 1px solid var(--wb-border-light) !important;
            box-shadow: 10px 0 40px rgba(0,0,0,0.7) !important;
            padding: 16px !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            align-items: stretch !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 6px !important;
         }
         body.wb-left-drawer-open .wb-insert-toolbar {
            transform: translateX(0) !important;
         }

         /* Show drawer header in drawer mode */
         .wb-insert-toolbar .wb-drawer-header,
         .wb-sidebar .wb-drawer-header {
            display: flex !important;
         }
         .wb-toolbar-label {
            display: none !important;
         }

         /* Left toolbar button appearance in drawer mode */
         .wb-insert-btn {
            width: 100% !important;
            height: auto !important;
            min-height: 42px !important;
            padding: 10px 14px !important;
            border-radius: 6px !important;
            justify-content: flex-start !important;
            gap: 12px !important;
            font-size: 14px !important;
            color: #ccc !important;
            background: rgba(255,255,255,0.03) !important;
            border: 1px solid var(--wb-border) !important;
            margin-bottom: 2px !important;
            overflow: visible !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
         }
         .wb-insert-btn i {
            font-size: 16px !important;
            width: 20px !important;
            text-align: center !important;
            color: var(--wb-accent) !important;
            flex-shrink: 0 !important;
         }
         .wb-insert-btn .wb-btn-label {
            display: inline-block !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            color: #ddd !important;
            white-space: nowrap !important;
         }
         .wb-insert-btn::after {
            display: none !important; /* disable hover tooltips in drawer */
         }
         .wb-toolbar-divider {
            width: 100% !important;
            height: 1px !important;
            margin: 6px 0 !important;
         }

         /* Convert Right Sidebar to Offcanvas Drawer */
         .wb-sidebar {
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 320px !important;
            min-width: 0 !important;
            max-width: 90vw !important;
            height: 100vh !important;
            z-index: 1001 !important;
            transform: translateX(105%) !important;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            background: #111111 !important;
            border-left: 1px solid var(--wb-border-light) !important;
            box-shadow: -10px 0 40px rgba(0,0,0,0.7) !important;
            padding: 16px !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            display: block !important;
         }
         body.wb-right-drawer-open .wb-sidebar {
            transform: translateX(0) !important;
         }
         .wb-sidebar.wb-sidebar-icon-only {
            width: 320px !important;
            max-width: 90vw !important;
            padding: 16px !important;
         }
         .wb-sidebar.wb-sidebar-icon-only .wb-sidebar-card,
         .wb-sidebar.wb-sidebar-icon-only .wb-field,
         .wb-sidebar.wb-sidebar-icon-only .wb-sidebar-publish-wrap {
            display: block !important;
         }
         .wb-sidebar.wb-sidebar-icon-only .wb-sidebar-icon-strip {
            display: none !important;
         }

         /* Editor Area adjustments */
         .wb-editor-area {
            padding: 26px 20px 90px;
            max-width: 780px;
         }

         /* Floating Action Button */
         .wb-mobile-insert-fab {
            display: flex;
         }
      }

      /* Mobile Devices (<= 768px) */
      @media (max-width: 768px) {
         #wb-header {
            min-height: auto;
         }
         .wb-header-inner {
            padding: 6px 12px;
            gap: 6px;
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
         }
         .wb-header-inner::-webkit-scrollbar { display: none; }

         .wb-header-left {
            gap: 6px;
         }
         .wb-page-title {
            font-size: 13px;
            max-width: 130px;
         }
         .wb-status-badge {
            font-size: 9px;
            padding: 2px 6px;
         }
         .wb-header-actions {
            gap: 4px;
         }
         .wb-meta-stat-pill,
         .wb-word-count,
         #wb-reading-time,
         .wb-autosave-status .wb-as-label {
            display: none; /* keep dot for autosave */
         }
         .wb-btn {
            padding: 6px 10px;
            font-size: 12px;
            gap: 4px;
         }
         .wb-btn-label-text {
            display: none; /* Icon-only on mobile header */
         }
         .wb-btn-publish {
            padding: 6px 12px;
         }
         .wb-btn-publish .wb-btn-label-text {
            display: inline-block; /* Keep 'Publish' text */
         }

         .wb-editor-area {
            padding: 16px 12px 100px;
            max-width: 100%;
         }
         .wb-block {
            margin-bottom: 14px;
         }
         .wb-block-header {
            padding: 8px 12px;
         }
         .wb-block-body {
            padding: 12px;
         }
         .wb-heading-content {
            font-size: 20px;
         }
         .wb-image-dropzone {
            padding: 20px 12px;
         }
         .wb-image-dropzone i { font-size: 24px; }
         .wb-image-dropzone p { font-size: 12px; }

         /* Toast Centering */
         .wb-toast {
            left: 16px;
            right: 16px;
            bottom: 20px;
            max-width: calc(100% - 32px);
            margin: 0 auto;
            justify-content: center;
         }
      }

      /* Extra Small Mobile (<= 480px) */
      @media (max-width: 480px) {
         .wb-back-btn span {
            display: none; /* show arrow only */
         }
         .wb-back-btn {
            padding: 6px 8px;
         }
         .wb-page-title {
            max-width: 100px;
            font-size: 12px;
         }
         .wb-btn {
            padding: 5px 8px;
            font-size: 11px;
         }
         .wb-toggle-btn {
            width: 30px;
            height: 30px;
         }
         .wb-meta-inputs {
            min-width: 100%;
         }
         .wb-meta-row {
            gap: 10px;
         }
         .wb-editor-area {
            padding: 12px 8px 100px;
         }
      }
   </style>
</head>

<body class="aleric-dark">

<!-- Backdrop for mobile/tablet slide-over drawers -->
<div id="wb-backdrop" class="wb-backdrop"></div>

<!-- Floating Insert Button for Mobile -->
<button id="wb-mobile-insert-fab" class="wb-mobile-insert-fab" aria-label="Insert Element" title="Insert Element">
   <i class="fa-solid fa-plus"></i>
</button>

<!-- ============================================================
     STICKY TOP HEADER
     ============================================================ -->
<header id="wb-header">
   <div class="wb-header-inner">
      <!-- #region LEFT_SIDEBAR_TOGGLE_BTN -->
      <!-- Left: Toggle + Back + title + status -->
      <div class="wb-header-left">

         <!-- Toggle Insert Panel (panel-left icon) -->
         <button class="wb-toggle-btn" id="wb-left-toggle"
                 title="Toggle Insert Panel" aria-label="Toggle Insert Panel" aria-pressed="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
               <rect x="3" y="3" width="18" height="18" rx="2"/>
               <path d="M9 3v18"/>
            </svg>
         </button>
         <!-- #endregion LEFT_SIDEBAR_TOGGLE_BTN -->

         <a href="blog.html" class="wb-back-btn">
            <i class="fa-regular fa-arrow-left"></i> <span>Back</span>
         </a>
         <h1 class="wb-page-title is-placeholder" id="wb-dynamic-title">New Draft</h1>
         <span class="wb-status-badge" id="wb-status-badge">Draft</span>
      </div>

      <!-- Right: word count + action buttons -->
      <div class="wb-header-actions">
         <span class="wb-word-count" id="wb-word-count">0 words</span>
         <span class="wb-word-count" id="wb-reading-time">~0 min read</span>
         <button class="wb-btn wb-btn-draft wb-btn-icon-only" onclick="handleUndo()" title="Undo">
            <i class="fa-solid fa-rotate-left"></i>
         </button>
         <button class="wb-btn wb-btn-draft wb-btn-icon-only" onclick="handleRedo()" title="Redo">
            <i class="fa-solid fa-rotate-right"></i>
         </button>
         <button class="wb-btn wb-btn-draft" onclick="saveDraft()" title="Save Draft">
            <i class="fa-regular fa-floppy-disk"></i> <span class="wb-btn-label-text">Save Draft</span>
         </button>
         <button class="wb-btn wb-btn-draft" onclick="openDraftsModal()" title="View All Saved Drafts">
            <i class="fa-regular fa-folder-open"></i> <span class="wb-btn-label-text">Drafts</span>
         </button>
         <button class="wb-btn wb-btn-draft" onclick="discardDraft()" title="Discard Draft">
            <i class="fa-regular fa-trash"></i> <span class="wb-btn-label-text">Discard</span>
         </button>
         <button class="wb-btn wb-btn-preview" onclick="openPreview()" title="Preview">
            <i class="fa-regular fa-eye"></i> <span class="wb-btn-label-text">Preview</span>
         </button>
         <button class="wb-btn wb-btn-publish" onclick="publishPost()" title="Publish Post">
            <i class="fa-regular fa-rocket"></i> <span class="wb-btn-label-text">Publish</span>
         </button>

         <!-- #region RIGHT_SIDEBAR_TOGGLE_BTN -->
         <!-- Toggle Post Settings sidebar (gear icon) -->
         <button class="wb-toggle-btn" id="wb-right-toggle"
                 title="Toggle Post Settings" aria-label="Toggle Post Settings" aria-pressed="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
               <circle cx="12" cy="12" r="3"/>
               <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
                        a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
                        A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83
                        l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
                        A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83
                        l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
                        a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83
                        l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
                        a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
         </button>
         <!-- #endregion RIGHT_SIDEBAR_TOGGLE_BTN -->

      </div>
   </div>
</header>

<!-- Toast notification -->
<div class="wb-toast" id="wb-toast"></div>

<!-- ============================================================
     MAIN THREE-COLUMN LAYOUT
     ============================================================ -->
<div class="wb-main">

   <!-- ================================================================
        LEFT: VERTICAL INSERT TOOLBAR / MOBILE DRAWER
        ================================================================ -->
   <nav class="wb-insert-toolbar" id="wb-insert-toolbar" aria-label="Insert elements">
      <div class="wb-drawer-header">
         <span class="wb-drawer-title"><i class="fa-regular fa-plus"></i> Insert Elements</span>
         <button type="button" class="wb-drawer-close" id="wb-left-close" aria-label="Close Insert Drawer"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <span class="wb-toolbar-label">Insert</span>

      <!-- Core blocks -->
      <button class="wb-insert-btn" data-block="heading"    data-tooltip="Heading"    title="Heading">
         <i class="fa-regular fa-heading"></i>
         <span class="wb-btn-label">Heading</span>
      </button>
      <button class="wb-insert-btn" data-block="image"      data-tooltip="Image"       title="Featured Image">
         <i class="fa-regular fa-image"></i>
         <span class="wb-btn-label">Featured Image</span>
      </button>
      <button class="wb-insert-btn" data-block="paragraph"  data-tooltip="Paragraph"   title="Paragraph">
         <i class="fa-regular fa-paragraph"></i>
         <span class="wb-btn-label">Paragraph</span>
      </button>

      <div class="wb-toolbar-divider"></div>

      <!-- Extra blocks -->
      <button class="wb-insert-btn" data-block="blockquote" data-tooltip="Blockquote"  title="Blockquote">
         <i class="fa-regular fa-quote-left"></i>
         <span class="wb-btn-label">Blockquote</span>
      </button>
      <button class="wb-insert-btn" data-block="list"       data-tooltip="List"        title="List">
         <i class="fa-regular fa-list-ul"></i>
         <span class="wb-btn-label">Lists</span>
      </button>
      <button class="wb-insert-btn" data-block="code"       data-tooltip="Code"        title="Code Block">
         <i class="fa-regular fa-code"></i>
         <span class="wb-btn-label">Code Block</span>
      </button>
      <button class="wb-insert-btn" data-block="table"      data-tooltip="Table"       title="Data Table">
         <i class="fa-regular fa-table"></i>
         <span class="wb-btn-label">Data Table</span>
      </button>
      <button class="wb-insert-btn" data-block="divider"    data-tooltip="Divider"     title="Divider">
         <i class="fa-regular fa-minus"></i>
         <span class="wb-btn-label">Divider</span>
      </button>
      <button class="wb-insert-btn" data-block="math"    data-tooltip="Math"    title="Math">
         <i class="fa-regular fa-square-root-variable"></i>
         <span class="wb-btn-label">Math Formula</span>
      </button>
      <button class="wb-insert-btn" data-block="verse"   data-tooltip="Verse"   title="Verse">
         <i class="fa-regular fa-feather"></i>
         <span class="wb-btn-label">Verse / Poem</span>
      </button>
      <button class="wb-insert-btn" data-block="audio"   data-tooltip="Audio"   title="Audio">
         <i class="fa-regular fa-music"></i>
         <span class="wb-btn-label">Audio Player</span>
      </button>
      <button class="wb-insert-btn" data-block="file"    data-tooltip="File"    title="File">
         <i class="fa-regular fa-folder"></i>
         <span class="wb-btn-label">File Link</span>
      </button>
      <button class="wb-insert-btn" data-block="video"   data-tooltip="Video"   title="Video">
         <i class="fa-regular fa-video"></i>
         <span class="wb-btn-label">Video Embed</span>
      </button>
   </nav>

   <!-- ================================================================
        CENTRE: EDITOR AREA
        Default blocks: Heading, Featured Image, Meta, Tags, Paragraph
        Additional blocks are cloned from <template> elements below.
        ================================================================ -->
   <main class="wb-editor-area">
      <div id="wb-editor">

         <!-- DEFAULT BLOCK 1: Heading / Title -->
         <div class="wb-block" data-block-type="heading" id="block-heading-default">
            <div class="wb-block-header">
               <span class="wb-block-label">
                  <i class="fa-regular fa-heading"></i> Main Title
               </span>
            </div>
            <div class="wb-block-body">
               <div class="wb-heading-content" contenteditable="true" placeholder="Enter your post heading..."></div>
            </div>
         </div>

         <!-- DEFAULT BLOCK 2: Featured Image / Banner -->
         <div class="wb-block" data-block-type="image" id="block-image-default">
            <div class="wb-block-header">
               <span class="wb-block-label">
                  <i class="fa-regular fa-image"></i> Featured Image / Banner
               </span>
            </div>
            <div class="wb-block-body">
               <div class="wb-image-dropzone p-3" id="wb-image-dropzone-default">
                  <input type="file" accept="image/*" style="display:none;" class="wb-image-file-input">
                  <i class="fa-regular fa-cloud-arrow-up"></i>
                  <p>Drag &amp; drop image here, or click to browse</p>
                  <small>Recommended: 1200 × 630 px &nbsp;·&nbsp; JPG, PNG, WebP</small>
                  <img class="wb-image-preview" alt="Featured image preview">
               </div>
               <div class="wb-image-caption-input">
                  <input class="wb-input wb-input-sm wb-image-caption" type="text" placeholder="Image caption (optional)">
               </div>
            </div>
         </div>

         <!-- DEFAULT BLOCK 3: Author Meta Info -->
         <div class="wb-block" data-block-type="meta" id="block-meta-default">
            <div class="wb-block-header">
               <span class="wb-block-label">
                  <i class="fa-regular fa-user"></i> Author Meta Info
               </span>
            </div>
            <div class="wb-block-body">
               <div class="wb-meta-row">
                  <div class="wb-meta-avatar" id="meta-avatar-default">--</div>
                  <div class="wb-meta-inputs">
                     <input class="wb-input" type="text"  placeholder="Author Name"              style="flex:1; min-width:140px;" data-meta="author">
                     <input class="wb-input" type="text"  placeholder="Reading time (auto)"      style="flex:1; min-width:140px;" data-meta="readtime" readonly>
                  </div>
               </div>
            </div>
         </div>

         <!-- DEFAULT BLOCK 4: Key phrase -->
         <div class="wb-block" data-block-type="tags" id="block-tags-default">
            <div class="wb-block-header">
               <span class="wb-block-label">
                  <i class="fa-regular fa-tags"></i> Tags
               </span>
            </div>
            <div class="wb-block-body">
               <div class="wb-tags-container" data-tags-container></div>
               <div class="wb-tags-add-row">
                  <input class="wb-input" type="text" placeholder="Type a tag and press Enter or click Add..." data-tag-input>
                  <button class="wb-action-btn" data-action="add-tag">Add</button>
               </div>
            </div>
         </div>

         <!-- DEFAULT BLOCK 5: Paragraph -->
         <div class="wb-block" data-block-type="paragraph" id="block-paragraph-default">
            <div class="wb-block-header">
               <span class="wb-block-label">
                  <i class="fa-regular fa-paragraph"></i> Paragraph
               </span>
            </div>

            <div class="wb-block-body">

               <!-- Formatting toolbar -->
               <div class="wb-format-toolbar">

                  <!-- Text Style -->
                  <button class="wb-format-btn" data-command="bold" title="Bold">
                     <i class="fa-solid fa-bold"></i>
                  </button>
                  <button class="wb-format-btn" data-command="italic" title="Italic">
                     <i class="fa-solid fa-italic"></i>
                  </button>
                  <button class="wb-format-btn" data-command="underline" title="Underline">
                     <i class="fa-solid fa-underline"></i>
                  </button>
                  <button class="wb-format-btn" data-command="strikethrough" title="Strikethrough">
                     <i class="fa-solid fa-strikethrough"></i>
                  </button>

                  <!-- Alignment -->
                  <button class="wb-format-btn" data-command="justifyLeft" title="Align Left">
                     <i class="fa-solid fa-align-left"></i>
                  </button>
                  <button class="wb-format-btn" data-command="justifyCenter" title="Align Center">
                     <i class="fa-solid fa-align-center"></i>
                  </button>
                  <button class="wb-format-btn" data-command="justifyRight" title="Align Right">
                     <i class="fa-solid fa-align-right"></i>
                  </button>
                  <button class="wb-format-btn" data-command="justifyFull" title="Justify">
                     <i class="fa-solid fa-align-justify"></i>
                  </button>

                  <!-- Indent -->
                  <button class="wb-format-btn" data-command="outdent" title="Decrease Indent">
                     <i class="fa-solid fa-outdent"></i>
                  </button>
                  <button class="wb-format-btn" data-command="indent" title="Increase Indent">
                     <i class="fa-solid fa-indent"></i>
                  </button>

                  <!-- Link -->
                  <button class="wb-format-btn" data-command="createLink" title="Insert Link">
                     <i class="fa-solid fa-link"></i>
                  </button>
                  <button class="wb-format-btn" data-command="unlink" title="Remove Link">
                     <i class="fa-solid fa-link-slash"></i>
                  </button>

                  <!-- Extra -->
                  <button class="wb-format-btn" data-command="removeFormat" title="Clear Formatting">
                     <i class="fa-solid fa-eraser"></i>
                  </button>
                  <button class="wb-format-btn" data-command="undo" title="Undo">
                     <i class="fa-solid fa-rotate-left"></i>
                  </button>
                  <button class="wb-format-btn" data-command="redo" title="Redo">
                     <i class="fa-solid fa-rotate-right"></i>
                  </button>
                  <label class="wb-format-btn" title="Text Color" style="position: relative; overflow: hidden;">
                     <i class="fa-solid fa-palette"></i>
                     <input 
                        type="color" 
                        data-command="foreColor"
                        style="position: absolute; inset: 0; opacity: 0; cursor: pointer;"
                     >
                  </label>
                  <button class="wb-format-btn" data-command="insertText" title="Paste as Text">
                     <i class="fa-solid fa-paste"></i>
                  </button>
               </div>

               <!-- Content -->
               <div class="wb-paragraph-content" contenteditable="true" placeholder="Write your paragraph here..." style="text-align:justify;"></div>

            </div>
         </div>

      </div><!-- END #wb-editor -->
   </main>

   <!-- ================================================================
        RIGHT: SETTINGS SIDEBAR / MOBILE DRAWER
        ================================================================ -->
   <aside class="wb-sidebar" id="wb-sidebar">
      <div class="wb-drawer-header">
         <span class="wb-drawer-title"><i class="fa-regular fa-gear"></i> Post Settings</span>
         <button type="button" class="wb-drawer-close" id="wb-right-close" aria-label="Close Settings Drawer"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <!-- #region SIDEBAR_ICON_STRIP (Fix 8: Claude-style collapsed icon bar) -->
      <div class="wb-sidebar-icon-strip">
         <div class="wb-sidebar-icon-pill" data-tip="Post Settings"><i class="fa-regular fa-gear"></i></div>
         <div class="wb-sidebar-icon-pill" data-tip="Categories"><i class="fa-regular fa-folder"></i></div>
         <div class="wb-sidebar-icon-pill" data-tip="SEO"><i class="fa-regular fa-magnifying-glass"></i></div>
         <div class="wb-sidebar-icon-pill" data-tip="Publish"><i class="fa-regular fa-rocket"></i></div>
      </div>
      <!-- #endregion SIDEBAR_ICON_STRIP -->

      <!-- Post Settings -->
      <div class="wb-sidebar-card">
         <h3 class="wb-sidebar-card-title">
            <i class="fa-regular fa-gear"></i> Post Settings
         </h3>
         <div class="wb-field">
            <label class="wb-field-label">Status</label>
            <select class="wb-input" id="wb-post-status">
               <option value="draft">Draft</option>
               <option value="review">Under Review</option>
               <option value="published">Published</option>
            </select>
         </div>
         <div class="wb-field">
            <label class="wb-field-label">Slug / URL</label>
            <input class="wb-input" type="text" id="wb-slug" placeholder="my-blog-post-url">
         </div>
         <div class="wb-field">
            <label class="wb-field-label">Publish Date</label>
            <input class="wb-input" type="date" id="wb-publish-date" value="<?= $today ?>" readonly>
         </div>
         <div class="wb-field">
            <label class="wb-field-label">Excerpt</label>
            <textarea class="wb-input" id="wb-excerpt" placeholder="Short description for listing pages..."></textarea>
         </div>
         <!-- <div class="wb-field">
            <div class="wb-schedule-row">
               <input type="checkbox" id="wb-schedule-check">
               <label for="wb-schedule-check">Schedule publish</label>
            </div>
            <input class="wb-input" type="datetime-local" id="wb-schedule-date" style="display:none;">
         </div> -->
      </div>

      <!-- Categories -->
      <div class="wb-sidebar-card">
         <h3 class="wb-sidebar-card-title">
            <i class="fa-regular fa-folder"></i> Categories
         </h3>
         <ul class="wb-category-list">
            <li><label><input type="checkbox" class="wb-hero-category" value="Technology"> Technology</label></li>
            <li><label><input type="checkbox" class="wb-hero-category" value="Web Development"> Web Development</label></li>
            <li><label><input type="checkbox" class="wb-hero-category" value="Design"> Design</label></li>
            <li><label><input type="checkbox" class="wb-hero-category" value="Marketing"> Marketing</label></li>
            <li><label><input type="checkbox" class="wb-hero-category" value="Tutorial"> Tutorial</label></li>
            <li><label><input type="checkbox" class="wb-hero-category" value="Business"> Business</label></li>
            <li><label><input type="checkbox" class="wb-hero-category" value="SEO"> SEO</label></li>
            <li><label><input type="checkbox" class="wb-hero-category" value="Branding"> Branding</label></li>
         </ul>
         <div style="display:flex; gap:8px; margin-top:12px;">
            <input type="text" id="wb-new-category" class="wb-input wb-input-sm" placeholder="New Category">
            <button type="button" class="wb-action-btn" onclick="addNewCategory()">Add</button>
         </div>
      </div>

      <!-- SEO -->
      <div class="wb-sidebar-card">
         <h3 class="wb-sidebar-card-title">
            <i class="fa-regular fa-magnifying-glass"></i> SEO
         </h3>
         <div class="wb-field">
            <label class="wb-field-label">Meta Title</label>
            <input class="wb-input" type="text" id="wb-meta-title" placeholder="SEO page title...">
         </div>
         <div class="wb-field">
            <label class="wb-field-label">Meta Description</label>
            <textarea class="wb-input" id="wb-meta-desc" placeholder="150–160 characters..."></textarea>
            <div class="wb-meta-char-count" id="wb-meta-desc-count">0 / 160</div>
         </div>
         <div class="wb-field">
            <label class="wb-field-label">Focus Keyword</label>
            <input class="wb-input" type="text" id="wb-focus-keyword" placeholder="Primary keyword...">
         </div>
      </div>

      <!-- Publish Buttons -->
      <div class="wb-sidebar-card" style="text-align:center;">
         <div class="wb-sidebar-publish-wrap">
            <button class="wb-btn wb-btn-publish wb-btn-full" onclick="publishPost()">
               <i class="fa-regular fa-rocket"></i> Publish Post
            </button>
            <button class="wb-btn wb-btn-draft wb-btn-full" onclick="saveDraft()">
               <i class="fa-regular fa-floppy-disk"></i> Save as Draft
            </button>
         </div>
      </div>

   </aside>
</div><!-- END .wb-main -->

<!-- ============================================================
     BLOCK TEMPLATES
     These are hidden <template> elements. When a toolbar button
     is clicked, the matching template is cloned and appended
     to #wb-editor. Each template has a unique ID: tpl-{block}.
     ============================================================ -->

<!-- Template: Heading -->
<template id="tpl-heading">
   <div class="wb-block" data-block-type="heading">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-heading"></i> Heading</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <div class="wb-heading-level-row">
            <span class="wb-label-sm">Level:</span>
            <select class="wb-select heading-level" style="max-width:160px;">
               <option value="h2" selected>Section Heading - H2</option>
               <option value="h3">Sub-section Heading - H3</option>
            </select>
         </div>
         <div class="wb-heading-content" contenteditable="true" placeholder="Enter your heading..."></div>
      </div>
   </div>
</template>

<!-- Template: Image -->
<template id="tpl-image">
   <div class="wb-block" data-block-type="image">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-image"></i>Image</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <div class="wb-image-dropzone p-3">
            <input type="file" accept="image/*" style="display:none;" class="wb-image-file-input">
            <i class="fa-regular fa-cloud-arrow-up"></i>
            <p>Drag &amp; drop image here, or click to browse</p>
            <small>Recommended: 1200 × 630 px &nbsp;·&nbsp; JPG, PNG, WebP</small>
            <img class="wb-image-preview" alt="Image preview">
         </div>
         <div class="wb-image-caption-input">
            <input class="wb-input wb-input-sm wb-image-caption" type="text" placeholder="Image caption (optional)">
         </div>
      </div>
   </div>
</template>

<!-- Template: Paragraph -->
<template id="tpl-paragraph">
   <div class="wb-block" data-block-type="paragraph">
      <div class="wb-block-header">
         <span class="wb-block-label">
            <i class="fa-regular fa-paragraph"></i> Paragraph
         </span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>

      <div class="wb-block-body">

         <!-- FORMAT TOOLBAR -->
         <div class="wb-format-toolbar">

            <!-- Text Style -->
            <button class="wb-format-btn" data-command="bold" title="Bold">
               <i class="fa-solid fa-bold"></i>
            </button>
            <button class="wb-format-btn" data-command="italic" title="Italic">
               <i class="fa-solid fa-italic"></i>
            </button>
            <button class="wb-format-btn" data-command="underline" title="Underline">
               <i class="fa-solid fa-underline"></i>
            </button>
            <button class="wb-format-btn" data-command="strikethrough" title="Strikethrough">
               <i class="fa-solid fa-strikethrough"></i>
            </button>

            <!-- Alignment -->
            <button class="wb-format-btn" data-command="justifyLeft" title="Align Left">
               <i class="fa-solid fa-align-left"></i>
            </button>
            <button class="wb-format-btn" data-command="justifyCenter" title="Align Center">
               <i class="fa-solid fa-align-center"></i>
            </button>
            <button class="wb-format-btn" data-command="justifyRight" title="Align Right">
               <i class="fa-solid fa-align-right"></i>
            </button>
            <button class="wb-format-btn" data-command="justifyFull" title="Justify">
               <i class="fa-solid fa-align-justify"></i>
            </button>

            <!-- Indent -->
            <button class="wb-format-btn" data-command="outdent" title="Decrease Indent">
               <i class="fa-solid fa-outdent"></i>
            </button>
            <button class="wb-format-btn" data-command="indent" title="Increase Indent">
               <i class="fa-solid fa-indent"></i>
            </button>

            <!-- Link -->
            <button class="wb-format-btn" data-command="createLink" title="Insert Link">
               <i class="fa-solid fa-link"></i>
            </button>
            <button class="wb-format-btn" data-command="unlink" title="Remove Link">
               <i class="fa-solid fa-link-slash"></i>
            </button>

            <!-- Extra -->
            <button class="wb-format-btn" data-command="removeFormat" title="Clear Formatting">
               <i class="fa-solid fa-eraser"></i>
            </button>
            <button class="wb-format-btn" data-command="undo" title="Undo">
               <i class="fa-solid fa-rotate-left"></i>
            </button>
            <button class="wb-format-btn" data-command="redo" title="Redo">
               <i class="fa-solid fa-rotate-right"></i>
            </button>
            <label class="wb-format-btn" title="Text Color" style="position: relative; overflow: hidden;">
               <i class="fa-solid fa-palette"></i>
               <input 
                  type="color" 
                  data-command="foreColor"
                  style="position: absolute; inset: 0; opacity: 0; cursor: pointer;"
               >
            </label>
            <button class="wb-format-btn" data-command="insertText" title="Paste as Text">
               <i class="fa-solid fa-paste"></i>
            </button>
         </div>

         <!-- CONTENT AREA -->
         <div class="wb-paragraph-content" contenteditable="true" placeholder="Write your paragraph here..." style="text-align:justify;"></div>

      </div>
   </div>
</template>

<!-- Template: Blockquote -->
<template id="tpl-blockquote">
   <div class="wb-block" data-block-type="blockquote">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-quote-left"></i> Blockquote</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <blockquote contenteditable="true" placeholder="Enter your quote..." style="border-left:3px solid var(--wb-accent);padding:12px 20px;margin:0;font-size:17px;font-style:italic;color:#bbb;background:rgba(245,96,4,0.05);border-radius:0 6px 6px 0;"></blockquote>
      </div>
   </div>
</template>

<!-- #region LIST_TEMPLATE (Fix 9b: per-item delete icon) -->
<!-- Template: Lists -->
<template id="tpl-list">
   <div class="wb-block" data-block-type="list">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-list-ul"></i> Lists</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <!-- Bullet List -->
         <div class="wb-list-section">
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;">
               <input type="checkbox" class="wb-ul-enabled" checked>
               <span class="wb-label-sm">Bullet List</span>
            </label>
            <ul style="list-style:none;padding-left:0;margin-bottom:12px;" class="wb-editable-ul">
               <li style="margin-bottom:6px;list-style:none;">
                  <div class="wb-li-wrap">
                     <span style="color:#666;margin-top:2px;">&#x2022;</span>
                     <span contenteditable="true" style="color:#ccc;">List item 1</span>
                     <button class="wb-li-del" data-action="del-li" title="Delete item">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>
                     </button>
                  </div>
               </li>
            </ul>
            <button class="wb-action-btn" data-action="add-ul-item" style="margin-bottom:20px;">+ Add Bullet Item</button>
         </div>

         <!-- Numbered List -->
         <div class="wb-list-section">
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;">
               <input type="checkbox" class="wb-ol-enabled">
               <span class="wb-label-sm">Numbered List</span>
            </label>
            <ol style="list-style:none;padding-left:0;margin-bottom:12px;counter-reset:wb-ol-counter;" class="wb-editable-ol">
               <li style="margin-bottom:6px;list-style:none;counter-increment:wb-ol-counter;">
                  <div class="wb-li-wrap">
                     <span class="wb-ol-num" style="color:#f56004;font-weight:700;font-size:13px;margin-top:1px;min-width:18px;">1.</span>
                     <span contenteditable="true" style="color:#ccc;">Step 1</span>
                     <button class="wb-li-del" data-action="del-li" title="Delete item">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>
                     </button>
                  </div>
               </li>
            </ol>
            <button class="wb-action-btn" data-action="add-ol-item">+ Add Numbered Item</button>
         </div>
      </div>
   </div>
</template>
<!-- #endregion LIST_TEMPLATE -->

<!-- Template: Code Block -->
<template id="tpl-code">
   <div class="wb-block" data-block-type="code">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-code"></i> Code Block</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <div style="display:flex;gap:10px;margin-bottom:10px;">
            <select class="wb-input wb-code-lang" style="max-width:150px;">
               <option value="">Plain text</option>
               <option value="html">HTML</option>
               <option value="css">CSS</option>
               <option value="javascript">JavaScript</option>
               <option value="php">PHP</option>
               <option value="python">Python</option>
               <option value="bash">Bash</option>
               <option value="sql">SQL</option>
            </select>
            <input class="wb-input wb-inline-code" type="text" placeholder="Inline code (optional)">
         </div>
         <textarea class="wb-input wb-code-textarea" placeholder="Paste your block code here..." style="min-height:120px;font-family:'Courier New',monospace;font-size:13px;"></textarea>
         <button class="wb-action-btn" data-action="copy-code" style="margin-top:8px;">
            <i class="fa-regular fa-copy"></i> Copy Code
         </button>
      </div>
   </div>
</template>

<!-- #region TABLE_TEMPLATE (Fix 9a: delete row / col icons) -->
<!-- Template: Data Table -->
<template id="tpl-table">
   <div class="wb-block" data-block-type="table">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-table"></i> Data Table</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <div style="overflow-x:auto;">
            <table class="wb-editable-table" style="width:100%;border-collapse:collapse;font-size:13px;">
               <thead>
                  <tr>
                     <!-- First header = empty del-col header (del-row control corner) -->
                     <th class="wb-col-del-th" style="width:28px;background:rgba(239,68,68,0.04);border:1px solid var(--wb-border);"></th>
                     <th style="padding:10px 14px;background:rgba(245,96,4,0.1);color:#f56004;border:1px solid var(--wb-border);outline:none;">
                        <div class="wb-th-wrap">
                           <span contenteditable="true">Column 1</span>
                           <button class="wb-table-col-del" data-action="del-table-col" title="Delete this column">
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                           </button>
                        </div>
                     </th>
                     <th style="padding:10px 14px;background:rgba(245,96,4,0.1);color:#f56004;border:1px solid var(--wb-border);outline:none;">
                        <div class="wb-th-wrap">
                           <span contenteditable="true">Column 2</span>
                           <button class="wb-table-col-del" data-action="del-table-col" title="Delete this column">
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                           </button>
                        </div>
                     </th>
                     <th style="padding:10px 14px;background:rgba(245,96,4,0.1);color:#f56004;border:1px solid var(--wb-border);outline:none;">
                        <div class="wb-th-wrap">
                           <span contenteditable="true">Column 3</span>
                           <button class="wb-table-col-del" data-action="del-table-col" title="Delete this column">
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                           </button>
                        </div>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <!-- Row delete cell -->
                     <td class="wb-row-del-cell" style="border:1px solid var(--wb-border);">
                        <button class="wb-table-row-del" data-action="del-table-row" title="Delete this row">
                           <svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                        </button>
                     </td>
                     <td contenteditable="true" style="padding:10px 14px;border:1px solid var(--wb-border);color:#ccc;outline:none;">Cell 1</td>
                     <td contenteditable="true" style="padding:10px 14px;border:1px solid var(--wb-border);color:#ccc;outline:none;">Cell 2</td>
                     <td contenteditable="true" style="padding:10px 14px;border:1px solid var(--wb-border);color:#ccc;outline:none;">Cell 3</td>
                  </tr>
               </tbody>
            </table>
         </div>
         <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
            <button class="wb-action-btn" data-action="add-table-row">+ Add Row</button>
            <button class="wb-action-btn" data-action="add-table-col">+ Add Column</button>
         </div>
      </div>
   </div>
</template>
<!-- #endregion TABLE_TEMPLATE -->

<!-- Template: Divider -->
<template id="tpl-divider">
   <div class="wb-block" data-block-type="divider">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-minus"></i> Divider</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:6px 0;">
      </div>
   </div>
</template>

<!-- Template: Math -->
<template id="tpl-math">
   <div class="wb-block" data-block-type="math">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-square-root-variable"></i> Math</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <input class="wb-input" type="text" placeholder="e.g.  E = mc²">
      </div>
   </div>
</template>

<!-- Template: Verse -->
<template id="tpl-verse">
   <div class="wb-block" data-block-type="verse">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-feather"></i> Verse</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <div contenteditable="true" placeholder="Write your verse or poem..." style="font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:2;color:#ccc;white-space:pre-wrap;outline:none;min-height:80px;"></div>
      </div>
   </div>
</template>

<!-- Template: Audio -->
<template id="tpl-audio">
   <div class="wb-block" data-block-type="audio">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-music"></i> Audio</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <input type="file" accept="audio/*" class="wb-input wb-audio-file">
      </div>
   </div>
</template>

<!-- Template: File -->
<template id="tpl-file">
   <div class="wb-block" data-block-type="file">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-folder"></i> File</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <input class="wb-input" type="text" placeholder="Button label (e.g. Download PDF)" style="flex:1;min-width:160px;">
            <input class="wb-input" type="url"  placeholder="File URL" style="flex:1;min-width:160px;">
         </div>
      </div>
   </div>
</template>

<!-- Template: Video -->
<template id="tpl-video">
   <div class="wb-block" data-block-type="video">
      <div class="wb-block-header">
         <span class="wb-block-label"><i class="fa-regular fa-video"></i> Video</span>
         <div class="wb-block-controls">
            <button class="wb-block-move" data-action="move-up" title="Move Up"><i class="fa fa-arrow-up"></i></button>
            <button class="wb-block-move" data-action="move-down" title="Move Down"><i class="fa fa-arrow-down"></i></button>
            <button class="wb-block-remove" data-action="remove" title="Remove block"><i class="fa fa-times"></i></button>
         </div>
      </div>
      <div class="wb-block-body">
         <input class="wb-input" type="url" placeholder="YouTube / Vimeo URL or direct video link" style="margin-bottom:10px;">
      </div>
   </div>
</template>

<!-- ============================================================
     jQuery (project dependency)
     ============================================================ -->
<script src="js/jquery.js"></script>

<!-- ============================================================
     BLOG EDITOR CORE SCRIPT
     All logic is inside an IIFE to avoid global variable leaks.
     ============================================================ -->
<script>
window.INITIAL_EDIT_POST = <?php echo json_encode($editPostData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE); ?>;
window.currentPostId = (window.INITIAL_EDIT_POST && window.INITIAL_EDIT_POST.id) ? window.INITIAL_EDIT_POST.id : null;

(function () {
   'use strict';

   // ==========================================================================
   // #region SECTION_01_UTILITY_HELPERS
   // Toast notifications, editor history state, word-count tracker,
   // auto-save, reading-progress bar, and all shared helper state.
   // ==========================================================================

   /** Show a toast notification at the bottom-right of the screen */
   function showToast(msg, type) {
         type = type || 'success';
         var t = document.getElementById('wb-toast');
         t.textContent = msg; 
         t.className   = 'wb-toast show ' + type;
         setTimeout(function () { t.className = 'wb-toast'; }, 3500);
      }

   // ==========================================================================
   // #region HISTORY_SYSTEM (UNDO / REDO)
   // ==========================================================================
   // #region HISTORY_SYSTEM (UNDO / REDO)
   // ==========================================================================
   var editorHistory = [];
   var historyIndex = -1;
   var isHistoryAction = false;
   var historyDebounceTimer = null;

   function takeEditorSnapshot() {
      var editorEl = document.getElementById('wb-editor');
      if (!editorEl) return null;

      // Sync all inputs and textareas into the DOM so element attributes are preserved
      editorEl.querySelectorAll('input').forEach(function(inp) {
         if (inp.type !== 'file') {
            inp.setAttribute('value', inp.value);
         }
      });
      editorEl.querySelectorAll('textarea').forEach(function(ta) {
         ta.textContent = ta.value;
      });
      editorEl.querySelectorAll('select').forEach(function(sel) {
         Array.from(sel.options).forEach(function(opt) {
            if (opt.value === sel.value) opt.setAttribute('selected', 'selected');
            else opt.removeAttribute('selected');
         });
      });

      var blocksData = typeof serializeEditorBlocks === 'function' ? serializeEditorBlocks() : [];

      return {
         blocks: blocksData,
         slug: document.getElementById('wb-slug')?.value || '',
         excerpt: document.getElementById('wb-excerpt')?.value || '',
         metaTitle: document.getElementById('wb-meta-title')?.value || '',
         metaDesc: document.getElementById('wb-meta-desc')?.value || '',
         focusKeyword: document.getElementById('wb-focus-keyword')?.value || '',
         author: document.querySelector('#block-meta-default [data-meta="author"]')?.value || '',
         readingTime: document.querySelector('#block-meta-default [data-meta="readtime"]')?.value || '',
         tags: typeof getTagsFromEditor === 'function' ? getTagsFromEditor() : [],
         categories: Array.from(document.querySelectorAll('.wb-category-list input:checked')).map(function(c) { return c.value; })
      };
   }

   function pushHistorySnapshot() {
      if (isHistoryAction) return;
      var snap = takeEditorSnapshot();
      if (!snap || !snap.blocks || !snap.blocks.length) return;

      var snapJson = JSON.stringify({
         blocks: snap.blocks,
         slug: snap.slug,
         excerpt: snap.excerpt,
         metaTitle: snap.metaTitle,
         metaDesc: snap.metaDesc,
         focusKeyword: snap.focusKeyword,
         author: snap.author,
         readingTime: snap.readingTime,
         tags: snap.tags,
         categories: snap.categories
      });

      if (historyIndex >= 0 && editorHistory && editorHistory[historyIndex] && editorHistory[historyIndex]._hash === snapJson) {
         return;
      }

      snap._hash = snapJson;

      if (!Array.isArray(editorHistory)) editorHistory = [];
      editorHistory = editorHistory.slice(0, historyIndex + 1);
      editorHistory.push(snap);
      if (editorHistory.length > 60) {
         editorHistory.shift();
      }
      historyIndex = editorHistory.length - 1;
   }

   function debouncePushHistory() {
      if (isHistoryAction) return;
      clearTimeout(historyDebounceTimer);
      historyDebounceTimer = setTimeout(function () {
         if (!isHistoryAction) pushHistorySnapshot();
      }, 350);
   }

   function restoreFromHistory(snap) {
      if (!snap) return;
      clearTimeout(historyDebounceTimer);
      isHistoryAction = true;
      try {
         if (snap.blocks && Array.isArray(snap.blocks) && snap.blocks.length && typeof deserializeEditorBlocks === 'function') {
            deserializeEditorBlocks(snap.blocks);
         }

         if (snap.slug !== undefined) {
            var s = document.getElementById('wb-slug');
            if (s) s.value = snap.slug;
         }
         if (snap.excerpt !== undefined) {
            var e = document.getElementById('wb-excerpt');
            if (e) e.value = snap.excerpt;
         }
         if (snap.metaTitle !== undefined) {
            var mt = document.getElementById('wb-meta-title');
            if (mt) mt.value = snap.metaTitle;
         }
         if (snap.metaDesc !== undefined) {
            var md = document.getElementById('wb-meta-desc');
            if (md) md.value = snap.metaDesc;
         }
         if (snap.focusKeyword !== undefined) {
            var fk = document.getElementById('wb-focus-keyword');
            if (fk) fk.value = snap.focusKeyword;
         }
         if (snap.author !== undefined) {
            var a = document.querySelector('#block-meta-default [data-meta="author"]');
            if (a) a.value = snap.author;
         }
         if (snap.readingTime !== undefined) {
            var rt = document.querySelector('#block-meta-default [data-meta="readtime"]');
            if (rt) rt.value = snap.readingTime;
         }
         if (snap.tags && typeof setTagsInEditor === 'function') {
            setTagsInEditor(snap.tags);
         }
         if (snap.categories) {
            document.querySelectorAll('.wb-category-list input').forEach(function(cb) {
               cb.checked = snap.categories.includes(cb.value);
            });
         }
         var headingBlock = document.querySelector('#block-heading-default .wb-heading-content');
         var dynamicTitle = document.getElementById('wb-dynamic-title');
         if (dynamicTitle && headingBlock) {
            var text = headingBlock.innerText.trim();
            dynamicTitle.textContent = text || 'New Draft';
            dynamicTitle.classList.toggle('is-placeholder', !text);
         }
         if (typeof updateWordCount === 'function') updateWordCount();
      } catch (err) {
         console.error('History restoration error:', err);
      } finally {
         clearTimeout(historyDebounceTimer);
         setTimeout(function() { 
            isHistoryAction = false; 
            clearTimeout(historyDebounceTimer);
         }, 300);
      }
   }

   // UNDO Handler
   window.handleUndo = function () {
      clearTimeout(historyDebounceTimer);
      if (historyIndex <= 0) {
         showToast('Nothing to undo', 'error');
         return;
      }
      historyIndex--;
      restoreFromHistory(editorHistory[historyIndex]);
      showToast('Undone (Reverted change)');
   };

   // REDO Handler
   window.handleRedo = function () {
      clearTimeout(historyDebounceTimer);
      if (historyIndex >= editorHistory.length - 1) {
         showToast('Nothing to redo', 'error');
         return;
      }
      historyIndex++;
      restoreFromHistory(editorHistory[historyIndex]);
      showToast('Redone');
   };
   // #endregion HISTORY_SYSTEM

   // ======================================================
   // #region FIX2_MODAL_SYSTEM
   // wbConfirm / wbPrompt replace native alert/confirm/prompt
   // with a centered, dark, premium modal. All modal state is
   // managed here — no global leakage.
   // ======================================================

   (function buildModalDOM() {
      var overlay = document.createElement('div');
      overlay.id  = 'wb-modal-overlay';
      overlay.innerHTML = [
         '<div id="wb-modal-box">',
         '  <span id="wb-modal-icon"></span>',
         '  <p id="wb-modal-title"></p>',
         '  <p id="wb-modal-body"></p>',
         '  <input id="wb-modal-input" type="text">',
         '  <div class="wb-modal-actions">',
         '    <button class="wb-modal-btn wb-modal-cancel" id="wb-modal-cancel">Cancel</button>',
         '    <button class="wb-modal-btn wb-modal-confirm" id="wb-modal-ok">OK</button>',
         '  </div>',
         '</div>'
      ].join('');
      document.body.appendChild(overlay);
   })();

   var _modalCallback = null;

   function _showModal(icon, title, body, okLabel, okClass, showInput, inputPlaceholder) {
      document.getElementById('wb-modal-icon').textContent  = icon  || '';
      document.getElementById('wb-modal-title').textContent = title || '';
      document.getElementById('wb-modal-body').textContent  = body  || '';
      var okBtn = document.getElementById('wb-modal-ok');
      okBtn.textContent = okLabel || 'OK';
      okBtn.className   = 'wb-modal-btn wb-modal-confirm ' + (okClass || '');
      var inp = document.getElementById('wb-modal-input');
      if (showInput) {
         inp.style.display = 'block';
         inp.placeholder   = inputPlaceholder || '';
         inp.value         = '';
         setTimeout(function() { inp.focus(); }, 80);
      } else {
         inp.style.display = 'none';
      }
      document.getElementById('wb-modal-overlay').classList.add('wb-modal-visible');
   }

   function _closeModal() {
      document.getElementById('wb-modal-overlay').classList.remove('wb-modal-visible');
      _modalCallback = null;
   }

   document.addEventListener('click', function(e) {
      var okBtn  = document.getElementById('wb-modal-ok');
      var cancel = document.getElementById('wb-modal-cancel');
      if (e.target === okBtn) {
         var val = document.getElementById('wb-modal-input').value;
         var cb  = _modalCallback;
         _closeModal();
         if (typeof cb === 'function') cb(val);
      } else if (e.target === cancel || e.target.id === 'wb-modal-overlay') {
         _closeModal();
      }
   });

   document.addEventListener('keydown', function(e) {
      var overlay = document.getElementById('wb-modal-overlay');
      if (!overlay.classList.contains('wb-modal-visible')) return;
      if (e.key === 'Escape') { _closeModal(); }
      if (e.key === 'Enter') {
         var val = document.getElementById('wb-modal-input').value;
         var cb  = _modalCallback;
         _closeModal();
         if (typeof cb === 'function') cb(val);
      }
   });

   /**
    * Drop-in confirm() replacement.
    * @param {string}   title
    * @param {string}   body
    * @param {string}   icon
    * @param {function} onConfirm  — called if user clicks OK
    * @param {function} onCancel   — called if user cancels (optional)
    * @param {string}   okClass    — 'danger' for red OK button
    */
   function wbConfirm(title, body, icon, onConfirm, onCancel, okClass) {
      _modalCallback = function() { if (typeof onConfirm === 'function') onConfirm(); };
      document.getElementById('wb-modal-cancel').onclick = function() {
         _closeModal();
         if (typeof onCancel === 'function') onCancel();
      };
      _showModal(icon || '⚠️', title, body, 'Confirm', okClass === 'danger' ? 'wb-modal-danger' : '', false);
   }

   /**
    * Drop-in prompt() replacement.
    * @param {string}   title
    * @param {string}   body
    * @param {string}   placeholder
    * @param {function} onSubmit  — called with the entered value (or '' if empty)
    */
   function wbPrompt(title, body, placeholder, onSubmit) {
      _modalCallback = onSubmit;
      document.getElementById('wb-modal-cancel').onclick = _closeModal;
      _showModal('✏️', title, body, 'Insert', '', true, placeholder);
   }

   // ======================================================
   // #endregion FIX2_MODAL_SYSTEM
   // ======================================================

   // ======================================================
   // #region FIX6_AUTOSAVE_PROGRESS
   // Auto-save to localStorage every 30s + progress bar
   // ======================================================

   (function initAutosaveAndProgress() {
      // Inject autosave status badge into header actions
      var actions = document.querySelector('.wb-header-actions');
      if (actions) {
         var badge = document.createElement('span');
         badge.className = 'wb-autosave-status';
         badge.id = 'wb-autosave-status';
         badge.innerHTML = '<span class="wb-as-dot"></span><span class="wb-as-label">Unsaved</span>';
         actions.insertBefore(badge, actions.firstChild);
      }

      // Inject progress wrap into header
      var header = document.getElementById('wb-header');
      if (header) {
         var pw = document.createElement('div');
         pw.id = 'wb-progress-wrap';
         pw.innerHTML = '<div id="wb-progress-fill"></div>';
         header.appendChild(pw);
      }

      function setAutosaveStatus(state) {
         var el = document.getElementById('wb-autosave-status');
         if (!el) return;
         el.className = 'wb-autosave-status ' + (state || '');
         var label = el.querySelector('.wb-as-label');
         if (!label) return;
         if (state === 'saving') label.textContent = 'Saving…';
         else if (state === 'saved') label.textContent = 'Draft Saved';
         else label.textContent = 'Unsaved';
      }

      function triggerAutosave() {
         setAutosaveStatus('saving');
         try {
            localStorage.setItem('wb_draft_html', document.getElementById('wb-editor').innerHTML);
            localStorage.setItem('wb_draft_ts', Date.now());
         } catch(e) {}
         setTimeout(function() { setAutosaveStatus('saved'); }, 600);
         setTimeout(function() { setAutosaveStatus(''); }, 3600);
      }

      // Auto-save every 30s
      setInterval(triggerAutosave, 30000);
      // Also trigger on input with debounce
      var debTimer;
      document.getElementById('wb-editor').addEventListener('input', function() {
         clearTimeout(debTimer);
         debTimer = setTimeout(triggerAutosave, 8000);
         setAutosaveStatus('');
      });

      // Reading progress bar (scroll-based)
      window.addEventListener('scroll', function() {
         var fill = document.getElementById('wb-progress-fill');
         if (!fill) return;
         var scrollTop  = window.scrollY || document.documentElement.scrollTop;
         var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
         var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
         fill.style.width = pct.toFixed(1) + '%';
      }, { passive: true });
   })();

   // ======================================================
   // #endregion FIX6_AUTOSAVE_PROGRESS
   // ======================================================



   /** Update word count and reading time */
   function updateWordCount() {
      var editor = document.getElementById('wb-editor');
      var text   = editor ? (editor.innerText || editor.textContent || '') : '';
      var words  = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(function (w) { return w.length > 0; }).length;
      
      // Update word count in header
      var el = document.getElementById('wb-word-count');
      if (el) el.textContent = words + (words === 1 ? ' word' : ' words');
      
      // Calculate and update reading time (avg 200 words per minute)
      var readingTime = Math.max(1, Math.ceil(words / 200));
      
      // Update reading time display in header
      var readingTimeEl = document.getElementById('wb-reading-time');
      if (readingTimeEl) readingTimeEl.textContent = '~' + readingTime + ' min read';
      
      // Update reading time in meta block
      var readtimeInput = document.querySelector('#block-meta-default [data-meta="readtime"]');
      if (readtimeInput) {
         readtimeInput.value = readingTime + ' min read';
      }
   }

   // ==========================================================================
   // #region SECTION_02_INSERT_TOOLBAR
   // Toolbar button click → clone matching <template> → append to editor.
   // ==========================================================================

   /**
    * Inserts a new block into the editor by cloning the matching <template>.
    * Template IDs follow the pattern: tpl-{blockType}
    * @param {string} blockType - e.g. "heading", "paragraph", "image"
    */
   function insertBlock(blockType) {
      var tpl = document.getElementById('tpl-' + blockType);
      if (!tpl) {
         showToast('Template not found: ' + blockType, 'error');
         return;
      }

      // Clone the template content (deep clone = true)
      var clone = tpl.content.cloneNode(true);

      // Give the cloned block a unique ID so it can be referenced later
      var blockEl = clone.querySelector('.wb-block');
      if (blockEl) {
         blockEl.id = 'block-' + blockType + '-' + Date.now();
      }

      // Append the cloned block to the editor
      document.getElementById('wb-editor').appendChild(clone);

      // Run any post-insert setup needed for this block type
      initBlockFeatures(document.getElementById('wb-editor').lastElementChild);

      updateWordCount();
   }

   // Listen for toolbar button clicks
   document.getElementById('wb-insert-toolbar').addEventListener('click', function (e) {
      var btn = e.target.closest('.wb-insert-btn');
      if (!btn) return;
      var blockType = btn.dataset.block;
      if (blockType) {
         insertBlock(blockType);
         if (window.innerWidth <= 1100 && typeof window.wbCloseAllDrawers === 'function') {
            window.wbCloseAllDrawers();
         }
      }
   });

   // ==========================================================================
   // #endregion SECTION_02_INSERT_TOOLBAR

   // ==========================================================================
   // #region SECTION_03_BLOCK_FEATURES
   // After a block is inserted, run type-specific init (image, tags, etc.).
   // ==========================================================================

   /**
    * After a block is inserted, set up its interactive features
    * (image upload, tag input, format buttons, table row/col, etc.)
    * @param {HTMLElement} block - The newly inserted .wb-block element
    */
   function initBlockFeatures(block) {
      if (!block) return;
      var type = block.dataset.blockType;

      // -- Image block: click to open file picker, drag & drop --
      if (type === 'image') {
         initImageBlock(block);
      }

      // -- Tags block: Enter key or Add button creates a tag chip --
      if (type === 'tags') {
         initTagsBlock(block);
      }

      // -- Meta block: update avatar initials when author name is typed --
      if (type === 'meta') {
         initMetaBlock(block);
      }

      // -- List block: add new list items --
      if (type === 'list') {
         initListBlock(block);
      }

      // -- Code block: copy button --
      if (type === 'code') {
         initCodeBlock(block);
      }

      // -- Table block: add row / column --
      if (type === 'table') {
         initTableBlock(block);
      }

      // -- Audio block: file upload and URL input --
      if (type === 'audio') { 
         initAudioBlock(block); 
      }

      // -- Video block: URL input for video link and file upload --
      if (type === 'video') { 
         initVideoBlock(block); 
      }

      // -- File block: URL input for file link and button label --
      if (type === 'file') { 
         initFileBlock(block);
      }

      // -- Format toolbar in paragraph block --
      if (type === 'paragraph') {
         initParagraphFormatToolbar(block);
      }
   }

   // Run initBlockFeatures on the 5 default blocks that are already in the DOM
   document.querySelectorAll('#wb-editor .wb-block').forEach(initBlockFeatures);

   // ==========================================================================
   // #endregion SECTION_03_BLOCK_FEATURES

   // ==========================================================================
   // #region SECTION_04_REMOVE_BLOCK
   // Delegated click handler: move-up, move-down, remove with confirmation.
   // ==========================================================================

   document.getElementById('wb-editor').addEventListener('click', function (e) {
      var actionEl = e.target.closest('[data-action]');
      var action   = actionEl ? actionEl.dataset.action : null
      var block  = e.target.closest('.wb-block');
      if (!block) return;

      // -- Move Up --
      if (action === 'move-up') {
         var prev = block.previousElementSibling;
         if (prev) block.parentNode.insertBefore(block, prev);
         return;
      }

      // -- Move Down --
      if (action === 'move-down') {
         var next = block.nextElementSibling;
         if (next) block.parentNode.insertBefore(next, block);
         return;
      }

      // -- Remove --
      if (action === 'remove' || e.target.classList.contains('wb-block-remove')) {
         e.preventDefault();
         e.stopPropagation();

         var defaultBlockIds = ['block-heading-default', 'block-image-default', 'block-meta-default', 'block-tags-default', 'block-paragraph-default'];
         if (defaultBlockIds.includes(block.id)) {
            showToast('Cannot remove default blocks', 'error');
            return;
         }

         var blockType  = block.dataset.blockType;
         var hasContent = block.innerText.trim().length > 0;

         if (hasContent && blockType !== 'divider') {
            // #region FIX2_CUSTOM_MODAL_REMOVE
            // Use custom dark modal instead of native confirm()
            wbConfirm(
               'Remove Block',
               'Remove this ' + blockType + ' block? This cannot be undone.',
               '⚠️',
               function() {
                  block.remove();
                  updateWordCount();
                  showToast('Block removed');
               },
               null,
               'danger'
            );
            return; // wait for modal callback
            // #endregion FIX2_CUSTOM_MODAL_REMOVE
         }
      }
   }, true); // Use capture phase for better event handling

   // ==========================================================================
   // #endregion SECTION_04_REMOVE_BLOCK

   // ==========================================================================
   // #region SECTION_05_FEATURE_INITIALISERS
   // Individual init functions for each block type (image, tags, meta, etc.).
   // ==========================================================================

   /** Image block: click dropzone → file picker; drag&drop; preview */
   function initImageBlock(block) {
      var dropzone  = block.querySelector('.wb-image-dropzone');
      var fileInput = block.querySelector('.wb-image-file-input');
      var preview   = block.querySelector('.wb-image-preview');
      if (!dropzone || !fileInput || !preview) return;

      // Click on dropzone → trigger file input
      dropzone.addEventListener('click', function (e) {
         if (e.target === fileInput) return; // prevent loop
         fileInput.click();
      });

      // File selected via picker
      fileInput.addEventListener('change', function () {
         handleImageFile(this.files[0], preview, dropzone);
      });

      // Drag & drop
      dropzone.addEventListener('dragover', function (e) {
         e.preventDefault();
         dropzone.classList.add('drag-over');
      });
      dropzone.addEventListener('dragleave', function () {
         dropzone.classList.remove('drag-over');
      });
      dropzone.addEventListener('drop', function (e) {
         e.preventDefault();
         dropzone.classList.remove('drag-over');
         var file = e.dataTransfer.files[0];
         if (file && file.type.startsWith('image/')) {
            handleImageFile(file, preview, dropzone);
         }
      });
   }


   /** Read image file and show preview inside the dropzone */
   function handleImageFile(file, preview, dropzone) {
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (evt) {
         preview.src     = evt.target.result;
         preview.style.display = 'block';
         // Hide the placeholder content (icon + text) but keep the preview
         dropzone.querySelectorAll('i, p, small').forEach(function (el) {
            el.style.display = 'none';
         });
      };
      reader.readAsDataURL(file);
   }

   /** Tags block: create tag chips */
   function initTagsBlock(block) {
      var input     = block.querySelector('[data-tag-input]');
      var container = block.querySelector('[data-tags-container]');
      var addBtn    = block.querySelector('[data-action="add-tag"]');
      if (!input || !container || !addBtn) return;

      function addTag() {
         var value = input.value.trim();
         if (!value) return;

         // Create the chip
         var chip = document.createElement('span');
         chip.className = 'wb-tag';
         chip.innerHTML = value + '<button class="wb-tag-remove" title="Remove tag">&times;</button>';

         // Remove chip on × click
         chip.querySelector('.wb-tag-remove').addEventListener('click', function () {
            chip.remove();
         });

         container.appendChild(chip);
         input.value = '';
         input.focus();
      }

      addBtn.addEventListener('click', addTag);
      input.addEventListener('keydown', function (e) {
         if (e.key === 'Enter') { e.preventDefault(); addTag(); }
      });
   }

   /** Meta block: update the avatar circle with author initials */
   function initMetaBlock(block) {
      var authorInput = block.querySelector('[data-meta="author"]');
      var avatar      = block.querySelector('.wb-meta-avatar');
      if (!authorInput || !avatar) return;

      authorInput.addEventListener('input', function () {
         var name     = this.value.trim();
         var initials = name.split(' ').map(function (w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
         avatar.textContent = initials || '--';
      });
   }

   /** List block: add new items and toggle between UL/OL */
   function initListBlock(block) {

      // #region FIX9B_LIST_ITEM_DELETE
      // Helper: make a delete SVG button
      var DEL_SVG = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

      // Re-number OL items after any deletion
      function renumberOl(ol) {
         if (!ol) return;
         var items = ol.querySelectorAll('li');
         items.forEach(function(li, idx) {
            var numEl = li.querySelector('.wb-ol-num');
            if (numEl) numEl.textContent = (idx + 1) + '.';
         });
      }

      // Create a UL list item with delete button
      function makeUlLi(text) {
         var li = document.createElement('li');
         li.style.cssText = 'margin-bottom:6px;list-style:none;';
         var wrap = document.createElement('div');
         wrap.className = 'wb-li-wrap';
         var bullet = document.createElement('span');
         bullet.style.cssText = 'color:#666;margin-top:2px;';
         bullet.textContent = '\u2022';
         var span = document.createElement('span');
         span.contentEditable = 'true';
         span.style.cssText = 'color:#ccc;';
         span.textContent = text || 'List item';
         var del = document.createElement('button');
         del.className = 'wb-li-del';
         del.dataset.action = 'del-li';
         del.dataset.editorOnly = 'true';
         del.title = 'Delete item';
         del.innerHTML = DEL_SVG;
         del.addEventListener('click', function(e) {
            e.stopPropagation();
            li.remove();
         });
         wrap.appendChild(bullet);
         wrap.appendChild(span);
         wrap.appendChild(del);
         li.appendChild(wrap);
         return li;
      }

      // Create an OL list item with delete button
      function makeOlLi(text, num) {
         var li = document.createElement('li');
         li.style.cssText = 'margin-bottom:6px;list-style:none;';
         var wrap = document.createElement('div');
         wrap.className = 'wb-li-wrap';
         var numSpan = document.createElement('span');
         numSpan.className = 'wb-ol-num';
         numSpan.style.cssText = 'color:#f56004;font-weight:700;font-size:13px;margin-top:1px;min-width:18px;';
         numSpan.textContent = (num || 1) + '.';
         var span = document.createElement('span');
         span.contentEditable = 'true';
         span.style.cssText = 'color:#ccc;';
         span.textContent = text || 'Step';
         var del = document.createElement('button');
         del.className = 'wb-li-del';
         del.dataset.action = 'del-li';
         del.dataset.editorOnly = 'true';
         del.title = 'Delete item';
         del.innerHTML = DEL_SVG;
         var ol = block.querySelector('.wb-editable-ol');
         del.addEventListener('click', function(e) {
            e.stopPropagation();
            li.remove();
            renumberOl(ol);
         });
         wrap.appendChild(numSpan);
         wrap.appendChild(span);
         wrap.appendChild(del);
         li.appendChild(wrap);
         return li;
      }

      // Wire up existing del buttons already in DOM (from template)
      block.querySelectorAll('.wb-editable-ul .wb-li-del').forEach(function(btn) {
         btn.addEventListener('click', function(e) {
            e.stopPropagation();
            btn.closest('li').remove();
         });
      });
      block.querySelectorAll('.wb-editable-ol .wb-li-del').forEach(function(btn) {
         var ol = block.querySelector('.wb-editable-ol');
         btn.addEventListener('click', function(e) {
            e.stopPropagation();
            btn.closest('li').remove();
            renumberOl(ol);
         });
      });
      // #endregion FIX9B_LIST_ITEM_DELETE

      // Add UL item
      var addUlBtn = block.querySelector('[data-action="add-ul-item"]');
      if (addUlBtn) {
         addUlBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var ul = block.querySelector('.wb-editable-ul');
            if (!ul) return;
            var li = makeUlLi('List item');
            ul.appendChild(li);
            li.querySelector('[contenteditable]').focus();
         });
      }

      // Add OL item
      var addOlBtn = block.querySelector('[data-action="add-ol-item"]');
      if (addOlBtn) {
         addOlBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var ol = block.querySelector('.wb-editable-ol');
            if (!ol) return;
            var num = ol.querySelectorAll('li').length + 1;
            var li = makeOlLi('Step', num);
            ol.appendChild(li);
            li.querySelector('[contenteditable]').focus();
         });
      }

      // Toggle UL
      var ulCheck = block.querySelector('.wb-ul-enabled');
      var ulList  = block.querySelector('.wb-editable-ul');
      if (ulCheck && ulList) {
         ulCheck.addEventListener('change', function() {
            ulList.style.display   = this.checked ? '' : 'none';
            if (addUlBtn) addUlBtn.style.display = this.checked ? '' : 'none';
         });
      }

      // Toggle OL
      var olCheck = block.querySelector('.wb-ol-enabled');
      var olList  = block.querySelector('.wb-editable-ol');
      if (olCheck && olList) {
         olCheck.addEventListener('change', function() {
            olList.style.display   = this.checked ? '' : 'none';
            if (addOlBtn) addOlBtn.style.display = this.checked ? '' : 'none';
         });
      }

      // Hide OL by default
      if (olList)  olList.style.display  = 'none';
      if (addOlBtn) addOlBtn.style.display = 'none';
      if (olCheck)  olCheck.checked       = false;
   }

   /** Code block: copy code to clipboard */
   function initCodeBlock(block) {
      block.addEventListener('click', function (e) {
         if (e.target.dataset.action === 'copy-code' || e.target.closest('[data-action="copy-code"]')) {
            var textarea = block.querySelector('.wb-code-textarea');
            if (textarea && textarea.value) {
               navigator.clipboard.writeText(textarea.value)
                  .then(function () { showToast('Code copied to clipboard!'); })
                  .catch(function () { showToast('Copy failed — select manually', 'error'); });
            }
         }
      });
   }

   /** Table block: add rows and columns, delete rows and columns */
   function initTableBlock(block) {
      block.addEventListener('click', function (e) {
         var actionEl = e.target.closest('[data-action]');
         var action   = actionEl ? actionEl.dataset.action : null;
         var table    = block.querySelector('.wb-editable-table');
         if (!table || !action) return;

         // #region FIX9A_TABLE_DELETE
         // -- Delete a specific row --
         if (action === 'del-table-row') {
            var tr = actionEl.closest('tr');
            if (tr && table.querySelectorAll('tbody tr').length > 1) {
               tr.remove();
            } else {
               showToast('Need at least one row', 'error');
            }
            return;
         }

         // -- Delete a specific column --
         if (action === 'del-table-col') {
            var th = actionEl.closest('th');
            if (!th) return;
            var allThs = Array.from(table.querySelectorAll('thead tr th'));
            // Find the index of the column (skip the del-row control column at index 0)
            var colIdx = allThs.indexOf(th);
            var dataCols = allThs.length - 1; // exclude control col
            if (colIdx <= 0 || dataCols <= 1) {
               showToast('Need at least one column', 'error');
               return;
            }
            // Remove header
            th.remove();
            // Remove same index cell from every body row
            table.querySelectorAll('tbody tr').forEach(function(row) {
               var cells = row.querySelectorAll('td');
               // +1 offset because colIdx counts from thead (0=control col)
               if (cells[colIdx]) cells[colIdx].remove();
            });
            return;
         }
         // #endregion FIX9A_TABLE_DELETE

         // -- Add Row --
         if (action === 'add-table-row') {
            // Count data columns = total th - 1 (control col)
            var colCount = table.querySelector('thead tr').children.length - 1;
            var tr = document.createElement('tr');
            // Add del-row control cell
            var delTd = document.createElement('td');
            delTd.className = 'wb-row-del-cell';
            delTd.style.cssText = 'border:1px solid var(--wb-border);';
            var delBtn = document.createElement('button');
            delBtn.className = 'wb-table-row-del';
            delBtn.dataset.action = 'del-table-row';
            delBtn.title = 'Delete this row';
            delBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
            delTd.appendChild(delBtn);
            tr.appendChild(delTd);
            for (var i = 0; i < colCount; i++) {
               var td = document.createElement('td');
               td.contentEditable = 'true';
               td.style.cssText   = 'padding:10px 14px;border:1px solid var(--wb-border);color:#ccc;outline:none;';
               td.textContent     = 'Cell';
               tr.appendChild(td);
            }
            table.querySelector('tbody').appendChild(tr);
         }

         // -- Add Column --
         if (action === 'add-table-col') {
            // Add header cell with delete button
            var th = document.createElement('th');
            th.style.cssText = 'padding:10px 14px;background:rgba(245,96,4,0.1);color:#f56004;border:1px solid var(--wb-border);outline:none;';
            var wrap = document.createElement('div');
            wrap.className = 'wb-th-wrap';
            var colSpan = document.createElement('span');
            colSpan.contentEditable = 'true';
            colSpan.textContent = 'Column';
            var colDel = document.createElement('button');
            colDel.className = 'wb-table-col-del';
            colDel.dataset.action = 'del-table-col';
            colDel.title = 'Delete this column';
            colDel.innerHTML = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
            wrap.appendChild(colSpan);
            wrap.appendChild(colDel);
            th.appendChild(wrap);
            table.querySelector('thead tr').appendChild(th);

            // Add data cell to every body row
            table.querySelectorAll('tbody tr').forEach(function (row) {
               var td = document.createElement('td');
               td.contentEditable = 'true';
               td.style.cssText   = 'padding:10px 14px;border:1px solid var(--wb-border);color:#ccc;outline:none;';
               td.textContent     = 'Cell';
               row.appendChild(td);
            });
         }
      });
   }

   /** Audio block: file upload shows audio player — Fix 7: handle src availability */
   function initAudioBlock(block) {
      var fileInput = block.querySelector('.wb-audio-file');
      if (!fileInput) return;

      fileInput.addEventListener('change', function () {
         var file = this.files[0];
         if (!file) return;
         var existingAudio = block.querySelector('audio');
         if (existingAudio && existingAudio.src && existingAudio.src.startsWith('blob:')) {
            URL.revokeObjectURL(existingAudio.src);
         }
         var blobUrl = URL.createObjectURL(file);
         block._audioFile    = file;   
         block._audioBlobUrl = blobUrl;
         showAudioPlayer(block, blobUrl);
      });
   }

   /** Make audio player element */
   function showAudioPlayer(block, src) {
      var old = block.querySelector('audio');
      if (old) old.remove();

      var audio = document.createElement('audio');
      audio.controls    = true;
      audio.src         = src;
      audio.style.cssText = 'width:100%;margin-top:12px;border-radius:4px;';
      block.querySelector('.wb-block-body').appendChild(audio);
   }

   /** Make video player element — Fix 7: YouTube URL normalization */
   function initVideoBlock(block) {
      var urlInput  = block.querySelector('input[type="url"]');

      // #region FIX7_YOUTUBE_IFRAME
      urlInput.addEventListener('change', function () {
         var url = this.value.trim();
         if (!url) return;

         var embedUrl = url;
         // YouTube: watch?v= → embed/
         var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
         if (ytMatch) {
            embedUrl = 'https://www.youtube.com/embed/' + ytMatch[1];
         }
         // Vimeo
         var vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
         if (vimeoMatch) {
            embedUrl = 'https://player.vimeo.com/video/' + vimeoMatch[1];
         }

         showVideoEmbed(block, embedUrl);
      });
      // #endregion FIX7_YOUTUBE_IFRAME
   }

   /** Make YouTube/Vimeo iframe embed */
   function showVideoEmbed(block, embedUrl) {
      // Remove old player if exists
      var old = block.querySelector('video, iframe');
      if (old) old.remove();

      var iframe = document.createElement('iframe');
      iframe.src             = embedUrl;
      iframe.allowFullscreen = true;
      iframe.style.cssText   = 'width:100%;aspect-ratio:16/9;margin-top:12px;border:none;border-radius:6px;';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      block.querySelector('.wb-block-body').appendChild(iframe);
   }

   /** File block: display file download link */
   function initFileBlock(block) {
      var inputs = block.querySelectorAll('input');
      if (inputs.length < 2) return;
      
      var labelInput = inputs[0];
      var urlInput = inputs[1];
      
      function updateFileLink() {
         var label = labelInput.value.trim() || 'Download File';
         var url = urlInput.value.trim();
         
         // Remove old link if exists
         var oldLink = block.querySelector('a[download]');
         if (oldLink) oldLink.remove();
         
         if (!url) return;
         
         var link = document.createElement('a');
         link.href = url;
         link.download = '';
         link.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#ccc;text-decoration:none;font-size:14px;margin-top:12px;';
         link.innerHTML = '<i class="fa-regular fa-file-arrow-down" style="color:#f56004;"></i>' + label;
         block.querySelector('.wb-block-body').appendChild(link);
      }
      
      labelInput.addEventListener('change', updateFileLink);
      urlInput.addEventListener('change', updateFileLink);
      updateFileLink();
   }

   /** Paragraph format toolbar: Bold, Italic, Underline, Strikethrough */
   function initParagraphFormatToolbar(block) {
      var contentEl = block.querySelector('.wb-paragraph-content');
      if (!contentEl) return;

      // Override alignment buttons — apply style to <p> children, not <div>
      block.querySelectorAll('.wb-format-btn[data-command^="justify"]').forEach(function(btn) {
         btn.addEventListener('click', function(e) {
               e.stopPropagation();
               var alignMap = {
                  justifyLeft:   'left',
                  justifyCenter: 'center',
                  justifyRight:  'right',
                  justifyFull:   'justify'
               };
               var align = alignMap[btn.dataset.command];
               if (!align) return;

               // Apply to selected paragraph or whole content
               contentEl.style.textAlign = align;
               contentEl.focus();
         });
      });

      block.addEventListener('click', function(e) {
         if (e.target.classList.contains('wb-format-btn')) {
               contentEl.focus();
         }
      });
   }

   // ==========================================================================
   // #endregion SECTION_05_FEATURE_INITIALISERS

   // ==========================================================================
   // #region SECTION_06_FORMAT_BUTTONS
   // execCommand handler for all paragraph format toolbar buttons.
   // ==========================================================================

   // Delegated listener for Bold / Italic / Underline / Strikethrough
   document.getElementById('wb-editor').addEventListener('click', function (e) {
      var btn = e.target.closest('.wb-format-btn');
      if (!btn) return;
      var cmd = btn.dataset.command;
      if (!cmd) return;

      // Handle custom inputs
      if (cmd === 'createLink') {
         // #region FIX2_MODAL_CREATE_LINK
         // Selection save করো — modal খুললে focus হারিয়ে যায়
         var savedRange = null;
         var sel = window.getSelection();
         if (sel && sel.rangeCount > 0) {
            savedRange = sel.getRangeAt(0).cloneRange();
         }
         wbPrompt('Insert Link', 'Enter the link URL:', 'https://example.com', function(url) {
            if (!url) return;
            // Selection restore করো তারপর link insert করো
            if (savedRange) {
               sel = window.getSelection();
               sel.removeAllRanges();
               sel.addRange(savedRange);
            }
            // Selected text থাকলে link wrap করো, না থাকলে নতুন link insert করো
            var selText = sel && sel.toString();
            if (selText && selText.length > 0) {
               document.execCommand('createLink', false, url);
               // target=_blank এবং rel=noopener যোগ করো
               var links = document.querySelectorAll('.wb-paragraph-content a[href="' + url + '"]');
               links.forEach(function(a) {
                  a.setAttribute('target', '_blank');
                  a.setAttribute('rel', 'noopener noreferrer');
               });
            } else {
               // কোনো text select নেই — URL কে link হিসেবে insert করো
               var linkHtml = '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color:#f56004;text-decoration:underline;font-weight:600;">' + url + '</a>';
               document.execCommand('insertHTML', false, linkHtml);
            }
         });
         // #endregion FIX2_MODAL_CREATE_LINK
      } else if (cmd === 'insertReadMore') {
         // Inserts a visual Read More divider
         document.execCommand('insertHTML', false, '<hr class="read-more" style="border-top: 2px dashed var(--wb-accent); margin: 20px 0;">');
      } else if (cmd === 'insertText') {
         // #region FIX2_MODAL_INSERT_TEXT
         var savedRangePaste = null;
         var selPaste = window.getSelection();
         if (selPaste && selPaste.rangeCount > 0) {
            savedRangePaste = selPaste.getRangeAt(0).cloneRange();
         }
         wbPrompt('Paste as Text', 'Paste your text here (will be inserted as plain text):', '', function(text) {
            if (!text) return;
            if (savedRangePaste) {
               selPaste = window.getSelection();
               selPaste.removeAllRanges();
               selPaste.addRange(savedRangePaste);
            }
            document.execCommand('insertText', false, text);
         });
         // #endregion FIX2_MODAL_INSERT_TEXT
      } else if (cmd === 'insertSpecialChar') {
         // #region FIX2_MODAL_SPECIAL_CHAR
         var savedRangeChar = null;
         var selChar = window.getSelection();
         if (selChar && selChar.rangeCount > 0) {
            savedRangeChar = selChar.getRangeAt(0).cloneRange();
         }
         wbPrompt('Special Character', 'Enter special character (e.g. ©, ™, €):', '', function(ch) {
            if (!ch) return;
            if (savedRangeChar) {
               selChar = window.getSelection();
               selChar.removeAllRanges();
               selChar.addRange(savedRangeChar);
            }
            document.execCommand('insertText', false, ch);
         });
         // #endregion FIX2_MODAL_SPECIAL_CHAR
      } else if (cmd === 'indent') {
         // Custom indent: paddingLeft বাড়াও, blockquote তৈরি হবে না
         var activeContent = document.activeElement.closest('.wb-paragraph-content');
         if (activeContent) {
            var cur = parseInt(activeContent.style.paddingLeft || '0', 10);
            activeContent.style.paddingLeft = Math.min(cur + 30, 150) + 'px';
         }
      } else if (cmd === 'outdent') {
         // Custom outdent: paddingLeft কমাও
         var activeContent = document.activeElement.closest('.wb-paragraph-content');
         if (activeContent) {
            var cur = parseInt(activeContent.style.paddingLeft || '0', 10);
            activeContent.style.paddingLeft = Math.max(cur - 30, 0) + 'px';
         }
      } else if (cmd !== 'foreColor') {
         // Standard commands
         document.execCommand(cmd, false, null);
      }
   });

   // Handle Text Color picker
   document.getElementById('wb-editor').addEventListener('change', function (e) {
      if (e.target.dataset.command === 'foreColor') {
         document.execCommand('foreColor', false, e.target.value);
      }
   });

   // ==========================================================================
   // #endregion SECTION_06_FORMAT_BUTTONS

   // ==========================================================================
   // #region SECTION_07_WORD_COUNT
   // Editor input listener → live word count + reading time update.
   // ==========================================================================

   document.getElementById('wb-editor').addEventListener('input', updateWordCount);
   updateWordCount(); // initial count on page load

   // ==========================================================================
   // #endregion SECTION_07_WORD_COUNT

   // ==========================================================================
   // #region PLAIN_PASTE_HANDLER
   // Ctrl + Shift + V → strips all inline styles, background-color, font
   // formatting from pasted content; inserts clean plain text only.
   // ==========================================================================
   document.getElementById('wb-editor').addEventListener('keydown', function (e) {
      if (!(e.ctrlKey && e.shiftKey && (e.key === 'V' || e.key === 'v'))) return;
      e.preventDefault();

      navigator.clipboard.readText().then(function (plainText) {
         if (!plainText) return;

         // Insert as plain text at the current caret position
         var sel = window.getSelection();
         if (!sel || sel.rangeCount === 0) return;

         var range = sel.getRangeAt(0);
         range.deleteContents();

         // Split by newlines and insert as separate text nodes with <br>
         var lines = plainText.split(/\r?\n/);
         var frag  = document.createDocumentFragment();
         lines.forEach(function (line, idx) {
            if (idx > 0) frag.appendChild(document.createElement('br'));
            frag.appendChild(document.createTextNode(line));
         });

         var lastNode = frag.lastChild;
         range.insertNode(frag);

         // Move caret to end of inserted content
         if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
         }

         // Trigger word count + autosave
         document.getElementById('wb-editor').dispatchEvent(new Event('input', { bubbles: true }));
      }).catch(function () {
         // Clipboard API not available — fallback: execCommand insertText
         document.execCommand('insertText', false,
            (window.clipboardData && window.clipboardData.getData('Text')) || '');
      });
   });
   // #endregion PLAIN_PASTE_HANDLER

   // ==========================================================================
   // #region SECTION_08_SIDEBAR_HELPERS
   // Slug generation, schedule toggle, SEO counter, category management.
   // ==========================================================================

   // -- Auto-generate slug from the first heading block --
   document.getElementById('wb-editor').addEventListener('input', function (e) {
      if (!e.target.classList.contains('wb-heading-content')) return;
      var firstHeading = document.querySelector('#block-heading-default .wb-heading-content');
      if (!firstHeading || e.target !== firstHeading) return; // only from default heading

      var slug = firstHeading.textContent.trim()
         .toLowerCase()
         .replace(/[^a-z0-9\s-]/g, '')
         .replace(/\s+/g, '-')
         .replace(/-+/g, '-')
         .slice(0, 60);

      var slugInput = document.getElementById('wb-slug');
      if (slugInput) slugInput.value = slug;
   });

   // -- Status badge sync with sidebar select --
   var statusSelect = document.getElementById('wb-post-status');
   var statusBadge  = document.getElementById('wb-status-badge');
   if (statusSelect && statusBadge) {
      statusSelect.addEventListener('change', function () {
         var labels = { draft: 'Draft', review: 'Under Review', published: 'Published' };
         statusBadge.textContent = labels[this.value] || 'Draft';
         statusBadge.className   = 'wb-status-badge' + (this.value === 'published' ? ' published' : '');
      });
   }

   // -- Schedule date field toggle and sync with publish date --
   var scheduleCheck = document.getElementById('wb-schedule-check');
   var scheduleDate  = document.getElementById('wb-schedule-date');
   var publishDate   = document.getElementById('wb-publish-date');
   
   if (scheduleCheck && scheduleDate) {
      scheduleCheck.addEventListener('change', function () {
         scheduleDate.style.display = this.checked ? 'block' : 'none';
         if (!this.checked) {
            scheduleDate.value = '';
         } else if (publishDate && publishDate.value) {
            // Sync to publish date when schedule is enabled
            scheduleDate.value = publishDate.value + 'T09:00';
         }
      });
   }

   // Sync schedule date when publish date changes
   if (publishDate && scheduleDate && scheduleCheck) {
      publishDate.addEventListener('change', function () {
         if (scheduleCheck.checked && this.value) {
            scheduleDate.value = this.value + 'T09:00';
            showToast('Schedule date synced with publish date');
         }
      });
   }

   // -- SEO meta description character counter --
   var metaDescInput = document.getElementById('wb-meta-desc');
   var metaDescCount = document.getElementById('wb-meta-desc-count');
   if (metaDescInput && metaDescCount) {
      metaDescInput.addEventListener('input', function () {
         var len = this.value.length;
         metaDescCount.textContent = len + ' / 160';
         metaDescCount.style.color = len > 160 ? '#ff4444' : '#555';

         // Auto-sync to Excerpt field
         var excerptField = document.getElementById('wb-excerpt');
         if (excerptField) excerptField.value = this.value;
      });
   }

   // -- Category system: track selected categories --
   var categoryCheckboxes = document.querySelectorAll('.wb-category-list input[type="checkbox"]');
   categoryCheckboxes.forEach(function (checkbox) {
      checkbox.addEventListener('change', function () {
         var selected = Array.from(categoryCheckboxes).filter(function (c) { return c.checked; }).length;
         showToast((this.checked ? '✓ ' : '✗ ') + this.value + (this.checked ? ' selected' : ' removed'));
      });
   });

   // -- Add new category dynamically --
   window.addNewCategory = function() {
      var input = document.getElementById('wb-new-category');
      var val = input.value.trim();
      if(!val) return;
      
      var slug = val.toLowerCase().replace(/\s+/g, '-');
      var ul = document.querySelector('.wb-category-list');
      var li = document.createElement('li');
      
      li.innerHTML = '<label><input type="checkbox" value="' + slug + '" checked> ' + val + '</label>';
      ul.appendChild(li);
      input.value = ''; // clear input
      showToast('Category added');
   };

   // ==========================================================================
   // #endregion SECTION_08_SIDEBAR_HELPERS

   // ==========================================================================
   // #region SECTION_09_DRAFT_SAVE_RESTORE
   // restoreDraft & initHistorySystem — localStorage and history baseline.
   // ==========================================================================

   // Auto restore draft on page load
   function restoreDraft() {
      var saved = localStorage.getItem('blogDraft');
      if (!saved) return;
      
      try {
         var d = JSON.parse(saved);
         if (d.blocks && d.blocks.length > 0 && typeof deserializeEditorBlocks === 'function') {
            deserializeEditorBlocks(d.blocks);
         }

         // Restore sidebar fields
         if (d.slug) {
            var s = document.getElementById('wb-slug');
            if (s) s.value = d.slug;
         }
         if (d.excerpt) {
            var e = document.getElementById('wb-excerpt');
            if (e) e.value = d.excerpt;
         }
         if (d.metaTitle) {
            var mt = document.getElementById('wb-meta-title');
            if (mt) mt.value = d.metaTitle;
         }
         if (d.metaDesc) {
            var md = document.getElementById('wb-meta-desc');
            if (md) md.value = d.metaDesc;
         }
         if (d.focusKeyword) {
            var fk = document.getElementById('wb-focus-keyword');
            if (fk) fk.value = d.focusKeyword;
         }
         if (d.author) {
            var a = document.querySelector('#block-meta-default [data-meta="author"]');
            if (a) a.value = d.author;
         }
         if (d.readingTime) {
            var rt = document.querySelector('#block-meta-default [data-meta="readtime"]');
            if (rt) rt.value = d.readingTime;
         }
         if (d.tags && typeof setTagsInEditor === 'function') {
            setTagsInEditor(d.tags);
         }
         if (d.categories && Array.isArray(d.categories)) {
            document.querySelectorAll('.wb-category-list input').forEach(function(cb) {
               cb.checked = d.categories.includes(cb.value);
            });
         }

         if (typeof updateWordCount === 'function') updateWordCount();
         showToast('📂 Draft Restored Successfully');
      } catch(e) {
         console.error('Draft restore error:', e);
      }
   }

   // Auto save history on important actions
   function initHistorySystem() {
      var editor = document.getElementById('wb-editor');
      if (!editor) return;

      // Restore saved draft if not in editing existing post mode
      if (!window.INITIAL_EDIT_POST) {
         restoreDraft();
      }

      // Reset and push baseline initial snapshot
      editorHistory = [];
      historyIndex = -1;
      pushHistorySnapshot();

      // Save history after input and block actions
      editor.addEventListener('input', debouncePushHistory);
      document.addEventListener('input', function(e) {
         if (e.target.closest('.wb-sidebar') || e.target.id === 'wb-dynamic-title') {
            debouncePushHistory();
         }
      });
      editor.addEventListener('click', function(e) {
         if (e.target.closest('[data-action]') && !e.target.closest('.wb-format-btn')) {
            setTimeout(function() {
               if (!isHistoryAction) pushHistorySnapshot();
            }, 80);
         }
      });
   }

   // Initialize history system
   initHistorySystem();

   // ==========================================================================
   // #endregion SECTION_09_DRAFT_SAVE_RESTORE

   // ==========================================================================
   // #region SECTION_10_PREVIEW
   // Opens a live preview of the current post in a new browser window.
   // ==========================================================================

   window.openPreview = async function () {
      var headingEl = document.querySelector('#block-heading-default .wb-heading-content');
      var heading   = headingEl ? headingEl.innerText.trim() : '';
      
      if (!heading) {
         showToast('Please add a heading before previewing!', 'error');
         return;
      }

      var slugInput = document.getElementById('wb-slug');
      var slug      = slugInput ? slugInput.value.trim() : '';
      if (!slug) {
         slug = heading.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 60);
         if (slugInput) slugInput.value = slug;
      }
      slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (slugInput) slugInput.value = slug;

      showToast('Preparing live preview...', 'info');
      if (typeof window.saveDraft === 'function') {
         await window.saveDraft();
      }
      window.open('blog_tamp.html?slug=' + encodeURIComponent(slug), '_blank');
      showToast('✨ Preview opened in new tab!', 'success');
   };

   // ==========================================================================
   // #endregion SECTION_10_PREVIEW

   // ==========================================================================
   // #region SECTION_11_BUILD_CONTENT_HTML
   // Converts each .wb-block in the editor into blog_details-compatible HTML.
   // ==========================================================================

   /**
    * Loops over every .wb-block in the editor and converts it to
    * blog_details.html-compatible HTML string.
    * @returns {string} HTML markup for the post body
    */
      // Helper to reliably read all tags from the editor tag chips
      function getTagsFromEditor() {
         var chips = document.querySelectorAll('#block-tags-default .wb-tag, #block-tags-default .wb-tag-chip');
         return Array.from(chips).map(function(chip) {
            var clone = chip.cloneNode(true);
            var btn = clone.querySelector('.wb-tag-remove, .wb-tag-chip-remove, button');
            if (btn) btn.remove();
            return clone.textContent.trim();
         }).filter(Boolean);
      }
      window.getTagsFromEditor = getTagsFromEditor;

      // Helper to populate tags in editor
      function setTagsInEditor(tagsArray) {
         var container = document.querySelector('#block-tags-default [data-tags-container]');
         if (!container) return;
         container.innerHTML = '';
         if (!Array.isArray(tagsArray)) return;
         tagsArray.forEach(function(tagText) {
            if (!tagText) return;
            var chip = document.createElement('span');
            chip.className = 'wb-tag';
            chip.innerHTML = tagText + '<button type="button" class="wb-tag-remove" title="Remove tag">&times;</button>';
            chip.querySelector('.wb-tag-remove').addEventListener('click', function () {
               chip.remove();
            });
            container.appendChild(chip);
         });
      }
      window.setTagsInEditor = setTagsInEditor;

      // Helper to reliably retrieve featured/cover image URL
      function getFeaturedImage() {
         var coverUrlInput = document.getElementById('wb-cover-url');
         if (coverUrlInput && coverUrlInput.value && coverUrlInput.value.trim()) {
            return coverUrlInput.value.trim();
         }
         var preview = document.querySelector('#block-image-default img.wb-image-preview');
         if (preview && preview.src && preview.style.display !== 'none' && !preview.src.startsWith('data:')) {
            return preview.src;
         }
         return (preview && preview.src && preview.style.display !== 'none') ? preview.src : 'https://res.cloudinary.com/ojaeefvp/image/upload/v1789066214/hirexpro/brands/b_1.webp';
      }
      window.getFeaturedImage = getFeaturedImage;

      // Serializes the editor state into structured JSON blocks for perfect persistence
      function serializeEditorBlocks() {
         var blocks = [];
         var editor = document.getElementById('wb-editor');
         if (!editor) return blocks;

         editor.querySelectorAll('.wb-block').forEach(function(block) {
            var id = block.id || '';
            var type = block.dataset.blockType || '';

            if (id === 'block-heading-default') {
               var hContent = block.querySelector('.wb-heading-content');
               blocks.push({
                  type: 'main-heading',
                  content: hContent ? hContent.innerHTML.trim() : ''
               });
               return;
            }
            if (id === 'block-image-default') {
               var img = block.querySelector('img.wb-image-preview');
               var caption = block.querySelector('.wb-image-caption');
               blocks.push({
                  type: 'featured-image',
                  src: (img && img.style.display !== 'none') ? img.src : '',
                  caption: caption ? caption.value.trim() : ''
               });
               return;
            }
            if (id === 'block-meta-default') {
               var author = block.querySelector('[data-meta="author"]');
               var readtime = block.querySelector('[data-meta="readtime"]');
               blocks.push({
                  type: 'meta',
                  author: author ? author.value.trim() : '',
                  reading_time: readtime ? readtime.value.trim() : ''
               });
               return;
            }
            if (id === 'block-tags-default') {
               blocks.push({
                  type: 'tags',
                  tags: getTagsFromEditor()
               });
               return;
            }

            if (type === 'heading') {
               var level = block.querySelector('.heading-level')?.value || 'h2';
               var text = block.querySelector('.wb-heading-content')?.innerHTML?.trim() || '';
               blocks.push({ type: 'heading', level: level, content: text });
            }
            else if (type === 'paragraph') {
               var pContent = block.querySelector('.wb-paragraph-content');
               var text = pContent ? pContent.innerHTML.trim() : '';
               blocks.push({
                  type: 'paragraph',
                  content: text,
                  textAlign: pContent ? (pContent.style.textAlign || 'justify') : 'justify',
                  paddingLeft: pContent ? pContent.style.paddingLeft : ''
               });
            }
            else if (type === 'image') {
               var img = block.querySelector('img.wb-image-preview');
               var caption = block.querySelector('.wb-image-caption');
               blocks.push({
                  type: 'image',
                  src: (img && img.style.display !== 'none') ? img.src : '',
                  caption: caption ? caption.value.trim() : ''
               });
            }
            else if (type === 'file') {
               var inputs = block.querySelectorAll('input');
               blocks.push({
                  type: 'file',
                  label: inputs[0] ? inputs[0].value.trim() : 'Download File',
                  url: inputs[1] ? inputs[1].value.trim() : ''
               });
            }
            else if (type === 'blockquote') {
               var bq = block.querySelector('blockquote');
               blocks.push({ type: 'blockquote', content: bq ? bq.innerHTML.trim() : '' });
            }
            else if (type === 'list') {
               var ulEnabled = block.querySelector('.wb-ul-enabled')?.checked;
               var olEnabled = block.querySelector('.wb-ol-enabled')?.checked;
               var ulItems = Array.from(block.querySelectorAll('.wb-editable-ul li')).map(function(li) {
                  return li.querySelector('[contenteditable]')?.innerHTML || li.innerText.trim();
               }).filter(Boolean);
               var olItems = Array.from(block.querySelectorAll('.wb-editable-ol li')).map(function(li) {
                  return li.querySelector('[contenteditable]')?.innerHTML || li.innerText.trim();
               }).filter(Boolean);
               blocks.push({
                  type: 'list',
                  ulEnabled: !!ulEnabled,
                  olEnabled: !!olEnabled,
                  ulItems: ulItems,
                  olItems: olItems
               });
            }
            else if (type === 'code') {
               var inlineCode = block.querySelector('.wb-inline-code')?.value?.trim() || '';
               var lang = block.querySelector('.wb-code-lang')?.value || '';
               var code = block.querySelector('.wb-code-textarea')?.value?.trim() || '';
               blocks.push({ type: 'code', code: code, lang: lang, inlineCode: inlineCode });
            }
            else if (type === 'table') {
               var tableEl = block.querySelector('.wb-editable-table');
               if (tableEl) {
                  var headers = Array.from(tableEl.querySelectorAll('thead th'))
                     .filter(function(th) { return !th.classList.contains('wb-col-del-th'); })
                     .map(function(th) { return th.querySelector('[contenteditable]')?.innerHTML?.trim() || th.textContent.trim(); });
                  var rows = Array.from(tableEl.querySelectorAll('tbody tr')).map(function(tr) {
                     return Array.from(tr.querySelectorAll('td'))
                        .filter(function(td) { return !td.classList.contains('wb-row-del-cell'); })
                        .map(function(td) { return td.innerHTML.trim(); });
                  });
                  blocks.push({ type: 'table', headers: headers, rows: rows });
               }
            }
            else if (type === 'divider') {
               blocks.push({ type: 'divider' });
            }
            else if (type === 'math') {
               var expr = block.querySelector('input')?.value?.trim() || '';
               blocks.push({ type: 'math', expr: expr });
            }
            else if (type === 'verse') {
               var text = block.querySelector('[contenteditable]')?.innerHTML?.trim() || '';
               blocks.push({ type: 'verse', content: text });
            }
            else if (type === 'audio') {
               var audioUrl = block.querySelector('input[type="url"]')?.value?.trim() || '';
               var audioEl = block.querySelector('audio');
               blocks.push({ type: 'audio', url: audioUrl || (audioEl ? audioEl.src : '') });
            }
            else if (type === 'video') {
               var iframe = block.querySelector('iframe');
               var videoEl = block.querySelector('video');
               var src = iframe?.src || videoEl?.src || block.querySelector('input[type="url"]')?.value?.trim() || '';
               blocks.push({ type: 'video', url: src });
            }
         });

         return blocks;
      }
      window.serializeEditorBlocks = serializeEditorBlocks;

      function getBlocksJSON() {
         var serialized = typeof serializeEditorBlocks === 'function' ? serializeEditorBlocks() : [];
         return encodeURIComponent(JSON.stringify(serialized));
      }
      window.getBlocksJSON = getBlocksJSON;

      // Deserializes structured JSON blocks into full DOM editor blocks
      function deserializeEditorBlocks(blocks) {
         if (!Array.isArray(blocks) || !blocks.length) return false;

         var editor = document.getElementById('wb-editor');
         if (!editor) return false;

         // Remove all non-default blocks
         editor.querySelectorAll('.wb-block').forEach(function(blk) {
            if (!blk.id || !blk.id.endsWith('-default')) {
               blk.remove();
            }
         });

         var defaultHeading = document.getElementById('block-heading-default');
         var defaultImage = document.getElementById('block-image-default');
         var defaultMeta = document.getElementById('block-meta-default');
         var defaultTags = document.getElementById('block-tags-default');
         var defaultPara = document.getElementById('block-paragraph-default');

         // Reset default paragraph content so it doesn't hold stale text
         if (defaultPara) {
            var defaultPContent = defaultPara.querySelector('.wb-paragraph-content');
            if (defaultPContent) defaultPContent.innerHTML = '';
         }

         var firstParaUsed = false;

         blocks.forEach(function(b) {
            if (!b || !b.type) return;

            if (b.type === 'main-heading') {
               if (defaultHeading) {
                  var el = defaultHeading.querySelector('.wb-heading-content');
                  if (el) el.innerHTML = b.content || '';
               }
            }
            else if (b.type === 'featured-image') {
               if (defaultImage) {
                  var preview = defaultImage.querySelector('.wb-image-preview');
                  var dropzone = document.getElementById('wb-image-dropzone-default');
                  var captionInput = defaultImage.querySelector('.wb-image-caption');
                  if (b.src) {
                     if (preview) {
                        preview.src = b.src;
                        preview.style.display = 'block';
                     }
                     if (dropzone) {
                        dropzone.classList.add('has-image');
                        dropzone.querySelectorAll('i, p, small').forEach(function(el) { el.style.display = 'none'; });
                     }
                  } else {
                     if (preview) {
                        preview.src = '';
                        preview.style.display = 'none';
                     }
                     if (dropzone) {
                        dropzone.classList.remove('has-image');
                        dropzone.querySelectorAll('i, p, small').forEach(function(el) { el.style.display = ''; });
                     }
                  }
                  if (captionInput) captionInput.value = b.caption || '';
               }
            }
            else if (b.type === 'meta') {
               if (defaultMeta) {
                  var authorInp = defaultMeta.querySelector('[data-meta="author"]');
                  var readInp = defaultMeta.querySelector('[data-meta="readtime"]');
                  var avatar = document.getElementById('meta-avatar-default');
                  if (authorInp) {
                     authorInp.value = b.author || '';
                     if (avatar) avatar.textContent = (b.author || '').split(' ').map(function(w) { return w[0]||''; }).join('').toUpperCase().slice(0,2) || '--';
                  }
                  if (readInp) readInp.value = b.reading_time || '';
               }
            }
            else if (b.type === 'tags') {
               setTagsInEditor(b.tags || []);
            }
            else if (b.type === 'paragraph') {
               if (!firstParaUsed && defaultPara) {
                  var pContent = defaultPara.querySelector('.wb-paragraph-content');
                  if (pContent) {
                     pContent.innerHTML = b.content || '';
                     if (b.textAlign) pContent.style.textAlign = b.textAlign;
                     if (b.paddingLeft) pContent.style.paddingLeft = b.paddingLeft;
                  }
                  firstParaUsed = true;
               } else {
                  insertBlock('paragraph');
                  var blk = editor.lastElementChild;
                  if (blk) {
                     var pContent = blk.querySelector('.wb-paragraph-content');
                     if (pContent) {
                        pContent.innerHTML = b.content || '';
                        if (b.textAlign) pContent.style.textAlign = b.textAlign;
                        if (b.paddingLeft) pContent.style.paddingLeft = b.paddingLeft;
                     }
                  }
               }
            }
            else if (b.type === 'heading') {
               insertBlock('heading');
               var blk = editor.lastElementChild;
               if (blk) {
                  var sel = blk.querySelector('.heading-level');
                  if (sel && b.level) sel.value = b.level;
                  var hContent = blk.querySelector('.wb-heading-content');
                  if (hContent) hContent.innerHTML = b.content || '';
               }
            }
            else if (b.type === 'file') {
               insertBlock('file');
               var blk = editor.lastElementChild;
               if (blk) {
                  var inputs = blk.querySelectorAll('input');
                  if (inputs[0]) inputs[0].value = b.label || '';
                  if (inputs[1]) inputs[1].value = b.url || '';
                  initFileBlock(blk);
               }
            }
            else if (b.type === 'image') {
               insertBlock('image');
               var blk = editor.lastElementChild;
               if (blk) {
                  var preview = blk.querySelector('.wb-image-preview');
                  var dropzone = blk.querySelector('.wb-image-dropzone');
                  var captionInput = blk.querySelector('.wb-image-caption');
                  if (preview && b.src) {
                     preview.src = b.src;
                     preview.style.display = 'block';
                  }
                  if (dropzone && b.src) {
                     dropzone.classList.add('has-image');
                     dropzone.querySelectorAll('i, p, small').forEach(function(el) { el.style.display = 'none'; });
                  }
                  if (captionInput && b.caption) captionInput.value = b.caption;
               }
            }
            else if (b.type === 'blockquote') {
               insertBlock('blockquote');
               var blk = editor.lastElementChild;
               if (blk) {
                  var bq = blk.querySelector('blockquote');
                  if (bq) bq.innerHTML = b.content || '';
               }
            }
            else if (b.type === 'list') {
               insertBlock('list');
               var blk = editor.lastElementChild;
               if (blk) {
                  var ulCb = blk.querySelector('.wb-ul-enabled');
                  var olCb = blk.querySelector('.wb-ol-enabled');
                  var ulEl = blk.querySelector('.wb-editable-ul');
                  var olEl = blk.querySelector('.wb-editable-ol');
                  if (ulCb && b.ulEnabled !== undefined) ulCb.checked = b.ulEnabled;
                  if (olCb && b.olEnabled !== undefined) olCb.checked = b.olEnabled;
                  if (ulEl && Array.isArray(b.ulItems) && b.ulItems.length) {
                     ulEl.innerHTML = '';
                     b.ulItems.forEach(function(itemText) {
                        var li = document.createElement('li');
                        li.style.cssText = 'margin-bottom:6px;list-style:none;';
                        li.innerHTML = '<div class="wb-li-wrap"><span style="color:#666;margin-top:2px;">&#x2022;</span><span contenteditable="true" style="color:#ccc;">' + itemText + '</span><button class="wb-li-del" data-action="del-li" title="Delete item"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>';
                        ulEl.appendChild(li);
                     });
                  }
                  if (olEl && Array.isArray(b.olItems) && b.olItems.length) {
                     olEl.innerHTML = '';
                     b.olItems.forEach(function(itemText, idx) {
                        var li = document.createElement('li');
                        li.style.cssText = 'margin-bottom:6px;list-style:none;';
                        li.innerHTML = '<div class="wb-li-wrap"><span style="color:#f56004;font-weight:700;margin-top:2px;min-width:18px;">' + (idx+1) + '.</span><span contenteditable="true" style="color:#ccc;">' + itemText + '</span><button class="wb-li-del" data-action="del-li" title="Delete item"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>';
                        olEl.appendChild(li);
                     });
                  }
               }
            }
            else if (b.type === 'code') {
               insertBlock('code');
               var blk = editor.lastElementChild;
               if (blk) {
                  var ta = blk.querySelector('.wb-code-textarea');
                  var langSel = blk.querySelector('.wb-code-lang');
                  var inlineInp = blk.querySelector('.wb-inline-code');
                  if (ta && b.code) ta.value = b.code;
                  if (langSel && b.lang) langSel.value = b.lang;
                  if (inlineInp && b.inlineCode) inlineInp.value = b.inlineCode;
               }
            }
            else if (b.type === 'table') {
               insertBlock('table');
               var blk = editor.lastElementChild;
               if (blk && (b.headers || b.rows)) {
                  var tableEl = blk.querySelector('.wb-editable-table');
                  if (tableEl) {
                     var theadTr = tableEl.querySelector('thead tr');
                     var tbody = tableEl.querySelector('tbody');
                     if (theadTr && Array.isArray(b.headers) && b.headers.length) {
                        theadTr.innerHTML = '<th class="wb-col-del-th" style="width:28px;background:rgba(239,68,68,0.04);border:1px solid var(--wb-border);"></th>';
                        b.headers.forEach(function(hText) {
                           var th = document.createElement('th');
                           th.style.cssText = 'padding:10px 14px;background:rgba(245,96,4,0.1);color:#f56004;border:1px solid var(--wb-border);outline:none;';
                           th.innerHTML = '<div class="wb-th-wrap"><span contenteditable="true">' + hText + '</span><button class="wb-table-col-del" data-action="del-table-col" title="Delete this column"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button></div>';
                           theadTr.appendChild(th);
                        });
                     }
                     if (tbody && Array.isArray(b.rows) && b.rows.length) {
                        tbody.innerHTML = '';
                        b.rows.forEach(function(rowCells) {
                           var tr = document.createElement('tr');
                           var delTd = document.createElement('td');
                           delTd.className = 'wb-row-del-cell';
                           delTd.style.cssText = 'border:1px solid var(--wb-border);';
                           delTd.innerHTML = '<button class="wb-table-row-del" data-action="del-table-row" title="Delete this row"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button>';
                           tr.appendChild(delTd);
                           if (Array.isArray(rowCells)) {
                              rowCells.forEach(function(cellHtml) {
                                 var td = document.createElement('td');
                                 td.contentEditable = 'true';
                                 td.style.cssText = 'padding:10px 14px;border:1px solid var(--wb-border);color:#ccc;outline:none;';
                                 td.innerHTML = cellHtml || '';
                                 tr.appendChild(td);
                              });
                           }
                           tbody.appendChild(tr);
                        });
                     }
                  }
               }
            }
            else if (b.type === 'divider') {
               insertBlock('divider');
            }
            else if (b.type === 'math') {
               insertBlock('math');
               var blk = editor.lastElementChild;
               if (blk && b.expr) {
                  var inp = blk.querySelector('input');
                  if (inp) inp.value = b.expr;
               }
            }
            else if (b.type === 'verse') {
               insertBlock('verse');
               var blk = editor.lastElementChild;
               if (blk && b.content) {
                  var editable = blk.querySelector('[contenteditable]');
                  if (editable) editable.innerHTML = b.content;
               }
            }
            else if (b.type === 'audio') {
               insertBlock('audio');
               var blk = editor.lastElementChild;
               if (blk && b.url) {
                  var inp = blk.querySelector('input[type="url"]');
                  if (inp) inp.value = b.url;
                  showAudioPlayer(blk, b.url);
               }
            }
            else if (b.type === 'video') {
               insertBlock('video');
               var blk = editor.lastElementChild;
               if (blk && b.url) {
                  var inp = blk.querySelector('input[type="url"]');
                  if (inp) inp.value = b.url;
                  var embedUrl = b.url;
                  var ytMatch = b.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                  if (ytMatch) embedUrl = 'https://www.youtube.com/embed/' + ytMatch[1];
                  var vimeoMatch = b.url.match(/vimeo\.com\/(\d+)/);
                  if (vimeoMatch) embedUrl = 'https://player.vimeo.com/video/' + vimeoMatch[1];
                  showVideoEmbed(blk, embedUrl);
               }
            }
         });

         return true;
      }
      window.deserializeEditorBlocks = deserializeEditorBlocks;

      // Uploads all base64 data: images and audio in editor to Cloudinary / permanent paths
      async function prepareAndUploadEditorAssets(slug) {
         var imagePayloads = [];
         var audioPayloads = [];
         var allImgs = document.querySelectorAll('.wb-editor-area img.wb-image-preview, .wb-editor-area img[src]');

         var imgJobs = Array.from(allImgs).map(function(img) {
            return new Promise(function(resolve) {
               var settled = false;
               var safetyTimer = setTimeout(function() {
                  if (!settled) { settled = true; resolve(); }
               }, 3000);

               var finish = function() {
                  if (!settled) {
                     settled = true;
                     clearTimeout(safetyTimer);
                     resolve();
                  }
               };

               var src = img.src || '';
               if (!src || src.startsWith('http') || src.startsWith('blog/')) { finish(); return; }

               if (src.startsWith('data:image/webp;base64,')) {
                  imagePayloads.push({ key: src, data: src });
                  img.dataset.assetKey = src;
                  finish();
                  return;
               }

               if (src.startsWith('data:')) {
                  var imgObj = new Image();
                  imgObj.onload = function() {
                     try {
                        var canvas = document.createElement('canvas');
                        canvas.width = imgObj.naturalWidth || imgObj.width || 800;
                        canvas.height = imgObj.naturalHeight || imgObj.height || 600;
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(imgObj, 0, 0);
                        var webpData = canvas.toDataURL('image/webp', 0.88);
                        imagePayloads.push({ key: src, data: webpData });
                        img.dataset.assetKey = src;
                     } catch(err) {
                        imagePayloads.push({ key: src, data: src });
                     }
                     finish();
                  };
                  imgObj.onerror = finish;
                  imgObj.src = src;
                  return;
               }
               finish();
            });
         });
         await Promise.all(imgJobs);

         var audioBlocks = Array.from(document.querySelectorAll('.wb-editor-area .wb-block[data-block-type="audio"]'));
         var audioJobs = audioBlocks.map(function(block) {
            return new Promise(function(resolve) {
               var settled = false;
               var safetyTimer = setTimeout(function() {
                  if (!settled) { settled = true; resolve(); }
               }, 3000);

               var finish = function() {
                  if (!settled) {
                     settled = true;
                     clearTimeout(safetyTimer);
                     resolve();
                  }
               };

               var file = block._audioFile || null;
               var blobUrl = block._audioBlobUrl || '';
               if (file) {
                  var ext = file.name.split('.').pop().toLowerCase();
                  if (!['mp3','ogg','wav','aac','flac','m4a'].includes(ext)) ext = 'mp3';
                  var reader = new FileReader();
                  reader.onloadend = function() {
                     if (reader.result) {
                        audioPayloads.push({ key: blobUrl || file.name, data: reader.result, ext: ext });
                     }
                     finish();
                  };
                  reader.onerror = finish;
                  reader.readAsDataURL(file);
                  return;
               }
               var audioEl = block.querySelector('audio');
               var src = audioEl ? (audioEl.src || '') : '';
               if (src && src.startsWith('data:')) {
                  var ext2 = src.split(';')[0].replace('data:audio/','') || 'mp3';
                  audioPayloads.push({ key: src, data: src, ext: ext2 });
               }
               finish();
            });
         });
         await Promise.all(audioJobs);

         var assetMap = {};
         if (imagePayloads.length || audioPayloads.length) {
            try {
               var fd = new FormData();
               fd.append('action', 'save_assets');
               fd.append('slug', slug || 'post');
               fd.append('images', JSON.stringify(imagePayloads));
               fd.append('audios', JSON.stringify(audioPayloads));
               
               var ctrl = new AbortController();
               var timeoutId = setTimeout(function() { ctrl.abort(); }, 15000);
               var res = await fetch('write_blog.php', { method: 'POST', body: fd, signal: ctrl.signal });
               clearTimeout(timeoutId);
               var data = await res.json();
               if (data.map) {
                  assetMap = data.map;
                  Object.entries(assetMap).forEach(function([origKey, newUrl]) {
                     allImgs.forEach(function(img) {
                        if (img.src === origKey || img.dataset.assetKey === origKey) {
                           img.src = newUrl;
                           img.removeAttribute('data-asset-key');
                        }
                     });
                     var coverUrl = document.getElementById('wb-cover-url');
                     if (coverUrl && (!coverUrl.value || coverUrl.value.startsWith('data:'))) {
                        coverUrl.value = newUrl;
                     }
                  });
               }
            } catch(e) { console.error('Asset upload failed or timed out:', e); }
         }
         return assetMap;
      }
      window.prepareAndUploadEditorAssets = prepareAndUploadEditorAssets;

      function buildContentHTML() {
         var sections = [];
         var blocks = document.querySelectorAll('#wb-editor .wb-block');
         var skipIds = ['block-heading-default', 'block-image-default', 'block-meta-default', 'block-tags-default'];

         // 1. Embed structured block metadata for lossless editing restoration
         var serialized = serializeEditorBlocks();
         var metaComment = '<!-- WB_BLOCKS_DATA: ' + encodeURIComponent(JSON.stringify(serialized)) + ' -->\n';

         blocks.forEach(function (block) {
            if (skipIds.includes(block.id)) return; // Skip top default metadata blocks

            var type = block.dataset.blockType;

         // -- Heading --
         if (type === 'heading') {
            var level = block.querySelector('.heading-level')?.value || 'h2';
            var text  = block.querySelector('.wb-heading-content')?.innerHTML?.trim() || '';
            if (!text) return;

            var classMap = {
               h1: 'fs-50 tp-text-common-white fs-sm-40 fs-xs-30 lh-120-per mb-55',
               h2: 'fw-500 tp-text-common-white fs-35 lh-130-per mb-25',
               h3: 'fw-500 tp-text-common-white fs-25 lh-130-per mb-20',
               h4: 'fw-500 tp-text-common-white fs-25 lh-130-per mb-20'
            };
            var cls      = classMap[level] || classMap.h2;
            var anchorId = text.replace(/<[^>]*>/g, '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            sections.push('<' + level + ' id="' + anchorId + '" class="' + cls + '">' + text + '</' + level + '>');
         }

         // -- Author Meta Info --
         if (type === 'meta') {
            var author   = block.querySelector('[data-meta="author"]')?.value?.trim()   || '';
            var date     = block.querySelector('[data-meta="date"]')?.value?.trim()     || '';
            var readtime = block.querySelector('[data-meta="readtime"]')?.value?.trim() || '';
            if (!author && !date) return;

            var initials = author.split(' ').map(function (w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
            sections.push(
               '<div class="tp-blog-details-link-wrap mb-25">' +
               '<div class="tp-blog-details-dates" style="display:flex;align-items:center;gap:12px;">' +
               '<div style="width:40px;height:40px;border-radius:50%;background:rgba(245,96,4,0.15);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#f56004;">' + initials + '</div>' +
               '<div>' +
               (author ? '<span class="tp-text-common-white fw-600" style="font-size:14px;">' + author + '</span>' : '') +
               (date || readtime ? '<div style="display:flex;gap:12px;margin-top:4px;">' +
                  (date ? '<span style="font-size:12px;color:#888;">' + date + '</span>' : '') +
                  (readtime ? '<span style="font-size:12px;color:#666;">· ' + readtime + '</span>' : '') +
                  '</div>' : '') +
               '</div>' +
               '</div></div>'
            );
         }

         // -- Tags --
         if (type === 'tags') {
            var tags = Array.from(block.querySelectorAll('.wb-tag, .wb-tag-chip')).map(function (chip) {
               var clone = chip.cloneNode(true);
               var btn = clone.querySelector('.wb-tag-remove, .wb-tag-chip-remove, button');
               if (btn) btn.remove();
               return clone.textContent.trim();
            }).filter(Boolean);
            if (!tags.length) return;
            var tagHtml = tags.map(function (t) { return '<li><a href="#">' + t + '</a></li>'; }).join('');
            sections.push('<div class="tp-blog-details-tag-wrap mb-30"><div class="tp-blog-details-tag"><ul>' + tagHtml + '</ul></div></div>');
         }

         // -- Featured Image --
         if (type === 'image') {
            var imgEl   = block.querySelector('.wb-image-preview');
            var caption = block.querySelector('.wb-image-caption')?.value?.trim() || '';
            var src     = imgEl?.src || '';
            if (!src || imgEl?.style.display === 'none') return;
            sections.push(
               '<div class="tp-blog-banner-area mb-50" style="border-radius:12px;overflow:hidden;">' +
               '<img class="w-100" src="' + src + '" alt="' + (caption || 'Blog image') + '" style="width:100%;display:block;">' +
               (caption ? '<p class="fs-18 tp-text-grey-2 lh-150-per mb-20" style="color:rgba(255,255,255,0.7);">' + caption + '</p>' : '') +
               '</div>'
            );
         }

         // -- Paragraph --
         if (type === 'paragraph') {
            var contentEl = block.querySelector('.wb-paragraph-content');
            var html = contentEl?.innerHTML?.trim() || '';
            if (!html) return;

            // Ensure <a> tags have proper targets & styles
            var tmp = document.createElement('div');
            tmp.innerHTML = html;
            tmp.querySelectorAll('a').forEach(function(a) {
               a.setAttribute('target', '_blank');
               a.setAttribute('rel', 'noopener noreferrer');
               a.style.color = '#f56004';
               a.style.textDecoration = 'underline';
               a.style.fontWeight = '600';
            });
            html = tmp.innerHTML;

            var inlineStyle = 'color:rgba(255,255,255,0.7) !important;';
            var textAlign = contentEl.style.textAlign || 'justify';
            inlineStyle += 'text-align:' + textAlign + ';';
            if (contentEl.style.paddingLeft) inlineStyle += 'padding-left:' + contentEl.style.paddingLeft + ';';

            sections.push('<div class="fs-18 tp-text-grey-2 lh-150-per mb-20" style="' + inlineStyle + '">' + html + '</div>');
         }

         // -- Blockquote --
         if (type === 'blockquote') {
            var text = block.querySelector('blockquote')?.innerHTML?.trim() || '';
            if (!text) return;
            sections.push(
               '<blockquote class="tp-blog-details-blockquote mb-40" style="border-left:3px solid #f56004;padding:20px 30px;background:rgba(245,96,4,0.05);border-radius:0 8px 8px 0;margin:30px 0;">' +
               '<p class="fs-20 lh-150-per tp-text-grey-2 mb-0" style="font-style:italic;">' + text + '</p>' +
               '</blockquote>'
            );
         }

         // -- Lists --
         if (type === 'list') {
            var ulEnabled = block.querySelector('.wb-ul-enabled')?.checked;
            var olEnabled = block.querySelector('.wb-ol-enabled')?.checked;
            var listWrap  = '';

            if (ulEnabled) {
               var ulItems = block.querySelectorAll('.wb-editable-ul li');
               if (ulItems.length > 0) {
                  listWrap += '<ul style="list-style:none;padding:0;margin:0 0 16px 0;">';
                  ulItems.forEach(function(li) {
                     var text = li.querySelector('[contenteditable]')?.innerHTML || li.innerText.trim();
                     listWrap += '<li style="display:flex;align-items:flex-start;gap:10px;color:rgba(255,255,255,0.75);margin-bottom:10px;font-size:17px;line-height:1.6;">' +
                        '<span style="color:#f56004;margin-top:4px;flex-shrink:0;">&#8226;</span>' +
                        '<span>' + text + '</span></li>';
                  });
                  listWrap += '</ul>';
               }
            }

            if (olEnabled) {
               var olItems = block.querySelectorAll('.wb-editable-ol li');
               if (olItems.length > 0) {
                  var olCounter = 0;
                  listWrap += '<ol style="list-style:none;padding:0;margin:0 0 16px 0;">';
                  olItems.forEach(function(li) {
                     olCounter++;
                     var text = li.querySelector('[contenteditable]')?.innerHTML || li.innerText.trim();
                     listWrap += '<li style="display:flex;align-items:flex-start;gap:10px;color:rgba(255,255,255,0.75);margin-bottom:10px;font-size:17px;line-height:1.6;">' +
                        '<span style="color:#f56004;font-weight:700;flex-shrink:0;min-width:20px;">' + olCounter + '.</span>' +
                        '<span>' + text + '</span></li>';
                  });
                  listWrap += '</ol>';
               }
            }

            if (listWrap) {
               sections.push('<div class="mb-30">' + listWrap + '</div>');
            }
         }
               
         // -- Code Block --
         if (type === 'code') {
            var inlineCode = block.querySelector('.wb-inline-code')?.value?.trim() || '';
            var lang       = block.querySelector('.wb-code-lang')?.value           || '';
            var code       = block.querySelector('.wb-code-textarea')?.value?.trim() || '';
            var codeHTML   = '';

            if (inlineCode) {
               codeHTML += '<p class="mb-15"><code style="background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:4px;font-family:monospace;font-size:14px;color:#f56004;">' +
                  inlineCode.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></p>';
            }

            if (code) {
               var escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, '\\`').replace(/\$/g, '\\$');
               var copyBtnId   = 'copy-btn-' + Math.random().toString(36).slice(2, 8);
               codeHTML +=
                  '<div class="tp-blog-code-block mb-35" style="position:relative;">' +
                  (lang ? '<span style="position:absolute;top:10px;left:16px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">' + lang + '</span>' : '') +
                  '<button id="' + copyBtnId + '" onclick="(function(btn){' +
                     'var raw = btn.closest(\'div\').querySelector(\'code\').innerText;' +
                     'navigator.clipboard.writeText(raw).then(function(){' +
                        'btn.innerHTML=\'<i class=&quot;fa fa-check&quot;></i> Copied!\';btn.style.color=\'#f56004\';' +
                        'setTimeout(function(){btn.innerHTML=\'<i class=&quot;fa fa-copy&quot;></i> Copy\';btn.style.color=\'#f56004\';},2000);' +
                     '}).catch(function(){btn.innerHTML=\'<i class=&quot;fa fa-times&quot;></i> Failed\';btn.style.color=\'#ff4d4f\';setTimeout(function(){btn.innerHTML=\'<i class=&quot;fa fa-copy&quot;></i> Copy\';btn.style.color=\'\';},2000);});' +
                  '})(this)" style="position:absolute;top:8px;right:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:#aaa;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;"><i class="fa fa-copy"></i></button>' +
                  '<pre style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:24px;' + (lang ? 'padding-top:36px;' : '') + 'overflow-x:auto;margin:0;">' +
                  '<code style="font-family:\'Courier New\',monospace;font-size:14px;color:#ccc;line-height:1.7;">' + escapedCode + '</code>' +
                  '</pre></div>';
            }
            
            if (codeHTML) sections.push(codeHTML);
         }

         // -- Data Table --
         if (type === 'table') {
            var tableEl = block.querySelector('.wb-editable-table');
            if (!tableEl) return;

            // Skip first th (wb-col-del-th control corner), extract only text from contenteditable span
            var headers = Array.from(tableEl.querySelectorAll('thead th'))
               .filter(function(th) { return !th.classList.contains('wb-col-del-th'); })
               .map(function(th) {
                  var text = th.querySelector('[contenteditable]')?.innerHTML?.trim() || th.textContent.trim();
                  return '<th style="background:rgba(245,96,4,0.1);color:#f56004;padding:12px 16px;text-align:left;font-size:13px;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.08);">' + text + '</th>';
               }).join('');

            var rows = Array.from(tableEl.querySelectorAll('tbody tr'))
               .map(function(tr) {
                  var cells = Array.from(tr.querySelectorAll('td'))
                     .filter(function(td) { return !td.classList.contains('wb-row-del-cell'); })
                     .map(function(td) {
                        return '<td style="padding:12px 16px;color:#ccc;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.05);">' + td.innerHTML.trim() + '</td>';
                     }).join('');
                  return '<tr>' + cells + '</tr>';
               }).join('');

            if (headers) {
               sections.push(
                  '<div class="tp-blog-table-wrap mb-40" style="overflow-x:auto;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">' +
                  '<table style="width:100%;border-collapse:collapse;"><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table>' +
                  '</div>'
               );
            }
         }

         // -- Divider --
         if (type === 'divider') {
            sections.push('<hr style="border:2px solid #f56004; margin:50px 0;">');
         }

         // -- Math --
         if (type === 'math') {
            var expr = block.querySelector('input')?.value?.trim() || '';
            if (!expr) return;
            var mathHTML;
            if (typeof katex !== 'undefined') {
               try {
                  mathHTML = katex.renderToString(expr, { throwOnError: false, displayMode: true });
               } catch(e) {
                  mathHTML = '<code>' + expr + '</code>';
               }
            } else {
               mathHTML = '<code>' + expr + '</code>';
            }
            sections.push(
               '<div class="mb-30" style="text-align:center;padding:16px 0;">' + mathHTML + '</div>'
            );
         }

         // -- Verse --
         if (type === 'verse') {
            var text = block.querySelector('[contenteditable]')?.innerHTML?.trim() || '';
            if (!text) return;
            sections.push(
               '<pre style="font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:2;color:#ccc;white-space:pre-wrap;margin:0 0 30px;padding:20px;border-left:2px solid rgba(255,255,255,0.1);">' + text + '</pre>'
            );
         }

         // -- Audio --
         if (type === 'audio') {
            var audioUrl = block.querySelector('input[type="url"]')?.value?.trim() || '';
            var audioEl  = block.querySelector('audio');
            var audioSrc = audioUrl || (audioEl && audioEl.src) || '';
            if (!audioSrc || audioSrc === window.location.href) return;
            sections.push('<div class="mb-30"><audio controls style="width:100%;border-radius:4px;" src="' + audioSrc + '"></audio></div>');
         }

         // -- File --
         if (type === 'file') {
            var label = block.querySelectorAll('input')[0]?.value?.trim() || 'Download File';
            var url   = block.querySelectorAll('input')[1]?.value?.trim() || '#';
            if (url === '#') return;
            sections.push(
               '<div class="mb-30">' +
               '<a href="' + url + '" download style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#ccc;text-decoration:none;font-size:14px;">' +
               '<i class="fa-regular fa-file-arrow-down" style="color:#f56004;"></i>' + label +
               '</a></div>'
            );
         }

         // -- Video --
         if (type === 'video') {
            var iframe = block.querySelector('iframe');
            var videoEl = block.querySelector('video');
            var src = iframe?.src || videoEl?.src || block.querySelector('input[type="url"]')?.value?.trim() || '';
            if (!src) return;

            if (iframe) {
               sections.push(
                  '<div class="mb-40" style="aspect-ratio:16/9;border-radius:6px;overflow:hidden;">' +
                  '<iframe src="' + src + '" style="width:100%;height:100%;border:none;" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>' +
                  '</div>'
               );
            } else if (videoEl) {
               sections.push(
                  '<div class="mb-40" style="border-radius:6px;overflow:hidden;">' +
                  '<video controls style="width:100%;border-radius:6px;" src="' + src + '"></video>' +
                  '</div>'
               );
            }
         }
      });

      var bodyHtml = sections.join('\n');
      var blocksJson = getBlocksJSON();
      return '<!-- WB_BLOCKS_DATA: ' + blocksJson + ' -->\n' + bodyHtml;
   }

   // ==========================================================================
   // #region SECTION_13_PUBLISH
   // Database-Driven Publishing Pipeline:
   //   Step 1 — Convert all images to WebP in-browser & upload assets to Cloudinary/local
   //   Step 2 — Build content HTML with embedded lossless WB_BLOCKS_DATA metadata
   //   Step 3 — Save post to Supabase database (posts table) and sync blog.html card
   // ==========================================================================

   // ==========================================================================
   // DELETE POST — removes post from Supabase DB and blog.html card
   // Usage: deletePost('my-post-slug')
   // ==========================================================================
   window.deletePost = async function(slug) {
      if (!slug) { showToast('No slug provided', 'error'); return; }
      if (!confirm('Delete "' + slug + '" from database and blog list?')) return;
      try {
         var res  = await fetch('write_blog.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_post', slug: slug })
         });
         var data = await res.json();
         if (data.success) {
            showToast('✅ Post deleted successfully!', 'success');
            var card = document.querySelector('[data-manage-slug="' + slug + '"]');
            if (card) card.remove();
         } else {
            showToast('Delete issue: ' + (data.errors||[]).join(', '), 'error');
         }
      } catch(e) { showToast('Delete error: ' + e.message, 'error'); }
   };

   var isPublishing = false;
   window.publishPost = async function () {
      if (isPublishing) {
         showToast('⏳ Publishing in progress. Please wait...', 'info');
         return;
      }

      // -- 1. Validate heading ----------------------------------------
      var headingEl = document.querySelector('#block-heading-default .wb-heading-content');
      var heading   = headingEl ? headingEl.innerText.trim() : '';
      if (!heading) { showToast('Please add a heading before publishing!', 'error'); return; }

      // -- 2. Validate / auto-generate slug ---------------------------
      var slugInput = document.getElementById('wb-slug');
      var slug      = slugInput ? slugInput.value.trim() : '';
      if (!slug) {
         slug = heading.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
         if (slugInput) slugInput.value = slug;
      }
      // Always force-sanitize
      slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (slugInput) slugInput.value = slug;
      if (!slug) { showToast('Please enter a slug or add a heading first!', 'error'); return; }

      isPublishing = true;
      var publishBtns = document.querySelectorAll('.wb-btn-publish');
      publishBtns.forEach(function(b) {
         b.disabled = true;
         b.style.opacity = '0.65';
         b.style.pointerEvents = 'none';
      });

      var badge = document.getElementById('wb-status-badge');
      if (badge) { badge.textContent = 'Publishing...'; badge.className = 'wb-status-badge'; }

      try {
         // -- 3. Convert images to WebP and upload assets ----------------
         if (typeof prepareAndUploadEditorAssets === 'function') {
            try {
               await prepareAndUploadEditorAssets(slug);
            } catch(e) {
               console.error('Asset upload in publish failed:', e);
            }
         }

         // Determine cover image and tags
         var coverImage = (typeof getFeaturedImage === 'function') ? getFeaturedImage() : '';
         var editorTags = (typeof getTagsFromEditor === 'function') ? getTagsFromEditor() : [];
         var category   = [...document.querySelectorAll('.wb-hero-category:checked')].map(el => el.value).join(', ') || 'General';
         var isScheduled = document.getElementById('wb-schedule-check')?.checked || false;
         var scheduleRaw = document.getElementById('wb-schedule-date')?.value || '';
         var publishDate = isScheduled && scheduleRaw
            ? scheduleRaw.slice(0, 10)
            : new Date().toISOString().slice(0, 10);

         var readTime = (
            document.getElementById('wb-read-time')?.value?.trim()              ||
            document.getElementById('wb-readtime')?.value?.trim()               ||
            document.querySelector('input[name="readtime"]')?.value?.trim()     ||
            document.querySelector('[data-meta="readtime"]')?.value?.trim()      ||
            document.querySelector('.wb-read-time')?.innerText?.trim()          ||
            document.querySelector('.wb-meta-readtime')?.innerText?.trim()      ||
            ''
         );
         if (!readTime) {
            var _wc = (document.querySelector('.wb-editor-area')?.innerText || '').trim().split(/\s+/).filter(Boolean).length;
            readTime = Math.max(1, Math.round(_wc / 200)) + ' min read';
         }

         var contentBodyHtml = (typeof buildContentHTML === 'function') ? buildContentHTML() : '';

         // -- 4. Update Supabase DB + blog.html card ---------------------
         var ctrl = new AbortController();
         var fetchTimer = setTimeout(function() { ctrl.abort(); }, 20000);
         var res = await fetch('write_blog.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            signal:  ctrl.signal,
            body:    JSON.stringify({
               action:        'add_to_index',
               post_id:       window.currentPostId,
               heading:       heading,
               slug:          slug,
               content:       contentBodyHtml,
               excerpt:       document.getElementById('wb-excerpt')?.value?.trim() || '',
               meta_title:    document.getElementById('wb-meta-title')?.value?.trim() || heading,
               meta_desc:     document.getElementById('wb-meta-desc')?.value?.trim() || '',
               focus_keyword: document.getElementById('wb-focus-keyword')?.value?.trim() || '',
               category:      category,
               categories:    [...document.querySelectorAll('.wb-hero-category:checked')].map(el => el.value),
               tags:          editorTags,
               author:        document.querySelector('#block-meta-default [data-meta="author"]')?.value?.trim() || 'HIRE X PRO',
               publishDate:   publishDate,
               image:         coverImage,
               readTime:      readTime,
               scheduled:     isScheduled
            })
         });
         clearTimeout(fetchTimer);
         var d = await res.json();
         if (d.success) {
            if (d.post_id) {
               window.currentPostId = d.post_id;
            }
            if (slug && (!window.INITIAL_EDIT_POST || window.INITIAL_EDIT_POST.slug !== slug)) {
               try {
                  window.history.replaceState({}, '', 'write_blog.php?edit=' + encodeURIComponent(slug));
               } catch(e) {}
            }
            if (badge) { badge.textContent = 'Published ✓'; badge.className = 'wb-status-badge published'; }
            showToast('🎉 Post published to database successfully!', 'success');
         } else {
            showToast('Save failed: ' + (d.error || 'Check database connection'), 'error');
            if (badge) badge.textContent = 'Error';
         }
      } catch (err) {
         showToast('Publish error: ' + err.message, 'error');
         if (badge) badge.textContent = 'Error';
      } finally {
         isPublishing = false;
         publishBtns.forEach(function(b) {
            b.disabled = false;
            b.style.opacity = '1';
            b.style.pointerEvents = 'auto';
         });
      }
   };

   // ==========================================================================
   // #region SAVE_DRAFT & DISCARD_DRAFT
   // ==========================================================================
   var isSavingDraft = false;
   window.saveDraft = async function () {
      if (isSavingDraft) {
         showToast('⏳ Saving draft in progress. Please wait...', 'info');
         return;
      }

      var headingEl = document.querySelector('#block-heading-default .wb-heading-content');
      var heading = headingEl ? headingEl.innerText.trim() : '';

      var slugInput = document.getElementById('wb-slug');
      var slug = slugInput ? slugInput.value.trim() : '';
      if (!slug && heading) {
         slug = heading.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
         if (slugInput) slugInput.value = slug;
      }
      if (!slug) {
         slug = 'draft-' + Date.now();
         if (slugInput) slugInput.value = slug;
      }
      slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

      isSavingDraft = true;
      var draftBtns = document.querySelectorAll('.wb-btn-draft');
      draftBtns.forEach(function(b) {
         b.disabled = true;
         b.style.opacity = '0.65';
         b.style.pointerEvents = 'none';
      });

      var badge = document.getElementById('wb-status-badge');
      if (badge) { badge.textContent = 'Saving Draft...'; badge.className = 'wb-status-badge'; }

      try {
         // Upload and convert any new base64 images/audios to permanent Cloudinary/local URLs
         if (typeof prepareAndUploadEditorAssets === 'function') {
            try {
               await prepareAndUploadEditorAssets(slug);
            } catch(e) {
               console.error('Asset upload in draft failed:', e);
            }
         }

         var excerpt = document.getElementById('wb-excerpt')?.value || '';
         var metaTitle = document.getElementById('wb-meta-title')?.value || (heading || slug);
         var metaDesc = document.getElementById('wb-meta-desc')?.value || excerpt;
         var focusKeyword = document.getElementById('wb-focus-keyword')?.value || '';
         var author = document.querySelector('#block-meta-default [data-meta="author"]')?.value || 'HIRE X PRO';
         var readTime = document.getElementById('wb-reading-time')?.textContent?.replace('~', '').trim() || '1 min read';
         var categories = Array.from(document.querySelectorAll('.wb-category-list input:checked')).map(function(c) { return c.value; });
         if (!categories.length) categories = ['Technology'];

         var tags = (typeof getTagsFromEditor === 'function') ? getTagsFromEditor() : [];
         var coverImage = (typeof getFeaturedImage === 'function') ? getFeaturedImage() : 'https://res.cloudinary.com/ojaeefvp/image/upload/v1789066214/hirexpro/brands/b_1.webp';
         var contentBodyHtml = (typeof buildContentHTML === 'function') ? buildContentHTML() : '';

         // Save Draft directly to Supabase DB (status: 'draft') with content and block metadata
         var ctrl = new AbortController();
         var fetchTimer = setTimeout(function() { ctrl.abort(); }, 20000);
         var res = await fetch('write_blog.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal:  ctrl.signal,
            body: JSON.stringify({
               action: 'save_draft',
               post_id: window.currentPostId,
               title: heading || 'Untitled Draft',
               slug: slug,
               content: contentBodyHtml,
               excerpt: excerpt,
               featured_image: coverImage,
               author: author,
               reading_time: readTime,
               categories: categories,
               tags: tags,
               meta_title: metaTitle,
               meta_desc: metaDesc,
               focus_keyword: focusKeyword
            })
         });
         clearTimeout(fetchTimer);
         var data = await res.json();
         if (data.success) {
            if (data.post_id) {
               window.currentPostId = data.post_id;
            }
            if (slug && (!window.INITIAL_EDIT_POST || window.INITIAL_EDIT_POST.slug !== slug)) {
               try {
                  window.history.replaceState({}, '', 'write_blog.php?edit=' + encodeURIComponent(slug));
               } catch(e) {}
            }
            if (badge) { badge.textContent = 'Draft Saved ✓'; badge.className = 'wb-status-badge draft'; }
            showToast('✅ Draft saved to database!', 'success');
         } else {
            showToast('Draft save issue: ' + (data.error || 'Check database'), 'error');
         }
      } catch(e) {
         showToast('Draft save failed: ' + e.message, 'error');
      } finally {
         isSavingDraft = false;
         draftBtns.forEach(function(b) {
            b.disabled = false;
            b.style.opacity = '1';
            b.style.pointerEvents = 'auto';
         });
      }
   };

   window.discardDraft = function () {
      wbConfirm(
         'Discard Changes?',
         'Are you sure you want to discard your unsaved draft changes? This will reset the editor.',
         '🗑️',
         function () {
            localStorage.removeItem('wb_autosave_data');
            var slug = document.getElementById('wb-slug')?.value;
            if (slug && window.INITIAL_EDIT_POST) {
               window.location.reload();
            } else {
               window.location.href = 'write_blog.php';
            }
         },
         null,
         'danger'
      );
   };
   // #endregion SAVE_DRAFT & DISCARD_DRAFT

   // ==========================================================================
   // #region DRAFTS_MODAL_SYSTEM
   // Fetches all drafts from Supabase DB and displays an interactive modal
   // where the user can open any draft to edit or delete it.
   // ==========================================================================
   window.openDraftsModal = async function () {
      showToast('Loading saved drafts...', 'info');
      try {
         var fd = new FormData();
         fd.append('action', 'get_drafts');
         var res = await fetch('write_blog.php', { method: 'POST', body: fd });
         var data = await res.json();
         var drafts = data.data || [];

         var modalHtml = '<div style="max-height:360px;overflow-y:auto;margin-top:12px;text-align:left;">';
         if (!drafts.length) {
            modalHtml += '<p style="color:#a1a1aa;text-align:center;padding:24px 0;">No saved drafts found.<br><small style="color:#71717a;">Click "Save Draft" in the top bar to save your work here.</small></p>';
         } else {
            modalHtml += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
            drafts.forEach(function(d) {
               var dateStr = d.updated_at ? new Date(d.updated_at).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';
               modalHtml += '<tr style="border-bottom:1px solid rgba(255,255,255,0.08);padding:8px 0;">' +
                  '<td style="padding:10px 8px;"><strong style="color:#fff;font-size:13px;display:block;">' + (d.title || 'Untitled Draft') + '</strong><small style="color:#f59e0b;">/' + d.slug + ' &bull; ' + dateStr + '</small></td>' +
                  '<td style="text-align:right;white-space:nowrap;padding:10px 8px;">' +
                     '<a href="write_blog.php?edit=' + encodeURIComponent(d.slug) + '" class="wb-btn" style="padding:5px 12px;font-size:11px;background:#f56004;color:#fff;border-radius:4px;text-decoration:none;margin-right:6px;display:inline-block;"><i class="fa-solid fa-pen-to-square"></i> Edit</a>' +
                     '<button onclick="window.deleteDraftPost(\'' + d.slug + '\')" class="wb-btn" style="padding:5px 8px;font-size:11px;background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:4px;cursor:pointer;"><i class="fa-solid fa-trash"></i></button>' +
                  '</td>' +
               '</tr>';
            });
            modalHtml += '</table>';
         }
         modalHtml += '</div>';

         _showModal('📂', 'Saved Blog Drafts (' + drafts.length + ')', modalHtml, 'Close', '', false);
         document.getElementById('wb-modal-body').innerHTML = modalHtml;
      } catch (e) {
         showToast('Failed to load drafts: ' + e.message, 'error');
      }
   };

   window.deleteDraftPost = async function (slug) {
      if (!confirm('Delete draft "' + slug + '" from database?')) return;
      try {
         var res = await fetch('write_blog.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_post', slug: slug })
         });
         var data = await res.json();
         if (data.success) {
            showToast('Draft deleted successfully');
            _closeModal();
            setTimeout(window.openDraftsModal, 200);
         } else {
            showToast('Failed to delete draft', 'error');
         }
      } catch (e) {
         showToast('Error: ' + e.message, 'error');
      }
   };
   // #endregion DRAFTS_MODAL_SYSTEM


   // ======================================================
   // #region DYNAMIC_HEADER_TITLE_LOGIC
   // Syncs the header title with the Main Title input in
   // real-time. Shows 'New Draft' (faded) when empty.
   // ======================================================

   (function initDynamicTitle() {
      var dynamicTitle = document.getElementById('wb-dynamic-title');
      var headingBlock  = document.querySelector('#block-heading-default .wb-heading-content');

      if (!dynamicTitle || !headingBlock) return;

      function syncTitle() {
         var text = headingBlock.innerText.trim();
         if (text) {
            // User has typed something — show it normally
            dynamicTitle.textContent = text;
            dynamicTitle.classList.remove('is-placeholder');
         } else {
            // Empty — show placeholder text in low opacity
            dynamicTitle.textContent = 'New Draft';
            dynamicTitle.classList.add('is-placeholder');
         }
      }

      // Listen for every keystroke inside the heading block
      headingBlock.addEventListener('input', syncTitle);

      // Run once on load to set initial state
      syncTitle();
   })();

   // ======================================================
   // #endregion DYNAMIC_HEADER_TITLE_LOGIC
   // ======================================================

   // ======================================================
   // #region RESPONSIVE_DRAWER_AND_TOGGLE_JS
   // Handles both Desktop column collapses and Mobile/Tablet
   // slide-over drawers with backdrop and smooth animations.
   // ======================================================

   function closeAllDrawers() {
      document.body.classList.remove('wb-left-drawer-open', 'wb-right-drawer-open', 'wb-drawer-open');
      var backdrop = document.getElementById('wb-backdrop');
      if (backdrop) backdrop.classList.remove('active');

      var leftBtn = document.getElementById('wb-left-toggle');
      if (leftBtn && window.innerWidth <= 1100) {
         leftBtn.classList.remove('active');
         leftBtn.setAttribute('aria-pressed', 'false');
      }
      var rightBtn = document.getElementById('wb-right-toggle');
      if (rightBtn && window.innerWidth <= 1100) {
         rightBtn.classList.remove('active');
         rightBtn.setAttribute('aria-pressed', 'false');
      }
   }
   window.wbCloseAllDrawers = closeAllDrawers;

   function openLeftDrawer() {
      document.body.classList.remove('wb-right-drawer-open');
      document.body.classList.add('wb-left-drawer-open', 'wb-drawer-open');
      var backdrop = document.getElementById('wb-backdrop');
      if (backdrop) backdrop.classList.add('active');

      var leftBtn = document.getElementById('wb-left-toggle');
      if (leftBtn) {
         leftBtn.classList.add('active');
         leftBtn.setAttribute('aria-pressed', 'true');
      }
      var rightBtn = document.getElementById('wb-right-toggle');
      if (rightBtn) {
         rightBtn.classList.remove('active');
         rightBtn.setAttribute('aria-pressed', 'false');
      }
   }

   function openRightDrawer() {
      document.body.classList.remove('wb-left-drawer-open');
      document.body.classList.add('wb-right-drawer-open', 'wb-drawer-open');
      var backdrop = document.getElementById('wb-backdrop');
      if (backdrop) backdrop.classList.add('active');

      var rightBtn = document.getElementById('wb-right-toggle');
      if (rightBtn) {
         rightBtn.classList.add('active');
         rightBtn.setAttribute('aria-pressed', 'true');
      }
      var leftBtn = document.getElementById('wb-left-toggle');
      if (leftBtn) {
         leftBtn.classList.remove('active');
         leftBtn.setAttribute('aria-pressed', 'false');
      }
   }

   (function initResponsiveDrawersAndToggles() {
      var leftBtn    = document.getElementById('wb-left-toggle');
      var rightBtn   = document.getElementById('wb-right-toggle');
      var leftClose  = document.getElementById('wb-left-close');
      var rightClose = document.getElementById('wb-right-close');
      var backdrop   = document.getElementById('wb-backdrop');
      var fab        = document.getElementById('wb-mobile-insert-fab');
      var main       = document.querySelector('.wb-main');
      var sidebar    = document.querySelector('.wb-sidebar');

      // Left Toggle Button
      if (leftBtn) {
         leftBtn.addEventListener('click', function () {
            if (window.innerWidth <= 1100) {
               // Mobile/Tablet Drawer Mode
               if (document.body.classList.contains('wb-left-drawer-open')) {
                  closeAllDrawers();
               } else {
                  openLeftDrawer();
               }
            } else {
               // Desktop Inline Collapse Mode
               if (!main) return;
               var isCollapsed = main.classList.toggle('wb-left-collapsed');
               leftBtn.classList.toggle('active', isCollapsed);
               leftBtn.setAttribute('aria-pressed', isCollapsed ? 'true' : 'false');
               showToast(isCollapsed ? 'Insert panel hidden' : 'Insert panel shown');
            }
         });
      }

      // Right Toggle Button
      if (rightBtn) {
         rightBtn.addEventListener('click', function () {
            if (window.innerWidth <= 1100) {
               // Mobile/Tablet Drawer Mode
               if (document.body.classList.contains('wb-right-drawer-open')) {
                  closeAllDrawers();
               } else {
                  openRightDrawer();
               }
            } else {
               // Desktop Claude-Style Icon-Only Mode
               if (!main || !sidebar) return;
               var isIconOnly = sidebar.classList.toggle('wb-sidebar-icon-only');
               main.classList.toggle('wb-right-icon-only', isIconOnly);
               main.classList.toggle('wb-right-collapsed', false);

               rightBtn.classList.toggle('active', isIconOnly);
               rightBtn.setAttribute('aria-pressed', isIconOnly ? 'true' : 'false');
               showToast(isIconOnly ? 'Settings panel collapsed' : 'Settings panel expanded');
            }
         });
      }

      // Mobile FAB
      if (fab) {
         fab.addEventListener('click', function () {
            openLeftDrawer();
         });
      }

      // Close buttons inside drawers
      if (leftClose)  leftClose.addEventListener('click', closeAllDrawers);
      if (rightClose) rightClose.addEventListener('click', closeAllDrawers);
      if (backdrop)   backdrop.addEventListener('click', closeAllDrawers);

      // Escape key closes drawers
      document.addEventListener('keydown', function (e) {
         if (e.key === 'Escape') {
            closeAllDrawers();
         }
      });

      // Window resize handler: clean up state when crossing breakpoint
      window.addEventListener('resize', function () {
         if (window.innerWidth > 1100) {
            closeAllDrawers();
         }
      });
   })();

   // ======================================================
   // #region EDIT_EXISTING_POST_AUTO_POPULATE
   // When opened via write_blog.php?edit=some-slug,
   // pre-populates the editor with post metadata, image,
   // author info, tags, and all body content blocks.
   // ======================================================
   window.INITIAL_EDIT_POST = <?php echo json_encode($editPostData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE); ?>;

   if (window.INITIAL_EDIT_POST) {
      setTimeout(function() {
         var p = window.INITIAL_EDIT_POST;

         // 1. Main Heading
         var headingEl = document.querySelector('#block-heading-default .wb-heading-content');
         if (headingEl && p.title) {
            headingEl.innerText = p.title;
            headingEl.dispatchEvent(new Event('input', { bubbles: true }));
         }

         // 2. Slug
         var slugEl = document.getElementById('wb-slug');
         if (slugEl && p.slug) slugEl.value = p.slug;

         // 3. Status & Dates
         if (p.status) {
            var statusEl = document.getElementById('wb-post-status');
            if (statusEl) statusEl.value = p.status;
         }
         if (p.created_at) {
            var pubDateEl = document.getElementById('wb-publish-date');
            if (pubDateEl) pubDateEl.value = p.created_at.slice(0, 10);
         }

         // 4. Excerpt
         var excerptEl = document.getElementById('wb-excerpt');
         if (excerptEl && p.excerpt) excerptEl.value = p.excerpt;

         // 5. SEO fields
         var metaTitleEl = document.getElementById('wb-meta-title');
         if (metaTitleEl && p.meta_title) metaTitleEl.value = p.meta_title;

         var metaDescEl = document.getElementById('wb-meta-desc');
         if (metaDescEl && p.meta_desc) {
            metaDescEl.value = p.meta_desc;
            var descCount = document.getElementById('wb-meta-desc-count');
            if (descCount) descCount.textContent = p.meta_desc.length + ' / 160';
         }

         var focusKeywordEl = document.getElementById('wb-focus-keyword');
         if (focusKeywordEl && p.focus_keyword) focusKeywordEl.value = p.focus_keyword;

         // 6. Author Name & Reading Time
         var authorInput = document.querySelector('#block-meta-default [data-meta="author"]');
         if (authorInput && p.author) {
            authorInput.value = p.author;
            authorInput.dispatchEvent(new Event('input', { bubbles: true }));
         }
         var readtimeInput = document.querySelector('#block-meta-default [data-meta="readtime"]');
         if (readtimeInput && p.reading_time) {
            readtimeInput.value = p.reading_time;
         }

         // 7. Categories
         if (p.categories) {
            var catArr = Array.isArray(p.categories) ? p.categories : [p.categories];
            document.querySelectorAll('.wb-category-list input, .wb-hero-category').forEach(function(cb) {
               cb.checked = catArr.includes(cb.value);
            });
         }

         // 8. Tags block
         if (p.tags && Array.isArray(p.tags) && p.tags.length) {
            if (typeof setTagsInEditor === 'function') {
               setTagsInEditor(p.tags);
            } else {
               var tagsContainer = document.querySelector('#block-tags-default [data-tags-container]');
               if (tagsContainer) {
                  tagsContainer.innerHTML = '';
                  p.tags.forEach(function(tag) {
                     if (!tag) return;
                     var chip = document.createElement('span');
                     chip.className = 'wb-tag';
                     chip.innerHTML = tag + '<button type="button" class="wb-tag-remove" title="Remove tag">&times;</button>';
                     chip.querySelector('.wb-tag-remove').addEventListener('click', function () { chip.remove(); });
                     tagsContainer.appendChild(chip);
                  });
               }
            }
         }

         // 9. Cover / Featured Image
         if (p.featured_image) {
            var coverPreview = document.getElementById('wb-cover-preview');
            var coverPlaceholder = document.getElementById('wb-cover-placeholder');
            var coverUrl = document.getElementById('wb-cover-url');
            if (coverPreview) {
               coverPreview.src = p.featured_image;
               coverPreview.style.display = 'block';
            }
            if (coverPlaceholder) coverPlaceholder.style.display = 'none';
            if (coverUrl) coverUrl.value = p.featured_image;

            var defaultBlockImg = document.querySelector('#block-image-default img.wb-image-preview');
            var defaultDropzone = document.getElementById('wb-image-dropzone-default');
            if (defaultBlockImg && defaultDropzone) {
               defaultBlockImg.src = p.featured_image;
               defaultBlockImg.style.display = 'block';
               defaultDropzone.classList.add('has-image');
               defaultDropzone.querySelectorAll('i, p, small').forEach(function(el) { el.style.display = 'none'; });
            }
         }

         // 10. Parse and Populate Full Body Content Blocks into Editor Canvas
         var bodyContent = (p.body_html || p.content || '').trim();
         if (bodyContent) {
            // 10A. High-fidelity block metadata deserialization
            var matchMeta = bodyContent.match(/<!--\s*WB_BLOCKS_DATA:\s*([\s\S]*?)\s*-->/);
            if (matchMeta && typeof deserializeEditorBlocks === 'function') {
               try {
                  var rawStr = matchMeta[1].trim();
                  var blocksData = null;
                  try {
                     blocksData = JSON.parse(decodeURIComponent(rawStr));
                  } catch (e1) {
                     try {
                        blocksData = JSON.parse(rawStr);
                     } catch(e2) {}
                  }

                  if (Array.isArray(blocksData) && blocksData.length) {
                     var deserialized = deserializeEditorBlocks(blocksData);
                     if (deserialized) {
                        if (typeof updateWordCount === 'function') updateWordCount();
                        var badge = document.getElementById('wb-status-badge');
                        if (badge) {
                           badge.textContent = 'Editing Mode';
                           badge.className = 'wb-status-badge editing';
                        }
                        if (typeof showToast === 'function') {
                           showToast('Loaded blog post with exact blocks: "' + (p.title || p.slug) + '"', 'success');
                        }
                        editorHistory = [];
                        historyIndex = -1;
                        if (typeof pushHistorySnapshot === 'function') pushHistorySnapshot();
                        return;
                     }
                  }
               } catch(e) {
                  console.error('Failed to parse blocks metadata:', e);
               }
            }

            // 10B. Comprehensive Fallback parser for legacy HTML / posts without embedded block metadata
            var editor = document.getElementById('wb-editor');
            if (editor) {
               editor.querySelectorAll('.wb-block').forEach(function(blk) {
                  if (!blk.id || !blk.id.endsWith('-default')) {
                     blk.remove();
                  }
               });
            }

            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = bodyContent;
            var children = Array.from(tempDiv.children);
            if (children.length === 0 && tempDiv.textContent.trim().length > 0) {
               tempDiv.innerHTML = '<p>' + bodyContent + '</p>';
               children = Array.from(tempDiv.children);
            }

            var firstParaAssigned = false;
            var defaultParaBlock = document.getElementById('block-paragraph-default');
            if (defaultParaBlock) {
               var pInit = defaultParaBlock.querySelector('.wb-paragraph-content');
               if (pInit) pInit.innerHTML = '';
            }

            children.forEach(function(child) {
               // Skip metadata and tag wrapper elements
               if (child.classList && (
                  child.classList.contains('tp-blog-details-link-wrap') ||
                  child.classList.contains('tp-blog-details-dates') ||
                  child.classList.contains('tp-blog-details-tag-wrap') ||
                  child.classList.contains('tp-blog-meta') ||
                  child.classList.contains('tp-blog-banner-area')
               )) {
                  return;
               }

               var tag = child.tagName ? child.tagName.toLowerCase() : '';
               if (!tag) return;

               // 1. Divider Block
               if (tag === 'hr' || child.querySelector('hr')) {
                  insertBlock('divider');
                  return;
               }

               // 2. File / Folder / Download Block detection
               var isFileBlock = false;
               var dlLink = null;
               if (tag === 'a' && child.hasAttribute('download')) {
                  isFileBlock = true;
                  dlLink = child;
               } else if (child.querySelector('a[download], i.fa-file-arrow-down, i.fa-download')) {
                  isFileBlock = true;
                  dlLink = child.querySelector('a');
               } else if (child.querySelector('a') && (child.textContent.includes('Download') || child.querySelector('i.fa-file-arrow-down'))) {
                  isFileBlock = true;
                  dlLink = child.querySelector('a');
               }

               if (isFileBlock) {
                  var url = dlLink ? (dlLink.getAttribute('href') || '') : '';
                  var label = dlLink ? dlLink.textContent.replace(/Download File/gi, 'Download File').trim() : 'Download File';
                  insertBlock('file');
                  var newBlock = document.getElementById('wb-editor').lastElementChild;
                  if (newBlock) {
                     var inputs = newBlock.querySelectorAll('input');
                     if (inputs[0]) inputs[0].value = label || 'Download File';
                     if (inputs[1]) inputs[1].value = url || '';
                     if (typeof initFileBlock === 'function') initFileBlock(newBlock);
                  }
                  return;
               }

               // 3. Table Block
               if (tag === 'table' || child.querySelector('table, .wb-editable-table, .tp-blog-table-wrap')) {
                  var tableEl = tag === 'table' ? child : child.querySelector('table');
                  if (tableEl) {
                     insertBlock('table');
                     var newBlock = document.getElementById('wb-editor').lastElementChild;
                     if (newBlock) {
                        var newTable = newBlock.querySelector('.wb-editable-table');
                        if (newTable) {
                           var theadTr = newTable.querySelector('thead tr');
                           var tbody = newTable.querySelector('tbody');
                           var ths = tableEl.querySelectorAll('thead th, tr:first-child th');
                           if (theadTr && ths.length > 0) {
                              theadTr.innerHTML = '<th class="wb-col-del-th" style="width:28px;background:rgba(239,68,68,0.04);border:1px solid var(--wb-border);"></th>';
                              ths.forEach(function(th) {
                                 if (th.classList.contains('wb-col-del-th')) return;
                                 var thEl = document.createElement('th');
                                 thEl.style.cssText = 'padding:10px 14px;background:rgba(245,96,4,0.1);color:#f56004;border:1px solid var(--wb-border);outline:none;';
                                 thEl.innerHTML = '<div class="wb-th-wrap"><span contenteditable="true">' + th.textContent.trim() + '</span><button class="wb-table-col-del" data-action="del-table-col" title="Delete this column"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button></div>';
                                 theadTr.appendChild(thEl);
                              });
                           }
                           var rows = tableEl.querySelectorAll('tbody tr');
                           if (!rows.length) {
                              var allTrs = Array.from(tableEl.querySelectorAll('tr'));
                              if (allTrs.length > 1) rows = allTrs.slice(1);
                           }
                           if (tbody && rows.length > 0) {
                              tbody.innerHTML = '';
                              rows.forEach(function(rTr) {
                                 var tds = rTr.querySelectorAll('td');
                                 if (!tds.length) return;
                                 var tr = document.createElement('tr');
                                 var delTd = document.createElement('td');
                                 delTd.className = 'wb-row-del-cell';
                                 delTd.style.cssText = 'border:1px solid var(--wb-border);';
                                 delTd.innerHTML = '<button class="wb-table-row-del" data-action="del-table-row" title="Delete this row"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button>';
                                 tr.appendChild(delTd);
                                 tds.forEach(function(td) {
                                    if (td.classList.contains('wb-row-del-cell')) return;
                                    var newTd = document.createElement('td');
                                    newTd.contentEditable = 'true';
                                    newTd.style.cssText = 'padding:10px 14px;border:1px solid var(--wb-border);color:#ccc;outline:none;';
                                    newTd.innerHTML = td.innerHTML.trim();
                                    tr.appendChild(newTd);
                                 });
                                 tbody.appendChild(tr);
                              });
                           }
                        }
                     }
                     return;
                  }
               }

               // 4. Video Block (iframe, video)
               if (tag === 'iframe' || tag === 'video' || child.querySelector('iframe, video')) {
                  var ifr = tag === 'iframe' ? child : child.querySelector('iframe');
                  var vid = tag === 'video' ? child : child.querySelector('video');
                  var vSrc = (ifr ? ifr.getAttribute('src') : '') || (vid ? vid.getAttribute('src') : '') || '';
                  insertBlock('video');
                  var newBlock = document.getElementById('wb-editor').lastElementChild;
                  if (newBlock && vSrc) {
                     var inp = newBlock.querySelector('input[type="url"]');
                     if (inp) inp.value = vSrc;
                     var embedUrl = vSrc;
                     var ytMatch = vSrc.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                     if (ytMatch) embedUrl = 'https://www.youtube.com/embed/' + ytMatch[1];
                     if (typeof showVideoEmbed === 'function') showVideoEmbed(newBlock, embedUrl);
                  }
                  return;
               }

               // 5. Audio Block (audio)
               if (tag === 'audio' || child.querySelector('audio')) {
                  var audioEl = tag === 'audio' ? child : child.querySelector('audio');
                  var aSrc = audioEl ? (audioEl.getAttribute('src') || audioEl.src || '') : '';
                  insertBlock('audio');
                  var newBlock = document.getElementById('wb-editor').lastElementChild;
                  if (newBlock && aSrc) {
                     var inp = newBlock.querySelector('input[type="url"]');
                     if (inp) inp.value = aSrc;
                     if (typeof showAudioPlayer === 'function') showAudioPlayer(newBlock, aSrc);
                  }
                  return;
               }

               // 6. Math Block (KaTeX / LaTeX)
               if (child.querySelector('.katex') || (child.querySelector('code') && child.style && child.style.textAlign === 'center')) {
                  var mathTex = '';
                  var annotation = child.querySelector('annotation[encoding="application/x-tex"]');
                  if (annotation) mathTex = annotation.textContent.trim();
                  else if (child.querySelector('code')) mathTex = child.querySelector('code').textContent.trim();
                  insertBlock('math');
                  var newBlock = document.getElementById('wb-editor').lastElementChild;
                  if (newBlock && mathTex) {
                     var inp = newBlock.querySelector('input');
                     if (inp) inp.value = mathTex;
                  }
                  return;
               }

               // 7. Verse Block
               if ((tag === 'pre' && child.style && child.style.fontFamily && child.style.fontFamily.toLowerCase().includes('georgia')) || child.querySelector('pre[style*="Georgia"]')) {
                  var verseEl = (tag === 'pre') ? child : child.querySelector('pre');
                  insertBlock('verse');
                  var newBlock = document.getElementById('wb-editor').lastElementChild;
                  if (newBlock && verseEl) {
                     var editable = newBlock.querySelector('[contenteditable]');
                     if (editable) editable.innerHTML = verseEl.innerHTML.trim();
                  }
                  return;
               }

               // 8. Code Block (pre / code)
               if (tag === 'pre' || child.querySelector('pre, code, .tp-blog-code-block')) {
                  var preEl = tag === 'pre' ? child : child.querySelector('pre');
                  var codeEl = preEl ? (preEl.querySelector('code') || preEl) : (child.querySelector('code') || child);
                  var codeText = codeEl ? (codeEl.innerText || codeEl.textContent || '') : '';
                  insertBlock('code');
                  var newBlock = document.getElementById('wb-editor').lastElementChild;
                  if (newBlock) {
                     var ta = newBlock.querySelector('.wb-code-textarea');
                     if (ta) ta.value = codeText.trim();
                  }
                  return;
               }

               // 9. Heading (h1, h2, h3, h4, h5, h6)
               if (/^h[1-6]$/.test(tag)) {
                  insertBlock('heading');
                  var newBlock = document.getElementById('wb-editor').lastElementChild;
                  if (newBlock) {
                     var sel = newBlock.querySelector('.heading-level');
                     if (sel) sel.value = (tag === 'h3' ? 'h3' : (tag === 'h4' ? 'h4' : 'h2'));
                     var hContent = newBlock.querySelector('.wb-heading-content');
                     if (hContent) hContent.innerHTML = child.innerHTML.trim();
                  }
                  return;
               }

               // 10. Blockquote
               if (tag === 'blockquote' || child.querySelector('blockquote')) {
                  var bqEl = tag === 'blockquote' ? child : child.querySelector('blockquote');
                  insertBlock('blockquote');
                  var newBlock = document.getElementById('wb-editor').lastElementChild;
                  if (newBlock && bqEl) {
                     var bq = newBlock.querySelector('blockquote');
                     if (bq) bq.innerHTML = bqEl.innerHTML.trim();
                  }
                  return;
               }

               // 11. Image banner / div containing img
               if (child.querySelector('img') || tag === 'img') {
                  var imgEl = tag === 'img' ? child : child.querySelector('img');
                  if (imgEl && imgEl.src) {
                     insertBlock('image');
                     var newBlock = document.getElementById('wb-editor').lastElementChild;
                     if (newBlock) {
                        var imgPrev = newBlock.querySelector('img.wb-image-preview');
                        var dropzone = newBlock.querySelector('.wb-image-dropzone');
                        if (imgPrev) {
                           imgPrev.src = imgEl.src;
                           imgPrev.style.display = 'block';
                        }
                        if (dropzone) {
                           dropzone.classList.add('has-image');
                           dropzone.querySelectorAll('i, p, small').forEach(function(el) { el.style.display = 'none'; });
                        }
                        var caption = newBlock.querySelector('.wb-image-caption');
                        if (caption && imgEl.alt && imgEl.alt !== 'Blog image') {
                           caption.value = imgEl.alt;
                        }
                     }
                  }
                  return;
               }

               // 12. List (ul, ol)
               if (tag === 'ul' || tag === 'ol' || child.querySelector('ul, ol')) {
                  var listEl = (tag === 'ul' || tag === 'ol') ? child : child.querySelector('ul, ol');
                  insertBlock('list');
                  var newBlock = document.getElementById('wb-editor').lastElementChild;
                  if (newBlock && listEl) {
                     var isOl = (listEl.tagName.toLowerCase() === 'ol');
                     var ulEl = newBlock.querySelector('.wb-editable-ul');
                     var olEl = newBlock.querySelector('.wb-editable-ol');
                     var ulCb = newBlock.querySelector('.wb-ul-enabled');
                     var olCb = newBlock.querySelector('.wb-ol-enabled');
                     if (isOl) {
                        if (ulCb) ulCb.checked = false;
                        if (olCb) olCb.checked = true;
                        if (ulEl) ulEl.style.display = 'none';
                        if (olEl) {
                           olEl.style.display = '';
                           olEl.innerHTML = '';
                           listEl.querySelectorAll('li').forEach(function(li, idx) {
                              var liItem = document.createElement('li');
                              liItem.style.cssText = 'margin-bottom:6px;list-style:none;';
                              liItem.innerHTML = '<div class="wb-li-wrap"><span style="color:#f56004;font-weight:700;margin-top:2px;min-width:18px;">' + (idx+1) + '.</span><span contenteditable="true" style="color:#ccc;">' + li.innerHTML.trim() + '</span><button class="wb-li-del" data-action="del-li" title="Delete item"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>';
                              olEl.appendChild(liItem);
                           });
                        }
                     } else {
                        if (ulEl) {
                           ulEl.innerHTML = '';
                           listEl.querySelectorAll('li').forEach(function(li) {
                              var liItem = document.createElement('li');
                              liItem.style.cssText = 'margin-bottom:6px;list-style:none;';
                              liItem.innerHTML = '<div class="wb-li-wrap"><span style="color:#666;margin-top:2px;">&#x2022;</span><span contenteditable="true" style="color:#ccc;">' + li.innerHTML.trim() + '</span><button class="wb-li-del" data-action="del-li" title="Delete item"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>';
                              ulEl.appendChild(liItem);
                           });
                        }
                     }
                  }
                  return;
               }

               // 13. Paragraph / Text block (p, or generic div containing text)
               var textContent = child.innerHTML ? child.innerHTML.trim() : '';
               if (textContent) {
                  if (!firstParaAssigned && defaultParaBlock) {
                     var pContent = defaultParaBlock.querySelector('.wb-paragraph-content');
                     if (pContent) {
                        pContent.innerHTML = textContent;
                        if (child.style && child.style.textAlign) pContent.style.textAlign = child.style.textAlign;
                     }
                     firstParaAssigned = true;
                  } else {
                     insertBlock('paragraph');
                     var newBlock = document.getElementById('wb-editor').lastElementChild;
                     if (newBlock) {
                        var pContent = newBlock.querySelector('.wb-paragraph-content');
                        if (pContent) {
                           pContent.innerHTML = textContent;
                           if (child.style && child.style.textAlign) pContent.style.textAlign = child.style.textAlign;
                        }
                     }
                  }
               }
            });
         }

         // Recalculate Word Count and reading time
         if (typeof updateWordCount === 'function') updateWordCount();

         // Status badge
         var badge = document.getElementById('wb-status-badge');
         if (badge) {
            badge.textContent = 'Editing Mode';
            badge.className = 'wb-status-badge editing';
         }

         if (typeof showToast === 'function') {
            showToast('Loaded blog post for editing: "' + (p.title || p.slug) + '"', 'success');
         }

         editorHistory = [];
         historyIndex = -1;
         pushHistorySnapshot();
      }, 300);
   }
   // #endregion EDIT_EXISTING_POST_AUTO_POPULATE

})(); // END IIFE
</script>
<!-- Load the live SEO analyzer from the correct subfolder path -->
<script src="js/seo.js"></script>

</body>
</html>
