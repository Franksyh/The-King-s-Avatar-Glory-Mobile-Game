"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const startPort = Number(process.env.PORT || 5173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(root, requested));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mime[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  });
});

let currentPort = startPort;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && currentPort < startPort + 20) {
    currentPort += 1;
    server.listen(currentPort, "127.0.0.1");
    return;
  }
  throw error;
});

server.listen(currentPort, "127.0.0.1", () => {
  console.log(`榮耀行動原型已啟動：http://127.0.0.1:${currentPort}`);
});
