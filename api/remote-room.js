const { randomUUID } = require("crypto");

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

module.exports = async function handler(request, response) {
  const payload = request.method === "GET" ? {} : normalizeBody(request.body);
  const action = payload.action || (request.method === "GET" ? "read" : "ping");
  const now = new Date().toISOString();

  if (action === "create") {
    const code = createRoomCode();
    const player = createPlayer(payload, now);
    const room = {
      code,
      hostId: player.id,
      createdAt: now,
      updatedAt: now,
      status: "waiting",
      mission: "第十區遠端協作",
      players: [player],
      log: [`${player.alias} 建立房間`]
    };
    saveRoom(code, room);
    response.status(200).json({ room, playerId: player.id });
    return;
  }

  const code = normalizeRoomCode(payload.roomCode || request.query.room);
  if (!code) {
    response.status(400).json({ error: "ROOM_CODE_REQUIRED" });
    return;
  }

  const room = loadRoom(code);
  if (!room) {
    response.status(404).json({ error: "ROOM_NOT_FOUND" });
    return;
  }

  if (action === "join" || action === "ping") {
    const player = createPlayer(payload, now);
    const existingIndex = room.players.findIndex((item) => item.id === player.id);
    if (existingIndex >= 0) {
      room.players[existingIndex] = { ...room.players[existingIndex], ...player, lastSeen: now };
    } else {
      room.players.push(player);
      room.log.unshift(`${player.alias} 加入房間`);
    }
    room.players = prunePlayers(room.players, now);
    room.updatedAt = now;
    room.status = room.players.length >= 2 ? "connected" : "waiting";
    room.log = room.log.slice(0, 8);
    saveRoom(code, room);
    response.status(200).json({ room, playerId: player.id });
    return;
  }

  room.players = prunePlayers(room.players, now);
  room.updatedAt = now;
  saveRoom(code, room);
  response.status(200).json({ room });
};

function normalizeBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function createPlayer(payload, now) {
  return {
    id: payload.playerId || randomUUID(),
    alias: cleanText(payload.alias, "榮耀玩家"),
    device: cleanText(payload.device, "網頁"),
    level: Number(payload.level || 1),
    rating: Number(payload.rating || 1000),
    lastSeen: now,
    joinedAt: payload.joinedAt || now
  };
}

function cleanText(value, fallback) {
  const text = String(value || "").trim().slice(0, 24);
  return text || fallback;
}

function normalizeRoomCode(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function createRoomCode() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    if (!loadRoom(code)) return code;
  }
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function prunePlayers(players, now) {
  const current = Date.parse(now);
  return players.filter((player) => current - Date.parse(player.lastSeen) < 120000).slice(0, 8);
}

function loadRoom(code) {
  return getRooms().get(code) || null;
}

function saveRoom(code, room) {
  getRooms().set(code, room);
}

function getRooms() {
  if (!globalThis.__gloryVercelRooms) {
    globalThis.__gloryVercelRooms = new Map();
  }
  return globalThis.__gloryVercelRooms;
}
