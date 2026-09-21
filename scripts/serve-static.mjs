import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT || 3000);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

createServer((request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url || "/", "http://localhost").pathname,
  );
  const relative = normalize(pathname).replace(/^([/\\])+/, "");
  let file = resolve(join(root, relative));
  if (!file.startsWith(root) || relative.startsWith(".") || extname(file) === ".php") {
    response.writeHead(404).end("Not found");
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file) && !extname(file) && existsSync(file + ".html")) file += ".html";
  if (!existsSync(file) || !statSync(file).isFile()) file = join(root, "404.html");
  response.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.statusCode = file.endsWith("404.html") ? 404 : 200;
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Static export available at http://127.0.0.1:${port}`);
});
