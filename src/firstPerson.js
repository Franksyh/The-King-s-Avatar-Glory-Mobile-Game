"use strict";

(() => {
  const canvas = document.querySelector("#fpCanvas");
  const ctx = canvas.getContext("2d");
  const shell = document.querySelector(".fp-shell");
  const bossHp = document.querySelector("#bossHp");
  const bossPhase = document.querySelector("#bossPhase");
  const playerHp = document.querySelector("#playerHp");
  const playerMp = document.querySelector("#playerMp");
  const hpText = document.querySelector("#hpText");
  const mpText = document.querySelector("#mpText");
  const fpLog = document.querySelector("#fpLog");
  const damageLayer = document.querySelector("#damageLayer");
  const skillButtons = [...document.querySelectorAll("[data-skill]")];

  const state = {
    time: 0,
    yaw: 0,
    speed: 0,
    hp: 100,
    mp: 100,
    bossHp: 1000,
    bossMaxHp: 1000,
    bossDistance: 0.7,
    lateral: 0,
    phase: 1,
    cooldowns: [0, 0, 0, 0],
    slash: 0,
    shield: 0,
    blast: 0,
    shake: 0,
    paused: false,
    keys: new Set()
  };

  const skills = [
    { name: "千機突", cd: 0.75, cost: 5, damage: 38 },
    { name: "傘形切換", cd: 4.5, cost: 12, damage: 18, shield: 18 },
    { name: "全系連段", cd: 6.2, cost: 20, damage: 118 },
    { name: "千機百裂", cd: 14, cost: 36, damage: 260 }
  ];

  let last = performance.now();
  let pointerX = null;
  const controlKeys = new Set([" ", "w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "q", "e", "p"]);

  bind();
  requestAnimationFrame(loop);

  function bind() {
    skillButtons.forEach((button) => {
      button.addEventListener("click", () => cast(Number(button.dataset.skill)));
    });

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (isControlKey(event)) event.preventDefault();
      state.keys.add(key);
      const index = Number.parseInt(event.key, 10) - 1;
      if (!event.repeat && index >= 0 && index < skills.length) cast(index);
      if (!event.repeat && event.key === " ") cast(0);
      if (!event.repeat && key === "p") {
        state.paused = !state.paused;
        log(state.paused ? "戰鬥暫停，準星保持鎖定。" : "戰鬥恢復。");
      }
    });

    window.addEventListener("keyup", (event) => {
      state.keys.delete(event.key.toLowerCase());
    });

    canvas.addEventListener("pointerdown", (event) => {
      pointerX = event.clientX;
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", (event) => {
      if (pointerX === null) return;
      state.yaw += (event.clientX - pointerX) * 0.004;
      pointerX = event.clientX;
    });

    canvas.addEventListener("pointerup", () => {
      pointerX = null;
    });
  }

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    update(dt);
    draw();
    renderHud();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    state.time += dt;
    if (state.paused) {
      state.shake = Math.max(0, state.shake - dt * 4);
      return;
    }
    updateKeyboard(dt);
    state.mp = Math.min(100, state.mp + dt * 8);
    state.slash = Math.max(0, state.slash - dt * 3);
    state.blast = Math.max(0, state.blast - dt * 2);
    state.shield = Math.max(0, state.shield - dt);
    state.shake = Math.max(0, state.shake - dt * 4);
    state.cooldowns = state.cooldowns.map((value) => Math.max(0, value - dt));

    if (state.bossHp < state.bossMaxHp * 0.5 && state.phase === 1) {
      state.phase = 2;
      log("Boss 讀取你的攻擊節奏，進入二階段。");
      shake();
    }

    const attackRate = state.phase === 1 ? 2.8 : 1.8;
    if (Math.floor(state.time * attackRate) !== Math.floor((state.time - dt) * attackRate)) {
      const guard = state.shield > 0 ? 0.45 : 1;
      state.hp = Math.max(0, state.hp - Math.round((state.phase === 1 ? 6 : 10) * guard));
      shake();
      if (state.hp <= 0) {
        state.hp = 65;
        state.mp = 70;
        log("模擬復活：重新鎖定 Boss。");
      }
    }
  }

  function updateKeyboard(dt) {
    const forward = Number(state.keys.has("w") || state.keys.has("arrowup")) - Number(state.keys.has("s") || state.keys.has("arrowdown"));
    const turn = Number(state.keys.has("d") || state.keys.has("arrowright")) - Number(state.keys.has("a") || state.keys.has("arrowleft"));
    const strafe = Number(state.keys.has("e")) - Number(state.keys.has("q"));
    state.yaw += turn * dt * 1.85;
    state.bossDistance = clamp(state.bossDistance - forward * dt * 0.32, 0.35, 1.2);
    state.lateral = clamp(state.lateral + strafe * dt * 0.48, -0.42, 0.42);
    state.lateral *= 1 - Math.min(1, dt * 1.8);
  }

  function cast(index) {
    const skill = skills[index];
    if (!skill || state.cooldowns[index] > 0 || state.mp < skill.cost) return;
    state.cooldowns[index] = skill.cd;
    state.mp -= skill.cost;
    const aimBonus = Math.max(0.65, 1 - Math.abs(Math.sin(state.yaw)) * 0.45);
    const distanceBonus = 1 + (1.2 - state.bossDistance) * 0.3;
    const damage = Math.round(skill.damage * aimBonus * distanceBonus);
    state.bossHp = Math.max(0, state.bossHp - damage);
    state.slash = index === 0 ? 1 : state.slash;
    state.blast = index >= 2 ? 1 : state.blast;
    state.shield = skill.shield ? 3.5 : state.shield;
    popDamage(damage, index === 3);
    log(`${skill.name} 命中，造成 ${damage} 傷害。`);
    shake();
    if (state.bossHp <= 0) {
      state.bossHp = state.bossMaxHp;
      state.phase = 1;
      log("Boss 擊破，重置下一輪測試。");
    }
  }

  function draw() {
    const shakeX = state.shake ? random(-8, 8) * state.shake : 0;
    const shakeY = state.shake ? random(-5, 5) * state.shake : 0;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(shakeX, shakeY);
    drawSky();
    drawArena();
    drawBoss();
    drawWeapon();
    ctx.restore();
  }

  function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#101827");
    gradient.addColorStop(0.42, "#17131d");
    gradient.addColorStop(0.72, "#21161a");
    gradient.addColorStop(1, "#0b0d12");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.globalAlpha = 0.62;
    for (let i = 0; i < 7; i += 1) {
      const x = ((i * 176 + state.yaw * 120) % 1240) - 140;
      ctx.fillStyle = i % 2 ? "rgba(64,214,191,0.12)" : "rgba(245,194,87,0.12)";
      ctx.beginPath();
      ctx.moveTo(x, 34 + Math.sin(state.time + i) * 8);
      ctx.lineTo(x + 116, 12);
      ctx.lineTo(x + 168, 168);
      ctx.lineTo(x + 38, 196);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = "rgba(245,194,87,0.1)";
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.48 + Math.sin(state.yaw) * 50, 42);
    ctx.lineTo(canvas.width * 0.16, canvas.height);
    ctx.lineTo(canvas.width * 0.28, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(64,214,191,0.1)";
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.52 + Math.sin(state.yaw) * 50, 42);
    ctx.lineTo(canvas.width * 0.84, canvas.height);
    ctx.lineTo(canvas.width * 0.72, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  function drawArena() {
    const horizon = 270 + Math.sin(state.yaw) * 8;
    const floor = ctx.createLinearGradient(0, horizon, 0, canvas.height);
    floor.addColorStop(0, "rgba(36,41,52,0.78)");
    floor.addColorStop(0.52, "rgba(28,24,28,0.96)");
    floor.addColorStop(1, "#0d0f13");
    ctx.fillStyle = floor;
    ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);
    ctx.strokeStyle = "rgba(64,214,191,0.28)";
    for (let i = 0; i < 11; i += 1) {
      const y = horizon + i * i * 5.8;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    for (let i = -5; i <= 5; i += 1) {
      const x = canvas.width / 2 + i * 88 + Math.sin(state.yaw) * 96 + state.lateral * 90;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, horizon);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(245,194,87,0.36)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2 + state.lateral * 92, horizon + 96, 240, 78, Math.sin(state.yaw) * 0.05, 0, Math.PI * 2);
    ctx.stroke();
    drawGroundRune(canvas.width / 2 + state.lateral * 110, horizon + 112, 76);
  }

  function drawBoss() {
    const centerX = canvas.width / 2 - Math.sin(state.yaw) * 170 - state.lateral * 210;
    const centerY = 238 + state.bossDistance * 34;
    const size = 165 / state.bossDistance;
    const pulse = Math.sin(state.time * (state.phase === 1 ? 3 : 6)) * 8;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.shadowColor = state.phase === 1 ? "#9d7cff" : "#ff5b62";
    ctx.shadowBlur = 28;
    ctx.strokeStyle = state.phase === 1 ? "rgba(157,124,255,0.72)" : "rgba(255,91,98,0.74)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.66 + pulse * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    const fill = ctx.createRadialGradient(-size * 0.14, -size * 0.26, 4, 0, 0, size * 0.62);
    fill.addColorStop(0, "#fff5c7");
    fill.addColorStop(0.22, state.phase === 1 ? "#9d7cff" : "#ff5b62");
    fill.addColorStop(1, "#171119");
    ctx.fillStyle = fill;
    ctx.strokeStyle = "rgba(248,242,223,0.82)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 8;
      const radius = size * (i % 2 === 0 ? 0.56 : 0.42) + pulse;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(248,242,223,0.88)";
    ctx.beginPath();
    ctx.arc(-size * 0.16, -size * 0.04, Math.max(4, size * 0.035), 0, Math.PI * 2);
    ctx.arc(size * 0.16, -size * 0.04, Math.max(4, size * 0.035), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f8f2df";
    ctx.font = `bold ${Math.max(20, size * 0.16)}px Microsoft JhengHei, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("BOSS", 0, 6);

    if (state.blast > 0) {
      ctx.globalAlpha = state.blast;
      ctx.strokeStyle = "#f5c257";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, size * (0.5 + state.blast), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWeapon() {
    const sway = Math.sin(state.time * 4) * 8 + Math.sin(state.yaw) * 18;
    ctx.save();
    ctx.translate(canvas.width * 0.62 + sway, canvas.height * 0.78);
    ctx.rotate(-0.58 + state.slash * 0.42);
    ctx.shadowColor = "#f5c257";
    ctx.shadowBlur = 20;
    const blade = ctx.createLinearGradient(0, -210, 0, 80);
    blade.addColorStop(0, "#fff5c7");
    blade.addColorStop(0.34, "#f5c257");
    blade.addColorStop(1, "#7a4c19");
    ctx.fillStyle = blade;
    ctx.fillRect(-14, -210, 28, 252);
    ctx.fillStyle = "rgba(248,242,223,0.92)";
    ctx.fillRect(-48, -142, 96, 20);
    ctx.strokeStyle = "#40d6bf";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -132, 48, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.fillStyle = "#40d6bf";
    ctx.fillRect(-24, 34, 48, 110);
    ctx.fillStyle = "#101116";
    ctx.fillRect(-13, 46, 26, 76);
    if (state.shield > 0) {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = "#40d6bf";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(-52, -58, 118, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGroundRune(x, y, radius) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(245,194,87,0.36)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(64,214,191,0.22)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.58, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8 + state.time * 0.1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.22, Math.sin(angle) * radius * 0.22);
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderHud() {
    bossHp.style.width = `${(state.bossHp / state.bossMaxHp) * 100}%`;
    bossPhase.textContent = `Phase ${state.phase}`;
    playerHp.style.width = `${state.hp}%`;
    playerMp.style.width = `${state.mp}%`;
    hpText.textContent = Math.round(state.hp);
    mpText.textContent = Math.round(state.mp);
    skills.forEach((skill, index) => {
      const ratio = clamp(state.cooldowns[index] / skill.cd, 0, 1);
      skillButtons[index].querySelector("i").style.height = `${ratio * 100}%`;
    });
  }

  function popDamage(value, big) {
    const pop = document.createElement("strong");
    pop.className = "damage-pop";
    pop.textContent = big ? `${value}!` : value;
    pop.style.left = `${48 + random(-10, 10)}%`;
    pop.style.top = `${36 + random(-6, 6)}%`;
    damageLayer.append(pop);
    setTimeout(() => pop.remove(), 800);
  }

  function log(message) {
    fpLog.textContent = message;
  }

  function shake() {
    state.shake = 1;
    shell.classList.remove("shake");
    void shell.offsetWidth;
    shell.classList.add("shake");
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function isControlKey(event) {
    const key = event.key.toLowerCase();
    const digit = Number(event.code.slice(5));
    return controlKeys.has(key) || (event.code.startsWith("Digit") && digit >= 1 && digit <= 4);
  }
})();
