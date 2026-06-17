const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  // Parse URL and strip query string
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(DIST, urlPath === '/' ? 'index.html' : urlPath);

  // Prevent path traversal: ensure resolved path is within DIST.
  // Compare against DIST + separator so a sibling like `dist-evil` can't slip
  // through the prefix check (while still allowing the DIST root itself).
  const resolvedPath = path.resolve(filePath);
  const distRoot = path.resolve(DIST);
  if (resolvedPath !== distRoot && !resolvedPath.startsWith(distRoot + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  filePath = resolvedPath;

  // If file doesn't exist, serve index.html (SPA fallback)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'no-referrer',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`CardCount running on port ${PORT}`);
});
