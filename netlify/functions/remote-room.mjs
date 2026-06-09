import { getDeployStore, getStore } from "@netlify/blobs";

const roomStoreName = "glory-rooms";
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export default async (req) => {
  const url = new URL(req.url);
  const payload = req.method === "GET" ? {} : await readJson(req);
  const action = payload.action || (req.method === "GET" ? "read" : "ping");
  const now = new Date().toISOString();

  if (action === "create") {
    const code = await createRoomCode();
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
    await saveRoom(code, room);
    return json({ room, playerId: player.id });
  }

  const code = normalizeRoomCode(payload.roomCode || url.searchParams.get("room"));
  if (!code) {
    return json({ error: "ROOM_CODE_REQUIRED" }, 400);
  }

  const room = await loadRoom(code);
  if (!room) {
    return json({ error: "ROOM_NOT_FOUND" }, 404);
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
    await saveRoom(code, room);
    return json({ room, playerId: player.id });
  }

  room.players = prunePlayers(room.players, now);
  room.updatedAt = now;
  await saveRoom(code, room);
  return json({ room });
};

export const config = {
  path: ["/api/remote-room", "/.netlify/functions/remote-room"]
};

async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function createPlayer(payload, now) {
  return {
    id: payload.playerId || crypto.randomUUID(),
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

async function createRoomCode() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    if (!(await loadRoom(code))) return code;
  }
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function prunePlayers(players, now) {
  const current = Date.parse(now);
  return players.filter((player) => current - Date.parse(player.lastSeen) < 120000).slice(0, 8);
}

async function loadRoom(code) {
  const store = getBlobStore();
  if (store) {
    try {
      return await store.get(code, { type: "json" });
    } catch {
      return getMemoryRooms().get(code) || null;
    }
  }
  return getMemoryRooms().get(code) || null;
}

async function saveRoom(code, room) {
  const store = getBlobStore();
  if (store) {
    try {
      await store.setJSON(code, room);
      return;
    } catch {
      getMemoryRooms().set(code, room);
      return;
    }
  }
  getMemoryRooms().set(code, room);
}

function getBlobStore() {
  try {
    const isProduction = globalThis.Netlify?.context?.deploy?.context === "production" || globalThis.Netlify?.env?.get?.("CONTEXT") === "production";
    return isProduction ? getStore(roomStoreName, { consistency: "strong" }) : getDeployStore(roomStoreName);
  } catch {
    return null;
  }
}

function getMemoryRooms() {
  if (!globalThis.__gloryRemoteRooms) {
    globalThis.__gloryRemoteRooms = new Map();
  }
  return globalThis.__gloryRemoteRooms;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}
