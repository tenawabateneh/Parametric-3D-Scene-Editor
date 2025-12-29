import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 54321;
const OUT = path.resolve(__dirname, '../tmp/leak-test.json');

if (!fs.existsSync(path.dirname(OUT))) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/leak') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        fs.writeFileSync(OUT, JSON.stringify({ receivedAt: new Date().toISOString(), json }, null, 2));
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
        res.end('OK');
        console.log('Leak data written to', OUT);
      } catch (e) {
        res.writeHead(400, { 'Access-Control-Allow-Origin': '*' });
        res.end('Bad JSON');
      }
    });
  } else {
    res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
    res.end('Not found');
  }
});

server.listen(PORT, () => console.log(`Leak receiver listening on http://localhost:${PORT}/`));


