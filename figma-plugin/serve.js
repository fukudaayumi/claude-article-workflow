#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const jsonData = process.argv[2];
if (!jsonData) {
  console.error('Usage: node serve.js <json>');
  process.exit(1);
}

try {
  JSON.parse(jsonData);
} catch (e) {
  console.error('Invalid JSON:', e.message);
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // バナーデータの配信
  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.writeHead(200);
    res.end(jsonData);
    return;
  }

  // 画像の受信・保存
  if (req.method === 'POST' && req.url === '/save-image') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString());
        const { articleNo, frameName, pngBase64 } = body;

        const articleDir = path.resolve(`articles/${articleNo}`);
        fs.mkdirSync(articleDir, { recursive: true });

        const pngBuffer = Buffer.from(pngBase64, 'base64');
        const webpPath = path.join(articleDir, `${frameName}.webp`);

        await sharp(pngBuffer).webp({ quality: 90 }).toFile(webpPath);

        console.log(`✅ 保存完了: articles/${articleNo}/${frameName}.webp`);

        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, path: webpPath }));
      } catch (e) {
        console.error('画像保存エラー:', e.message);
        res.writeHead(500);
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const PORT = 3737;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ バナーデータを配信中: http://localhost:${PORT}`);
  console.log('📌 Figmaプラグイン「WMブログ バナー生成」を開いてください');
  console.log('   → 開いた瞬間にバナーを作成し、画像を自動保存します');
  console.log('   （60秒後に自動停止）');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`⚠️  ポート${PORT}が使用中です。`);
    console.error('   lsof -ti:3737 | xargs kill で停止してから再試行してください。');
  } else {
    console.error(e);
  }
  process.exit(1);
});

setTimeout(() => {
  server.close();
  console.log('\nサーバーを停止しました');
  process.exit(0);
}, 60000);
