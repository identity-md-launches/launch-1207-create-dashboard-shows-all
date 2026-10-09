// Bounded test runner owns this server; production is static dist/ only.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
const root = resolve('dist')
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' }
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname
  if (!path.startsWith('/preview/')) { res.writeHead(404).end(); return }
  let filename
  try { filename = resolve(root, decodeURIComponent(path.slice('/preview/'.length)) || 'index.html') }
  catch { res.writeHead(400).end(); return }
  if (filename !== root && !filename.startsWith(root + sep)) { res.writeHead(403).end(); return }
  try {
    if ((await stat(filename)).isDirectory()) filename = resolve(filename, 'index.html')
    res.writeHead(200, { 'Content-Type': types[extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(await readFile(filename))
  } catch { res.writeHead(404).end('Not found') }
}).listen(4173, '0.0.0.0', () => console.log('Production export: http://localhost:4173/preview/'))
