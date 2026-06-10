"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const staticRoot = path.join(root, "dist");
const apiGameState = require("./api/game-state.js");
const apiRemoteRoom = require("./api/remote-room.js");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png"
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/api/game-state") {
    apiGameState(request, createVercelLikeResponse(response));
    return;
  }
  if (url.pathname === "/api/remote-room") {
    request.query = Object.fromEntries(url.searchParams.entries());
    request.body = await readJsonBody(request);
    await apiRemoteRoom(request, createVercelLikeResponse(response));
    return;
  }

  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(staticRoot, requested));
  if (!filePath.startsWith(staticRoot)) {
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

function createVercelLikeResponse(response) {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      response.writeHead(this.statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      });
      response.end(JSON.stringify(data));
    }
  };
}

function readJsonBody(request) {
  return new Promise((resolve) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8");
      if (!text) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch {
        resolve({});
      }
    });
    request.on("error", () => resolve({}));
  });
}

server.listen(Number(process.env.PORT || 3000));
