import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const port = Number(process.argv[2] ?? 4399);
const types = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".webp": "image/webp", ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain",
};

createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(root, urlPath);
    const s = await stat(file).catch(() => null);
    if (s?.isDirectory()) { file = path.join(file, "index.html"); }
    const data = await readFile(file).catch(() => readFile(path.join(root, "404.html")));
    const ext = path.extname(file).toLowerCase();
    res.statusCode = s || !file.endsWith("404.html") ? 200 : 404;
    res.setHeader("Content-Type", types[ext] ?? "application/octet-stream");
    res.end(data);
  } catch {
    res.statusCode = 500;
    res.end("error");
  }
}).listen(port, () => console.log(`serving ${root} on :${port}`));
