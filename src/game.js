"use strict";

(() => {
  const STORAGE_KEY = "glory-mobile-prototype-save-v1";
  const canvas = document.querySelector("#gameCanvas");
  const ctx = canvas.getContext("2d");

  const jobs = [
    { name: "散人", family: "特殊", trait: "多武器切換", color: "#d7a83f" },
    { name: "劍客", family: "劍士系", trait: "高速連斬", color: "#d9564a" },
    { name: "狂劍士", family: "劍士系", trait: "低血爆發", color: "#d9564a" },
    { name: "魔劍士", family: "劍士系", trait: "劍氣附魔", color: "#8c78d6" },
    { name: "劍影", family: "劍士系", trait: "殘影突進", color: "#5d9bd6" },
    { name: "拳法家", family: "格鬥系", trait: "近身壓制", color: "#d7a83f" },
    { name: "氣功師", family: "格鬥系", trait: "護盾與氣波", color: "#4fb9a7" },
    { name: "柔道家", family: "格鬥系", trait: "抓取控制", color: "#74b66a" },
    { name: "街頭格鬥家", family: "格鬥系", trait: "異常狀態", color: "#d9564a" },
    { name: "神槍手", family: "神槍系", trait: "遠距點射", color: "#5d9bd6" },
    { name: "彈藥專家", family: "神槍系", trait: "元素彈藥", color: "#d7a83f" },
    { name: "槍砲師", family: "神槍系", trait: "重火力範圍", color: "#d9564a" },
    { name: "機械師", family: "神槍系", trait: "召喚砲台", color: "#4fb9a7" },
    { name: "元素法師", family: "魔法系", trait: "大範圍法術", color: "#8c78d6" },
    { name: "召喚師", family: "魔法系", trait: "召喚協戰", color: "#74b66a" },
    { name: "戰鬥法師", family: "魔法系", trait: "近戰法術連段", color: "#d7a83f" },
    { name: "魔道學者", family: "魔法系", trait: "裝置與藥劑", color: "#4fb9a7" },
    { name: "刺客", family: "暗夜系", trait: "背刺爆擊", color: "#8c78d6" },
    { name: "術士", family: "暗夜系", trait: "詛咒削弱", color: "#8c78d6" },
    { name: "忍者", family: "暗夜系", trait: "分身擾亂", color: "#d9564a" },
    { name: "影舞者", family: "暗夜系", trait: "高速位移", color: "#5d9bd6" },
    { name: "牧師", family: "聖職系", trait: "治療續航", color: "#74b66a" },
    { name: "騎士", family: "聖職系", trait: "防禦反擊", color: "#d7a83f" },
    { name: "守護天使", family: "聖職系", trait: "團隊護盾", color: "#4fb9a7" },
    { name: "驅魔師", family: "聖職系", trait: "封印與爆發", color: "#8c78d6" }
  ];

  const skillKits = {
    特殊: [
      { name: "千機突", short: "突", type: "strike", cd: 0.8, cost: 5, power: 1.05, range: 138 },
      { name: "傘形切換", short: "換", type: "stance", cd: 4.5, cost: 10, power: 0.45, range: 150 },
      { name: "全系連段", short: "連", type: "aoe", cd: 6.2, cost: 18, power: 1.2, range: 156 },
      { name: "千機百裂", short: "絕", type: "ultimate", cd: 14, cost: 34, power: 2.45, range: 230 }
    ],
    劍士系: [
      { name: "破風斬", short: "斬", type: "strike", cd: 0.9, cost: 5, power: 1.1, range: 132 },
      { name: "疾影步", short: "步", type: "dash", cd: 4, cost: 10, power: 0.8, range: 146 },
      { name: "劍氣迴旋", short: "旋", type: "aoe", cd: 6.5, cost: 20, power: 1.35, range: 152 },
      { name: "拔刀終式", short: "絕", type: "ultimate", cd: 15, cost: 32, power: 2.65, range: 228 }
    ],
    格鬥系: [
      { name: "崩拳", short: "拳", type: "strike", cd: 0.75, cost: 5, power: 1, range: 112 },
      { name: "貼身滑步", short: "滑", type: "dash", cd: 3.8, cost: 9, power: 0.85, range: 132 },
      { name: "震地連摔", short: "摔", type: "aoe", cd: 6.8, cost: 18, power: 1.42, range: 126 },
      { name: "百裂寸勁", short: "絕", type: "ultimate", cd: 13, cost: 30, power: 2.45, range: 180 }
    ],
    神槍系: [
      { name: "速射", short: "射", type: "strike", cd: 0.7, cost: 5, power: 0.92, range: 220 },
      { name: "翻滾裝填", short: "滾", type: "dash", cd: 4.2, cost: 9, power: 0.55, range: 156 },
      { name: "爆裂彈幕", short: "彈", type: "aoe", cd: 6.4, cost: 20, power: 1.28, range: 205 },
      { name: "衛星鎖定", short: "絕", type: "ultimate", cd: 15, cost: 34, power: 2.35, range: 280 }
    ],
    魔法系: [
      { name: "星火矢", short: "火", type: "strike", cd: 0.95, cost: 7, power: 1.05, range: 205 },
      { name: "瞬步法陣", short: "陣", type: "dash", cd: 4.8, cost: 12, power: 0.6, range: 150 },
      { name: "元素風暴", short: "暴", type: "aoe", cd: 7.2, cost: 24, power: 1.55, range: 185 },
      { name: "天隕術式", short: "絕", type: "ultimate", cd: 16, cost: 38, power: 2.85, range: 260 }
    ],
    暗夜系: [
      { name: "影刺", short: "刺", type: "strike", cd: 0.65, cost: 5, power: 0.98, range: 122 },
      { name: "暗步", short: "閃", type: "dash", cd: 3.5, cost: 10, power: 0.95, range: 168 },
      { name: "夜幕陷阱", short: "陷", type: "aoe", cd: 6.7, cost: 19, power: 1.32, range: 150 },
      { name: "無聲處決", short: "絕", type: "ultimate", cd: 14, cost: 32, power: 2.75, range: 195 }
    ],
    聖職系: [
      { name: "聖擊", short: "擊", type: "strike", cd: 0.9, cost: 5, power: 0.95, range: 126 },
      { name: "守護衝鋒", short: "護", type: "dash", cd: 4.5, cost: 11, power: 0.75, range: 132 },
      { name: "淨化領域", short: "淨", type: "heal", cd: 7, cost: 24, power: 1.15, range: 148 },
      { name: "神聖裁決", short: "絕", type: "ultimate", cd: 15, cost: 34, power: 2.4, range: 220 }
    ]
  };

  const dungeons = [
    {
      id: "training",
      name: "第十區訓練場",
      tone: "teal",
      energy: 4,
      level: 1,
      description: "快速練習連段與走位。",
      enemies: 7,
      boss: false,
      reward: { exp: 24, gold: 28 }
    },
    {
      id: "cavern",
      name: "埋骨深淵",
      tone: "violet",
      energy: 8,
      level: 2,
      description: "精英怪密集，掉落裝備素材。",
      enemies: 10,
      boss: true,
      reward: { exp: 56, gold: 62 }
    },
    {
      id: "fieldBoss",
      name: "野圖 Boss 爭奪",
      tone: "red",
      energy: 12,
      level: 3,
      description: "全服混戰模擬，Boss 會改變攻擊節奏。",
      enemies: 8,
      boss: true,
      reward: { exp: 96, gold: 118 }
    },
    {
      id: "league",
      name: "職業聯賽試煉",
      tone: "gold",
      energy: 10,
      level: 4,
      description: "連續擊敗 AI 選手，提升競技積分。",
      enemies: 6,
      boss: true,
      reward: { exp: 82, gold: 92, rating: 18 }
    }
  ];

  const gearTemplates = [
    { slot: "weapon", name: "銀武胚胎", stat: "atk", value: 8, rarity: "稀有" },
    { slot: "weapon", name: "寒鐵長刃", stat: "atk", value: 11, rarity: "史詩" },
    { slot: "armor", name: "疾行外甲", stat: "def", value: 6, rarity: "稀有" },
    { slot: "armor", name: "守護胸甲", stat: "hp", value: 34, rarity: "史詩" },
    { slot: "trinket", name: "連擊徽記", stat: "crit", value: 0.04, rarity: "稀有" },
    { slot: "trinket", name: "戰術終端", stat: "mp", value: 24, rarity: "史詩" }
  ];

  const guildMembers = [
    { name: "寒煙", role: "輸出", mark: "攻", power: 1280 },
    { name: "流木", role: "控場", mark: "控", power: 1190 },
    { name: "晨星", role: "治療", mark: "療", power: 1135 },
    { name: "鐵壁", role: "坦克", mark: "坦", power: 1210 }
  ];

  const dom = {
    screens: document.querySelectorAll(".screen-panel"),
    navs: document.querySelectorAll("[data-nav]"),
    playerName: document.querySelector("#playerName"),
    playerClass: document.querySelector("#playerClass"),
    powerValue: document.querySelector("#powerValue"),
    goldValue: document.querySelector("#goldValue"),
    hpBar: document.querySelector("#hpBar"),
    mpBar: document.querySelector("#mpBar"),
    hpText: document.querySelector("#hpText"),
    mpText: document.querySelector("#mpText"),
    targetName: document.querySelector("#targetName"),
    targetHpBar: document.querySelector("#targetHpBar"),
    questTitle: document.querySelector("#questTitle"),
    questText: document.querySelector("#questText"),
    combatLog: document.querySelector("#combatLog"),
    primaryAction: document.querySelector("#primaryAction"),
    liveEventTitle: document.querySelector("#liveEventTitle"),
    liveEventText: document.querySelector("#liveEventText"),
    claimLiveReward: document.querySelector("#claimLiveReward"),
    skillWheel: document.querySelector("#skillWheel"),
    classGrid: document.querySelector("#classGrid"),
    heroTitle: document.querySelector("#heroTitle"),
    heroDescription: document.querySelector("#heroDescription"),
    statGrid: document.querySelector("#statGrid"),
    skillList: document.querySelector("#skillList"),
    skillPointText: document.querySelector("#skillPointText"),
    dungeonList: document.querySelector("#dungeonList"),
    energyValue: document.querySelector("#energyValue"),
    gearSlots: document.querySelector("#gearSlots"),
    inventoryList: document.querySelector("#inventoryList"),
    craftButton: document.querySelector("#craftButton"),
    saveButton: document.querySelector("#saveButton"),
    pauseButton: document.querySelector("#pauseButton"),
    guildTeam: document.querySelector("#guildTeam"),
    guildStatus: document.querySelector("#guildStatus"),
    ratingValue: document.querySelector("#ratingValue"),
    seasonText: document.querySelector("#seasonText"),
    seasonReward: document.querySelector("#seasonReward"),
    leaderboard: document.querySelector("#leaderboard"),
    joystick: document.querySelector("#joystick"),
    stick: document.querySelector("#stick")
  };

  const defaultSave = {
    name: "榮耀新人",
    job: "散人",
    level: 1,
    exp: 0,
    gold: 160,
    energy: 60,
    skillPoints: 0,
    skillLevels: [1, 1, 1, 1],
    gear: { weapon: null, armor: null, trinket: null },
    inventory: [],
    questStep: 0,
    claimedLiveRewardKey: null,
    guildTech: 1,
    rating: 1000,
    seasonClaimed: false,
    stats: { wins: 0, losses: 0, bosses: 0 }
  };

  const save = loadSave();
  const input = {
    x: 0,
    y: 0,
    keys: new Set(),
    pointerId: null
  };

  const world = {
    width: 960,
    height: 540,
    paused: false,
    mode: dungeons[0],
    enemies: [],
    effects: [],
    floaters: [],
    projectiles: [],
    timer: 0,
    waveComplete: false,
    message: "第十區訓練場",
    cameraShake: 0,
    cooldowns: [0, 0, 0, 0],
    buffs: [],
    combo: 0,
    bossAdapted: false,
    serverState: null,
    serverStateError: null,
    lastUiRender: 0
  };

  const player = {
    x: 480,
    y: 305,
    r: 18,
    hp: 100,
    mp: 100,
    faceX: 1,
    faceY: 0,
    invuln: 0,
    revive: 0
  };

  let lastTime = performance.now();
  let saveTimer = 0;

  init();

  function init() {
    rebuildPlayerVitals();
    createSkillButtons();
    bindEvents();
    startDungeon("training", false);
    refreshServerState();
    window.setInterval(refreshServerState, 30000);
    renderAll();
    log("已進入第十區，行動端原型啟動。");
    requestAnimationFrame(loop);
  }

  function bindEvents() {
    dom.navs.forEach((button) => {
      button.addEventListener("click", () => switchScreen(button.dataset.nav));
    });

    dom.primaryAction.addEventListener("click", () => {
      if (world.waveComplete) {
        claimDungeonReward();
      } else {
        startDungeon(world.mode.id, true);
      }
    });

    dom.claimLiveReward.addEventListener("click", claimLiveReward);

    dom.saveButton.addEventListener("click", () => {
      persist();
      log("角色資料已存檔。");
    });

    dom.pauseButton.addEventListener("click", () => {
      world.paused = !world.paused;
      dom.pauseButton.textContent = world.paused ? "▶" : "II";
    });

    dom.craftButton.addEventListener("click", craftGear);

    document.querySelectorAll("[data-guild-action]").forEach((button) => {
      button.addEventListener("click", () => runGuildAction(button.dataset.guildAction));
    });

    document.querySelectorAll("[data-arena]").forEach((button) => {
      button.addEventListener("click", () => runArena(button.dataset.arena));
    });

    dom.seasonReward.addEventListener("click", claimSeasonReward);

    window.addEventListener("keydown", (event) => {
      input.keys.add(event.key.toLowerCase());
      const skillIndex = Number.parseInt(event.key, 10) - 1;
      if (skillIndex >= 0 && skillIndex < 4) {
        useSkill(skillIndex);
      }
      if (event.code === "Space") {
        useSkill(0);
      }
    });

    window.addEventListener("keyup", (event) => {
      input.keys.delete(event.key.toLowerCase());
    });

    dom.joystick.addEventListener("pointerdown", onStickStart);
    dom.joystick.addEventListener("pointermove", onStickMove);
    dom.joystick.addEventListener("pointerup", onStickEnd);
    dom.joystick.addEventListener("pointercancel", onStickEnd);
  }

  function createSkillButtons() {
    dom.skillWheel.innerHTML = "";
    getSkills().forEach((skill, index) => {
      const button = document.createElement("button");
      button.className = "skill-button ready";
      button.type = "button";
      button.dataset.skill = String(index);
      button.setAttribute("aria-label", skill.name);
      button.innerHTML = `<i class="cooldown"></i><b>${skill.short}</b><span>${skill.name}</span>`;
      button.addEventListener("click", () => useSkill(index));
      dom.skillWheel.append(button);
    });
  }

  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (!world.paused) {
      update(dt);
    }
    draw();
    if (now - world.lastUiRender > 120) {
      renderCombatUi();
      world.lastUiRender = now;
    }
    saveTimer += dt;
    if (saveTimer > 12) {
      persist();
      saveTimer = 0;
    }
    requestAnimationFrame(loop);
  }

  function update(dt) {
    world.timer += dt;
    for (let index = 0; index < world.cooldowns.length; index += 1) {
      world.cooldowns[index] = Math.max(0, world.cooldowns[index] - dt);
    }
    player.invuln = Math.max(0, player.invuln - dt);
    updateBuffs(dt);
    updateMovement(dt);
    updateEnemies(dt);
    updateProjectiles(dt);
    updateEffects(dt);
    player.mp = clamp(player.mp + (8 + save.level * 0.5) * dt, 0, getMaxMp());
    if (player.hp <= 0) {
      updateRevive(dt);
    }
    if (!world.waveComplete && world.enemies.length === 0) {
      finishWave();
    }
  }

  function updateMovement(dt) {
    if (player.hp <= 0) return;
    let x = input.x;
    let y = input.y;
    if (input.keys.has("a") || input.keys.has("arrowleft")) x -= 1;
    if (input.keys.has("d") || input.keys.has("arrowright")) x += 1;
    if (input.keys.has("w") || input.keys.has("arrowup")) y -= 1;
    if (input.keys.has("s") || input.keys.has("arrowdown")) y += 1;
    const length = Math.hypot(x, y);
    if (length > 0) {
      x /= length;
      y /= length;
      player.faceX = x;
      player.faceY = y;
    }
    const speed = 172 + getStat("haste") * 16;
    player.x = clamp(player.x + x * speed * dt, player.r, world.width - player.r);
    player.y = clamp(player.y + y * speed * dt, 92, world.height - player.r - 16);
  }

  function updateEnemies(dt) {
    for (const enemy of world.enemies) {
      if (enemy.hp <= 0) continue;
      enemy.attackTimer -= dt;
      enemy.aiTimer -= dt;
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.max(Math.hypot(dx, dy), 1);
      const nx = dx / dist;
      const ny = dy / dist;
      if (enemy.kind === "boss") {
        updateBoss(enemy, dt, dist, nx, ny);
      }
      if (dist > enemy.range && player.hp > 0) {
        enemy.x += nx * enemy.speed * dt;
        enemy.y += ny * enemy.speed * dt;
      }
      if (dist <= enemy.range && enemy.attackTimer <= 0 && player.hp > 0) {
        enemy.attackTimer = enemy.kind === "boss" ? 1.15 : 1.45;
        damagePlayer(enemy.atk, enemy.name);
        addEffect("hit", player.x, player.y, 46, enemy.color);
      }
    }
  }

  function updateBoss(enemy, dt, dist, nx, ny) {
    if (!world.bossAdapted && enemy.hp < enemy.maxHp * 0.5) {
      world.bossAdapted = true;
      enemy.speed += 18;
      enemy.atk += 4;
      world.cameraShake = 10;
      log(`${enemy.name} 讀取你的連段，進入二階段。`);
    }
    if (enemy.aiTimer <= 0) {
      enemy.aiTimer = world.bossAdapted ? 1.6 : 2.3;
      const angle = Math.atan2(ny, nx);
      for (let i = -1; i <= 1; i += 1) {
        const spread = angle + i * 0.28;
        world.projectiles.push({
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(spread) * 230,
          vy: Math.sin(spread) * 230,
          r: 8,
          life: 2.2,
          damage: enemy.atk * 0.7,
          color: enemy.color
        });
      }
      addEffect("ring", enemy.x, enemy.y, 78, enemy.color);
    }
    if (dist < 90) {
      enemy.x -= nx * enemy.speed * 0.38 * dt;
      enemy.y -= ny * enemy.speed * 0.38 * dt;
    }
  }

  function updateProjectiles(dt) {
    world.projectiles = world.projectiles.filter((projectile) => {
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;
      if (projectile.life <= 0) return false;
      if (player.hp > 0 && distance(projectile, player) < projectile.r + player.r) {
        damagePlayer(projectile.damage, "Boss 技能");
        addEffect("hit", player.x, player.y, 54, projectile.color);
        return false;
      }
      return projectile.x > -20 && projectile.x < world.width + 20 && projectile.y > -20 && projectile.y < world.height + 20;
    });
  }

  function updateEffects(dt) {
    world.effects = world.effects.filter((effect) => {
      effect.life -= dt;
      effect.age += dt;
      return effect.life > 0;
    });
    world.floaters = world.floaters.filter((floater) => {
      floater.life -= dt;
      floater.y -= 28 * dt;
      return floater.life > 0;
    });
    world.cameraShake = Math.max(0, world.cameraShake - 24 * dt);
  }

  function updateBuffs(dt) {
    world.buffs = world.buffs.filter((buff) => {
      buff.duration -= dt;
      return buff.duration > 0;
    });
  }

  function updateRevive(dt) {
    player.revive -= dt;
    if (player.revive <= 0) {
      player.hp = Math.floor(getMaxHp() * 0.65);
      player.mp = Math.floor(getMaxMp() * 0.55);
      player.invuln = 1.5;
      player.x = 480;
      player.y = 305;
      log("角色完成整備，重新投入戰場。");
    }
  }

  function useSkill(index) {
    if (world.paused || player.hp <= 0) return;
    const skill = getSkills()[index];
    if (!skill || world.cooldowns[index] > 0) return;
    const level = save.skillLevels[index] || 1;
    const cost = Math.max(1, Math.floor(skill.cost + level * 1.6));
    if (player.mp < cost) {
      log("MP 不足，連段中斷。");
      return;
    }
    player.mp -= cost;
    world.cooldowns[index] = Math.max(0.25, skill.cd * (1 - getStat("haste") * 0.025));

    const power = skill.power + level * 0.12;
    if (skill.type === "strike") {
      strike(skill, power);
    } else if (skill.type === "dash") {
      dash(skill, power);
    } else if (skill.type === "aoe") {
      areaAttack(skill, power);
    } else if (skill.type === "heal") {
      healField(skill, power);
    } else if (skill.type === "stance") {
      switchStance(skill, power);
    } else if (skill.type === "ultimate") {
      ultimate(skill, power);
    }
    renderCombatUi();
  }

  function strike(skill, power) {
    const target = nearestEnemy(skill.range);
    if (!target) {
      addEffect("slash", player.x + player.faceX * 42, player.y + player.faceY * 42, 62, getJob().color);
      log(`${skill.name} 揮空。`);
      return;
    }
    const crit = Math.random() < getStat("crit");
    const damage = calcDamage(power, crit);
    damageEnemy(target, damage, crit);
    addEffect("slash", target.x, target.y, 68, getJob().color);
    world.combo += 1;
  }

  function dash(skill, power) {
    const target = nearestEnemy(skill.range + 70);
    let dx = player.faceX;
    let dy = player.faceY;
    if (target) {
      const dist = Math.max(distance(player, target), 1);
      dx = (target.x - player.x) / dist;
      dy = (target.y - player.y) / dist;
    }
    player.x = clamp(player.x + dx * 92, player.r, world.width - player.r);
    player.y = clamp(player.y + dy * 92, 92, world.height - player.r - 16);
    addEffect("dash", player.x, player.y, 84, getJob().color);
    for (const enemy of world.enemies) {
      if (distance(player, enemy) <= skill.range) {
        damageEnemy(enemy, calcDamage(power, false), false);
      }
    }
    world.combo += 1;
  }

  function areaAttack(skill, power) {
    let hits = 0;
    for (const enemy of world.enemies) {
      if (distance(player, enemy) <= skill.range) {
        const crit = Math.random() < getStat("crit") * 0.75;
        damageEnemy(enemy, calcDamage(power, crit), crit);
        hits += 1;
      }
    }
    addEffect("ring", player.x, player.y, skill.range, getJob().color);
    if (hits === 0) log(`${skill.name} 未命中。`);
    world.combo += hits;
  }

  function healField(skill, power) {
    const heal = Math.floor((getStat("atk") * power + save.level * 6) * (1 + save.guildTech * 0.03));
    player.hp = clamp(player.hp + heal, 0, getMaxHp());
    addFloater(player.x, player.y - 16, `+${heal}`, "#74b66a");
    addEffect("ring", player.x, player.y, skill.range, "#74b66a");
    for (const enemy of world.enemies) {
      if (distance(player, enemy) <= skill.range) {
        damageEnemy(enemy, calcDamage(power * 0.75, false), false);
      }
    }
    log(`${skill.name} 回復生命並淨化周圍敵人。`);
  }

  function switchStance(skill, power) {
    const stanceNames = ["矛形", "槍形", "盾形", "法杖形"];
    const next = (world.buffs.find((buff) => buff.type === "stance")?.index || 0) + 1;
    const index = next % stanceNames.length;
    world.buffs = world.buffs.filter((buff) => buff.type !== "stance");
    world.buffs.push({ type: "stance", index, duration: 7, atk: power * 7, haste: 1 });
    addEffect("ring", player.x, player.y, skill.range, getJob().color);
    log(`${skill.name}：切換為${stanceNames[index]}。`);
  }

  function ultimate(skill, power) {
    const target = nearestEnemy(skill.range + 80);
    const center = target || player;
    let hits = 0;
    for (const enemy of world.enemies) {
      if (distance(center, enemy) <= skill.range) {
        const crit = Math.random() < getStat("crit") + 0.08;
        damageEnemy(enemy, calcDamage(power, crit), crit);
        hits += 1;
      }
    }
    addEffect("ultimate", center.x, center.y, skill.range, getJob().color);
    world.cameraShake = 14;
    world.combo += Math.max(1, hits * 2);
    log(`${skill.name} 展開，命中 ${hits} 個目標。`);
  }

  function damageEnemy(enemy, amount, crit) {
    const finalDamage = Math.max(1, Math.floor(amount - enemy.def));
    enemy.hp -= finalDamage;
    addFloater(enemy.x, enemy.y - enemy.r, crit ? `${finalDamage}!` : String(finalDamage), crit ? "#d7a83f" : "#f2f0e8");
    if (enemy.hp <= 0) {
      defeatEnemy(enemy);
    }
  }

  function defeatEnemy(enemy) {
    enemy.hp = 0;
    addEffect("burst", enemy.x, enemy.y, enemy.r * 2.8, enemy.color);
    const exp = enemy.exp + Math.floor(world.mode.reward.exp * 0.14);
    const gold = enemy.gold + Math.floor(world.mode.reward.gold * 0.12);
    gainExp(exp);
    save.gold += gold;
    if (enemy.kind === "boss") {
      save.stats.bosses += 1;
      maybeDropGear(0.95);
      log(`擊敗 ${enemy.name}，取得 Boss 掉落。`);
    } else if (Math.random() < 0.18) {
      maybeDropGear(0.28);
    }
    world.enemies = world.enemies.filter((item) => item.hp > 0);
  }

  function damagePlayer(amount, source) {
    if (player.invuln > 0 || player.hp <= 0) return;
    const damage = Math.max(1, Math.floor(amount - getStat("def") * 0.65));
    player.hp -= damage;
    addFloater(player.x, player.y - 22, `-${damage}`, "#d9564a");
    if (player.hp <= 0) {
      player.hp = 0;
      player.revive = 2.4;
      world.combo = 0;
      log(`${source} 擊倒了你，開始整備。`);
    }
  }

  function calcDamage(power, crit) {
    let damage = getStat("atk") * power + save.level * 3 + world.combo * 0.35;
    if (crit) damage *= 1.65;
    if (world.buffs.some((buff) => buff.type === "stance")) damage += 7;
    return damage;
  }

  function startDungeon(id, spendEnergy) {
    const mode = dungeons.find((item) => item.id === id) || dungeons[0];
    if (spendEnergy && save.energy < mode.energy) {
      log("體力不足，先完成競技或公會派遣取得補給。");
      return;
    }
    if (spendEnergy) save.energy -= mode.energy;
    world.mode = mode;
    world.enemies = [];
    world.effects = [];
    world.floaters = [];
    world.projectiles = [];
    world.waveComplete = false;
    world.bossAdapted = false;
    world.timer = 0;
    world.combo = 0;
    world.message = mode.name;
    player.x = 480;
    player.y = 305;
    player.hp = Math.max(player.hp, Math.floor(getMaxHp() * 0.72));
    player.mp = Math.max(player.mp, Math.floor(getMaxMp() * 0.66));

    for (let index = 0; index < mode.enemies; index += 1) {
      world.enemies.push(createEnemy(index, false, mode));
    }
    if (mode.boss) {
      world.enemies.push(createEnemy(mode.enemies + 1, true, mode));
    }
    log(`進入 ${mode.name}。`);
    renderAll();
  }

  function createEnemy(index, boss, mode) {
    const angle = (Math.PI * 2 * index) / Math.max(mode.enemies, 1);
    const radius = boss ? 170 : 155 + (index % 3) * 36;
    const levelScale = Math.max(1, mode.level + save.level * 0.45);
    const x = clamp(480 + Math.cos(angle) * radius + random(-28, 28), 54, world.width - 54);
    const y = clamp(302 + Math.sin(angle) * radius + random(-18, 18), 110, world.height - 54);
    if (boss) {
      return {
        kind: "boss",
        name: mode.id === "fieldBoss" ? "野圖守衛者" : mode.id === "league" ? "聯賽 AI 隊長" : "深淵領主",
        x,
        y,
        r: 30,
        hp: Math.floor(260 + levelScale * 95),
        maxHp: Math.floor(260 + levelScale * 95),
        atk: Math.floor(17 + levelScale * 5.2),
        def: 6 + mode.level,
        speed: 72 + mode.level * 6,
        range: 58,
        attackTimer: 1,
        aiTimer: 1.6,
        color: mode.id === "fieldBoss" ? "#d9564a" : "#8c78d6",
        exp: 44 + mode.level * 12,
        gold: 36 + mode.level * 14
      };
    }
    const elite = index % 5 === 0 && mode.level > 1;
    return {
      kind: elite ? "elite" : "mob",
      name: elite ? "精英守衛" : "副本守衛",
      x,
      y,
      r: elite ? 20 : 16,
      hp: Math.floor((elite ? 74 : 48) + levelScale * (elite ? 22 : 14)),
      maxHp: Math.floor((elite ? 74 : 48) + levelScale * (elite ? 22 : 14)),
      atk: Math.floor((elite ? 13 : 9) + levelScale * 2.4),
      def: elite ? 4 : 2,
      speed: elite ? 86 : 98,
      range: elite ? 42 : 34,
      attackTimer: random(0.3, 1.4),
      aiTimer: random(1.2, 2.6),
      color: elite ? "#d7a83f" : "#4fb9a7",
      exp: elite ? 12 : 7,
      gold: elite ? 10 : 6
    };
  }

  function finishWave() {
    world.waveComplete = true;
    world.combo = 0;
    if (save.questStep < 4) save.questStep += 1;
    log(`${world.mode.name} 攻略完成。`);
    dom.primaryAction.textContent = "結算";
    renderAll();
  }

  function claimDungeonReward() {
    const reward = world.mode.reward;
    gainExp(reward.exp);
    save.gold += reward.gold;
    if (reward.rating) save.rating += reward.rating;
    save.energy = clamp(save.energy + 3, 0, getMaxEnergy());
    maybeDropGear(world.mode.boss ? 0.55 : 0.22);
    log(`結算完成：EXP +${reward.exp}，金幣 +${reward.gold}。`);
    startDungeon("training", false);
  }

  function gainExp(amount) {
    save.exp += amount;
    let next = expToNext();
    while (save.exp >= next) {
      save.exp -= next;
      save.level += 1;
      save.skillPoints += 1;
      save.energy = clamp(save.energy + 12, 0, getMaxEnergy());
      rebuildPlayerVitals(true);
      log(`等級提升至 Lv.${save.level}，獲得技能點。`);
      next = expToNext();
    }
  }

  function maybeDropGear(chance) {
    if (Math.random() > chance) return;
    const template = gearTemplates[Math.floor(Math.random() * gearTemplates.length)];
    const levelBonus = Math.max(0, save.level - 1);
    const item = {
      id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      slot: template.slot,
      name: template.name,
      stat: template.stat,
      value: Number((template.value + levelBonus * (template.stat === "crit" ? 0.004 : 1.8)).toFixed(3)),
      rarity: template.rarity
    };
    save.inventory.unshift(item);
    save.inventory = save.inventory.slice(0, 24);
    log(`獲得裝備：${item.name}。`);
  }

  function craftGear() {
    const cost = 90 + save.level * 12;
    if (save.gold < cost) {
      log("金幣不足，無法打造。");
      return;
    }
    save.gold -= cost;
    maybeDropGear(1);
    renderAll();
  }

  function equipItem(id) {
    const index = save.inventory.findIndex((item) => item.id === id);
    if (index < 0) return;
    const item = save.inventory[index];
    const current = save.gear[item.slot];
    save.gear[item.slot] = item;
    save.inventory.splice(index, 1);
    if (current) save.inventory.unshift(current);
    rebuildPlayerVitals();
    log(`已裝備 ${item.name}。`);
    renderAll();
  }

  function upgradeSkill(index) {
    if (save.skillPoints <= 0) return;
    save.skillPoints -= 1;
    save.skillLevels[index] = (save.skillLevels[index] || 1) + 1;
    log(`${getSkills()[index].name} 升至 Lv.${save.skillLevels[index]}。`);
    renderAll();
  }

  function selectJob(name) {
    save.job = name;
    world.cooldowns = [0, 0, 0, 0];
    createSkillButtons();
    rebuildPlayerVitals(true);
    log(`已切換職業原型：${name}。`);
    renderAll();
  }

  function runGuildAction(action) {
    if (action === "raid") {
      const raid = dungeons.find((dungeon) => dungeon.id === "cavern");
      if (save.energy < raid.energy) {
        log("體力不足，無法開啟公會副本。");
        renderAll();
        return;
      }
      startDungeon("cavern", true);
      switchScreen("adventure");
      return;
    }
    if (action === "tech") {
      const cost = 140 + save.guildTech * 80;
      if (save.gold < cost) {
        log("公會科技資金不足。");
      } else {
        save.gold -= cost;
        save.guildTech += 1;
        log(`公會科技升至 Lv.${save.guildTech}。`);
      }
    }
    if (action === "dispatch") {
      const gain = 28 + save.guildTech * 6;
      save.energy = clamp(save.energy + 8, 0, getMaxEnergy());
      save.gold += gain;
      log(`AI 隊友派遣完成，金幣 +${gain}，體力 +8。`);
    }
    renderAll();
  }

  function runArena(mode) {
    const teamSize = Number.parseInt(mode, 10) || 1;
    const playerScore = getPower() + save.rating * 0.4 + random(-80, 120);
    const enemyScore = 760 + save.level * 108 + teamSize * 135 + random(-120, 160);
    const won = playerScore >= enemyScore;
    const delta = won ? 18 + teamSize * 3 : -(10 + teamSize);
    save.rating = Math.max(600, save.rating + delta);
    save.energy = clamp(save.energy + (won ? 7 : 3), 0, getMaxEnergy());
    if (won) {
      save.stats.wins += 1;
      save.gold += 44 + teamSize * 12;
      gainExp(18 + teamSize * 8);
      log(`${mode} 勝利，競技積分 +${delta}。`);
    } else {
      save.stats.losses += 1;
      log(`${mode} 惜敗，競技積分 ${delta}。`);
    }
    renderAll();
  }

  function claimSeasonReward() {
    if (save.seasonClaimed) {
      log("本季獎勵已領取。");
      return;
    }
    const reward = Math.floor(save.rating * 0.08);
    save.gold += reward;
    save.skillPoints += save.rating >= 1150 ? 1 : 0;
    save.seasonClaimed = true;
    log(`領取賽季獎勵：金幣 +${reward}。`);
    renderAll();
  }

  function switchScreen(name) {
    dom.screens.forEach((panel) => panel.classList.toggle("active", panel.dataset.screen === name));
    dom.navs.forEach((button) => button.classList.toggle("active", button.dataset.nav === name));
    renderAll();
  }

  function renderAll() {
    renderHeader();
    renderCombatUi();
    renderQuest();
    renderLiveOps();
    renderHero();
    renderDungeons();
    renderInventory();
    renderGuild();
    renderArena();
  }

  function renderHeader() {
    dom.playerName.textContent = save.name;
    dom.playerClass.textContent = `${save.job} Lv.${save.level}`;
    dom.powerValue.textContent = `戰力 ${getPower()}`;
    dom.goldValue.textContent = `金幣 ${save.gold}`;
  }

  function renderCombatUi() {
    const maxHp = getMaxHp();
    const maxMp = getMaxMp();
    dom.hpBar.style.width = `${(player.hp / maxHp) * 100}%`;
    dom.mpBar.style.width = `${(player.mp / maxMp) * 100}%`;
    dom.hpText.textContent = `${Math.floor(player.hp)}/${maxHp}`;
    dom.mpText.textContent = `${Math.floor(player.mp)}/${maxMp}`;
    const target = nearestEnemy(9999, true);
    dom.targetName.textContent = target ? target.name : world.mode.name;
    dom.targetHpBar.style.width = target ? `${clamp(target.hp / target.maxHp, 0, 1) * 100}%` : "0%";
    const buttons = dom.skillWheel.querySelectorAll(".skill-button");
    getSkills().forEach((skill, index) => {
      const button = buttons[index];
      if (!button) return;
      const ratio = clamp(world.cooldowns[index] / skill.cd, 0, 1);
      button.classList.toggle("ready", ratio === 0);
      button.querySelector(".cooldown").style.height = `${ratio * 100}%`;
      button.classList.toggle("locked", player.mp < skill.cost);
    });
  }

  function renderQuest() {
    const quests = [
      ["建立角色", "完成第一場訓練戰。"],
      ["連段入門", "使用技能擊敗副本守衛。"],
      ["裝備打造", "取得或打造一件裝備。"],
      ["公會協作", "完成一次公會派遣或公會副本。"],
      ["競技開幕", "參加任一競技模式。"]
    ];
    const quest = quests[Math.min(save.questStep, quests.length - 1)];
    dom.questTitle.textContent = quest[0];
    dom.questText.textContent = quest[1];
    dom.primaryAction.textContent = world.waveComplete ? "結算" : "出戰";
  }

  function renderLiveOps() {
    const event = world.serverState?.event;
    if (!event) {
      dom.liveEventTitle.textContent = world.serverStateError ? "連線失敗" : "連線中";
      dom.liveEventText.textContent = world.serverStateError || "正在讀取伺服器活動。";
      dom.claimLiveReward.disabled = true;
      return;
    }
    const claimed = save.claimedLiveRewardKey === event.windowId;
    dom.liveEventTitle.textContent = event.title;
    dom.liveEventText.textContent = `${event.description} ${event.modifier}`;
    dom.claimLiveReward.disabled = claimed;
    dom.claimLiveReward.textContent = claimed ? "已領" : "領取";
  }

  function renderHero() {
    const job = getJob();
    dom.heroTitle.textContent = job.name;
    dom.heroDescription.textContent = `${job.family}，${job.trait}。`;
    dom.statGrid.innerHTML = [
      ["戰力", getPower()],
      ["攻擊", getStat("atk")],
      ["防禦", getStat("def")],
      ["爆擊", `${Math.round(getStat("crit") * 100)}%`],
      ["生命", getMaxHp()],
      ["法力", getMaxMp()]
    ]
      .map(([label, value]) => `<div class="stat-tile"><span>${label}</span><strong>${value}</strong></div>`)
      .join("");

    dom.classGrid.innerHTML = jobs
      .map(
        (item) => `
          <button class="class-card ${item.name === save.job ? "active" : ""}" data-job="${item.name}" type="button">
            <strong>${item.name}</strong>
            <span>${item.family} · ${item.trait}</span>
          </button>
        `
      )
      .join("");
    dom.classGrid.querySelectorAll("[data-job]").forEach((button) => {
      button.addEventListener("click", () => selectJob(button.dataset.job));
    });

    dom.skillPointText.textContent = `可用點數 ${save.skillPoints}`;
    dom.skillList.innerHTML = getSkills()
      .map((skill, index) => {
        const level = save.skillLevels[index] || 1;
        return `
          <div class="skill-row">
            <div>
              <strong>${skill.name} Lv.${level}</strong>
              <span>冷卻 ${skill.cd}s · 消耗 ${skill.cost + level} MP · ${skillTypeName(skill.type)}</span>
            </div>
            <button data-upgrade="${index}" ${save.skillPoints <= 0 ? "disabled" : ""} type="button">升級</button>
          </div>
        `;
      })
      .join("");
    dom.skillList.querySelectorAll("[data-upgrade]").forEach((button) => {
      button.addEventListener("click", () => upgradeSkill(Number(button.dataset.upgrade)));
    });
  }

  function renderDungeons() {
    dom.energyValue.textContent = `體力 ${save.energy}/${getMaxEnergy()}`;
    dom.dungeonList.innerHTML = dungeons
      .map(
        (mode) => `
          <div class="mode-card" data-tone="${mode.tone}">
            <div>
              <strong>${mode.name}</strong>
              <span>Lv.${mode.level} · 體力 ${mode.energy} · ${mode.description}</span>
            </div>
            <button data-dungeon="${mode.id}" type="button">進入</button>
          </div>
        `
      )
      .join("");
    dom.dungeonList.querySelectorAll("[data-dungeon]").forEach((button) => {
      button.addEventListener("click", () => {
        startDungeon(button.dataset.dungeon, true);
        switchScreen("adventure");
      });
    });
  }

  function renderInventory() {
    const slots = [
      ["weapon", "武器"],
      ["armor", "防具"],
      ["trinket", "飾品"]
    ];
    dom.gearSlots.innerHTML = slots
      .map(([slot, label]) => {
        const item = save.gear[slot];
        return `<div class="gear-slot"><span>${label}</span><strong>${item ? item.name : "未裝備"}</strong></div>`;
      })
      .join("");
    if (save.inventory.length === 0) {
      dom.inventoryList.innerHTML = `<div class="inventory-item"><strong>背包空位</strong><span>副本、Boss、打造會產出裝備。</span></div>`;
      return;
    }
    dom.inventoryList.innerHTML = save.inventory
      .map(
        (item) => `
          <div class="inventory-item">
            <div>
              <strong>${item.name}</strong>
              <span>${slotName(item.slot)} · ${item.rarity} · ${statName(item.stat)} +${formatStat(item)}</span>
            </div>
            <button data-equip="${item.id}" type="button">裝備</button>
          </div>
        `
      )
      .join("");
    dom.inventoryList.querySelectorAll("[data-equip]").forEach((button) => {
      button.addEventListener("click", () => equipItem(button.dataset.equip));
    });
  }

  function renderGuild() {
    dom.guildStatus.textContent = `科技 Lv.${save.guildTech} · 勝場 ${save.stats.wins} · Boss ${save.stats.bosses}`;
    dom.guildTeam.innerHTML = guildMembers
      .map(
        (member) => `
          <div class="team-member">
            <div class="member-mark">${member.mark}</div>
            <div>
              <strong>${member.name}</strong>
              <span>戰力 ${member.power + save.guildTech * 45}</span>
            </div>
            <div class="member-role">${member.role}</div>
          </div>
        `
      )
      .join("");
  }

  function renderArena() {
    dom.ratingValue.textContent = `積分 ${save.rating}`;
    dom.seasonText.textContent = `${world.serverState?.season || "新秀季"} · ${save.stats.wins} 勝 ${save.stats.losses} 敗 · ${rankName(save.rating)}`;
    dom.seasonReward.textContent = save.seasonClaimed ? "已領" : "領取";
    const serverRivals = world.serverState?.leaderboard?.map((item) => [item.name, item.rating]) || [];
    const rivals = [
      ...serverRivals,
      [save.name, save.rating]
    ].sort((a, b) => b[1] - a[1]).slice(0, 6);
    dom.leaderboard.innerHTML = rivals
      .map((item, index) => `<li><strong>${index + 1}. ${item[0]}</strong><span>${item[1]}</span></li>`)
      .join("");
  }

  async function refreshServerState() {
    try {
      const response = await fetch("/api/game-state", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      world.serverState = await response.json();
      world.serverStateError = null;
      renderLiveOps();
      renderArena();
    } catch (error) {
      world.serverStateError = "暫時無法讀取 Live Ops。";
      renderLiveOps();
    }
  }

  function claimLiveReward() {
    const event = world.serverState?.event;
    if (!event || save.claimedLiveRewardKey === event.windowId) return;
    save.gold += event.reward.gold;
    save.energy = clamp(save.energy + event.reward.energy, 0, getMaxEnergy());
    save.claimedLiveRewardKey = event.windowId;
    persist();
    log(`領取 ${event.title}：金幣 +${event.reward.gold}，體力 +${event.reward.energy}。`);
    renderAll();
  }

  function draw() {
    const shakeX = world.cameraShake ? random(-world.cameraShake, world.cameraShake) : 0;
    const shakeY = world.cameraShake ? random(-world.cameraShake, world.cameraShake) : 0;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(shakeX, shakeY);
    drawArenaFloor();
    drawEffects("under");
    drawEnemies();
    drawPlayer();
    drawProjectiles();
    drawEffects("over");
    drawFloaters();
    drawStatusText();
    ctx.restore();
  }

  function drawArenaFloor() {
    ctx.fillStyle = "#171a15";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1f241e";
    for (let x = -40; x < canvas.width + 40; x += 80) {
      for (let y = 88; y < canvas.height + 40; y += 80) {
        if (((x + y) / 80) % 2 === 0) {
          ctx.fillRect(x, y, 80, 80);
        }
      }
    }
    ctx.strokeStyle = "rgba(215,168,63,0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(480, 306, 344, 172, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(79,185,167,0.16)";
    ctx.strokeRect(36, 92, 888, 410);
  }

  function drawPlayer() {
    const job = getJob();
    const pulse = 1 + Math.sin(world.timer * 7) * 0.025;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = player.invuln > 0 ? "#f2f0e8" : job.color;
    ctx.beginPath();
    ctx.arc(0, 0, player.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f2f0e8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.faceX * 7, player.faceY * 7);
    ctx.lineTo(player.faceX * 30, player.faceY * 30);
    ctx.stroke();
    ctx.fillStyle = "#151714";
    ctx.font = "bold 13px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(job.name.slice(0, 1), 0, 1);
    ctx.restore();
  }

  function drawEnemies() {
    for (const enemy of world.enemies) {
      const hpRatio = clamp(enemy.hp / enemy.maxHp, 0, 1);
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      if (enemy.kind === "boss") {
        polygon(enemy.r, 8);
      } else if (enemy.kind === "elite") {
        polygon(enemy.r, 6);
      } else {
        ctx.arc(0, 0, enemy.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.strokeStyle = "rgba(242,240,232,0.72)";
      ctx.lineWidth = enemy.kind === "boss" ? 3 : 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(-enemy.r, -enemy.r - 12, enemy.r * 2, 5);
      ctx.fillStyle = enemy.kind === "boss" ? "#d9564a" : "#74b66a";
      ctx.fillRect(-enemy.r, -enemy.r - 12, enemy.r * 2 * hpRatio, 5);
      ctx.restore();
    }
  }

  function drawProjectiles() {
    for (const projectile of world.projectiles) {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(242,240,232,0.5)";
      ctx.stroke();
    }
  }

  function drawEffects(layer) {
    for (const effect of world.effects) {
      const t = 1 - effect.life / effect.maxLife;
      const alpha = layer === "under" ? 0.22 : 0.78;
      if (effect.layer !== layer) continue;
      ctx.save();
      ctx.globalAlpha = (1 - t) * alpha;
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = effect.color;
      ctx.lineWidth = effect.type === "ultimate" ? 5 : 3;
      if (effect.type === "ring" || effect.type === "ultimate") {
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * t, 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === "slash") {
        ctx.translate(effect.x, effect.y);
        ctx.rotate(world.timer * 6);
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * 0.42, -0.2, Math.PI * 1.15);
        ctx.stroke();
      } else if (effect.type === "dash") {
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (1 - t * 0.4), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (1 - t * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawFloaters() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 18px Microsoft JhengHei, sans-serif";
    for (const floater of world.floaters) {
      ctx.globalAlpha = clamp(floater.life, 0, 1);
      ctx.fillStyle = floater.color;
      ctx.fillText(floater.text, floater.x, floater.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawStatusText() {
    ctx.fillStyle = "rgba(21,23,20,0.72)";
    ctx.fillRect(0, 0, canvas.width, 76);
    ctx.fillStyle = "#f2f0e8";
    ctx.font = "bold 22px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(world.mode.name, 30, 34);
    ctx.fillStyle = "#a9afa3";
    ctx.font = "15px Microsoft JhengHei, sans-serif";
    const enemyCount = world.enemies.length;
    const status = world.waveComplete ? "副本完成" : `敵方 ${enemyCount} · 連段 ${world.combo}`;
    ctx.fillText(status, 30, 58);
  }

  function polygon(radius, sides) {
    ctx.beginPath();
    for (let i = 0; i < sides; i += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / sides;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function addEffect(type, x, y, radius, color) {
    world.effects.push({
      type,
      x,
      y,
      radius,
      color,
      life: type === "ultimate" ? 0.75 : 0.42,
      maxLife: type === "ultimate" ? 0.75 : 0.42,
      age: 0,
      layer: type === "ring" || type === "ultimate" ? "under" : "over"
    });
  }

  function addFloater(x, y, text, color) {
    world.floaters.push({ x, y, text, color, life: 0.9 });
  }

  function nearestEnemy(range, preferBoss) {
    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const enemy of world.enemies) {
      const dist = distance(player, enemy);
      const bossBias = preferBoss && enemy.kind === "boss" ? -120 : 0;
      if (dist <= range && dist + bossBias < bestDist) {
        best = enemy;
        bestDist = dist + bossBias;
      }
    }
    return best;
  }

  function rebuildPlayerVitals(healFull) {
    const maxHp = getMaxHp();
    const maxMp = getMaxMp();
    player.hp = healFull ? maxHp : clamp(player.hp || maxHp, 1, maxHp);
    player.mp = healFull ? maxMp : clamp(player.mp || maxMp, 0, maxMp);
  }

  function getJob() {
    return jobs.find((job) => job.name === save.job) || jobs[0];
  }

  function getSkills() {
    return skillKits[getJob().family] || skillKits.特殊;
  }

  function getStat(stat) {
    const family = getJob().family;
    const base = {
      atk: 22 + save.level * 4,
      def: 5 + save.level * 1.4,
      haste: 1,
      crit: 0.08,
      hp: 112 + save.level * 21,
      mp: 82 + save.level * 15
    };
    if (family === "劍士系") {
      base.atk += 5;
      base.def += 1;
    }
    if (family === "格鬥系") {
      base.hp += 20;
      base.haste += 1;
    }
    if (family === "神槍系") {
      base.crit += 0.04;
      base.haste += 1;
    }
    if (family === "魔法系") {
      base.mp += 28;
      base.atk += 3;
    }
    if (family === "暗夜系") {
      base.crit += 0.07;
      base.haste += 2;
    }
    if (family === "聖職系") {
      base.def += 4;
      base.hp += 24;
    }
    if (family === "特殊") {
      base.atk += 2;
      base.haste += 2;
      base.crit += 0.03;
    }
    for (const item of Object.values(save.gear)) {
      if (!item) continue;
      if (item.stat === stat) base[stat] += item.value;
    }
    for (const buff of world.buffs) {
      if (stat === "atk" && buff.atk) base.atk += buff.atk;
      if (stat === "haste" && buff.haste) base.haste += buff.haste;
    }
    if (stat === "atk" || stat === "def" || stat === "hp" || stat === "mp") {
      return Math.floor(base[stat] * (1 + (save.guildTech - 1) * 0.025));
    }
    return base[stat];
  }

  function getMaxHp() {
    return getStat("hp");
  }

  function getMaxMp() {
    return getStat("mp");
  }

  function getMaxEnergy() {
    return 70 + save.level * 4 + save.guildTech * 2;
  }

  function getPower() {
    return Math.floor(getStat("atk") * 28 + getStat("def") * 18 + getMaxHp() * 1.9 + getMaxMp() * 1.2 + getStat("crit") * 900 + save.skillLevels.reduce((sum, level) => sum + level * 38, 0));
  }

  function expToNext() {
    return 80 + save.level * 45;
  }

  function log(message) {
    const row = document.createElement("span");
    row.textContent = message;
    dom.combatLog.prepend(row);
    while (dom.combatLog.children.length > 6) {
      dom.combatLog.lastElementChild.remove();
    }
  }

  function onStickStart(event) {
    input.pointerId = event.pointerId;
    dom.joystick.setPointerCapture(event.pointerId);
    onStickMove(event);
  }

  function onStickMove(event) {
    if (input.pointerId !== event.pointerId) return;
    const rect = dom.joystick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const max = rect.width * 0.36;
    const length = Math.min(Math.hypot(dx, dy), max);
    const angle = Math.atan2(dy, dx);
    const sx = Math.cos(angle) * length;
    const sy = Math.sin(angle) * length;
    input.x = sx / max;
    input.y = sy / max;
    dom.stick.style.transform = `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px))`;
  }

  function onStickEnd(event) {
    if (input.pointerId !== event.pointerId) return;
    input.pointerId = null;
    input.x = 0;
    input.y = 0;
    dom.stick.style.transform = "translate(-50%, -50%)";
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultSave);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaultSave),
        ...parsed,
        gear: { ...defaultSave.gear, ...(parsed.gear || {}) },
        stats: { ...defaultSave.stats, ...(parsed.stats || {}) },
        skillLevels: Array.isArray(parsed.skillLevels) ? parsed.skillLevels : [...defaultSave.skillLevels],
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : []
      };
    } catch (error) {
      console.warn("Save loading failed", error);
      return structuredClone(defaultSave);
    }
  }

  function skillTypeName(type) {
    return {
      strike: "單體",
      dash: "位移",
      aoe: "範圍",
      heal: "回復",
      stance: "切換",
      ultimate: "爆發"
    }[type];
  }

  function slotName(slot) {
    return { weapon: "武器", armor: "防具", trinket: "飾品" }[slot] || slot;
  }

  function statName(stat) {
    return { atk: "攻擊", def: "防禦", hp: "生命", mp: "法力", crit: "爆擊" }[stat] || stat;
  }

  function formatStat(item) {
    return item.stat === "crit" ? `${Math.round(item.value * 100)}%` : Math.round(item.value);
  }

  function rankName(rating) {
    if (rating >= 1450) return "職業級";
    if (rating >= 1250) return "菁英級";
    if (rating >= 1100) return "進階級";
    return "新秀級";
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
