import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const distDir = path.resolve(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  let filePath = path.join(distDir, reqUrl === '/' ? 'index.html' : reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for Single Page Application routing
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Jonogon News - Setup</title></head>
          <body style="font-family:sans-serif; text-align:center; padding:50px; background:#111; color:#fff;">
            <h2 style="color:#E60012;">জনগণ.নিউজ (Jonogon News)</h2>
            <p>প্রোডাকশন বিল্ড ফাইল (dist) তৈরি হচ্ছে বা এখনও বিল্ড রান করা হয়নি।</p>
            <p>দয়া করে সার্ভার টার্মিনালে <code>npm run build</code> কমান্ডটি সম্পন্ন করুন।</p>
          </body>
          </html>
        `);
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
        });
        res.end(content);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`🚀 Jonogon News Frontend running on port ${port}`);
});

