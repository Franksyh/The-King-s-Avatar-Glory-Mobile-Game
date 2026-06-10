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
    phase: 1,
    cooldowns: [0, 0, 0, 0],
    slash: 0,
    shield: 0,
    blast: 0,
    shake: 0
  };

  const skills = [
    { name: "千機突", cd: 0.75, cost: 5, damage: 38 },
    { name: "傘形切換", cd: 4.5, cost: 12, damage: 18, shield: 18 },
    { name: "全系連段", cd: 6.2, cost: 20, damage: 118 },
    { name: "千機百裂", cd: 14, cost: 36, damage: 260 }
  ];

  let last = performance.now();
  let pointerX = null;

  bind();
  requestAnimationFrame(loop);

  function bind() {
    skillButtons.forEach((button) => {
      button.addEventListener("click", () => cast(Number(button.dataset.skill)));
    });

    window.addEventListener("keydown", (event) => {
      const index = Number.parseInt(event.key, 10) - 1;
      if (index >= 0 && index < skills.length) cast(index);
      if (event.key === " ") cast(0);
      if (event.key === "a" || event.key === "ArrowLeft") state.yaw -= 0.08;
      if (event.key === "d" || event.key === "ArrowRight") state.yaw += 0.08;
      if (event.key === "w" || event.key === "ArrowUp") state.speed = 1;
      if (event.key === "s" || event.key === "ArrowDown") state.speed = -1;
    });

    window.addEventListener("keyup", () => {
      state.speed = 0;
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
    state.mp = Math.min(100, state.mp + dt * 8);
    state.bossDistance = clamp(state.bossDistance - state.speed * dt * 0.28, 0.35, 1.2);
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
    gradient.addColorStop(0, "#121613");
    gradient.addColorStop(0.48, "#222820");
    gradient.addColorStop(1, "#10130f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(215,168,63,0.16)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i += 1) {
      const x = ((i * 140 + state.yaw * 130) % 1120) - 80;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 180, canvas.height);
      ctx.stroke();
    }
  }

  function drawArena() {
    const horizon = 270 + Math.sin(state.yaw) * 8;
    ctx.fillStyle = "#171b16";
    ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);
    ctx.strokeStyle = "rgba(79,185,167,0.22)";
    for (let i = 0; i < 11; i += 1) {
      const y = horizon + i * i * 5.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    for (let i = -5; i <= 5; i += 1) {
      const x = canvas.width / 2 + i * 88 + Math.sin(state.yaw) * 80;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, horizon);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  function drawBoss() {
    const centerX = canvas.width / 2 - Math.sin(state.yaw) * 170;
    const centerY = 238 + state.bossDistance * 34;
    const size = 165 / state.bossDistance;
    const pulse = Math.sin(state.time * (state.phase === 1 ? 3 : 6)) * 8;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.fillStyle = state.phase === 1 ? "#8c78d6" : "#d9564a";
    ctx.strokeStyle = "rgba(242,240,232,0.8)";
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

    ctx.fillStyle = "#f2f0e8";
    ctx.font = `bold ${Math.max(20, size * 0.16)}px Microsoft JhengHei, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("BOSS", 0, 6);

    if (state.blast > 0) {
      ctx.globalAlpha = state.blast;
      ctx.strokeStyle = "#d7a83f";
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
    ctx.fillStyle = "#d7a83f";
    ctx.fillRect(-16, -190, 32, 240);
    ctx.fillStyle = "#f2f0e8";
    ctx.fillRect(-44, -132, 88, 22);
    ctx.fillStyle = "#4fb9a7";
    ctx.fillRect(-26, 42, 52, 96);
    if (state.shield > 0) {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = "#4fb9a7";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(-52, -58, 118, 0, Math.PI * 2);
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
})();
