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

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const functionName = resolveFunctionName(url.pathname);
  if (functionName) {
    await handleFunctionRequest(request, response, functionName);
    return;
  }

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

function resolveFunctionName(pathname) {
  if (pathname === "/api/game-state" || pathname === "/.netlify/functions/game-state") return "game-state";
  if (pathname === "/api/remote-room" || pathname === "/.netlify/functions/remote-room") return "remote-room";
  return null;
}

async function handleFunctionRequest(request, response, functionName) {
  try {
    const functionPath = path.join(root, "netlify", "functions", `${functionName}.mjs`);
    const functionModule = await import(`${pathToFileUrl(functionPath)}?t=${Date.now()}`);
    const requestBody = await readRequestBody(request);
    const headers = new Headers();
    if (request.headers["content-type"]) {
      headers.set("content-type", request.headers["content-type"]);
    }
    const functionResponse = await functionModule.default(
      new Request(`http://localhost${request.url}`, {
        method: request.method,
        headers,
        body: requestBody.length > 0 ? requestBody : undefined
      }),
      {}
    );
    const responseBody = await functionResponse.text();
    response.writeHead(functionResponse.status, {
      "Content-Type": functionResponse.headers.get("content-type") || "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(responseBody);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "Function failed", detail: error.message }));
  }
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function pathToFileUrl(filePath) {
  return `file:///${filePath.replace(/\\/g, "/").replace(/^([A-Za-z]):/, "$1:")}`;
}

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
