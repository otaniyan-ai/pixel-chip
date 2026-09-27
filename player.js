const player = {
  x: 0, y: 0, vx: 0, vy: 0, w: 26, h: 30,
  onGround: false, facing: 1, alive: true,
  coyote: 0, squash: 0, animTime: 0, stepCooldown: 0,
  firePower: true,
};

function resolveX() {
  const top = Math.floor((player.y + 1) / TILE);
  const bot = Math.floor((player.y + player.h - 1) / TILE);
  if (player.vx > 0) {
    const right = Math.floor((player.x + player.w) / TILE);
    for (let r = top; r <= bot; r++) {
      if (isSolid(r, right)) {
        player.x = right * TILE - player.w - 0.5;
        player.vx = 0;
        return true;
      }
    }
  } else if (player.vx < 0) {
    const left = Math.floor(player.x / TILE);
    for (let r = top; r <= bot; r++) {
      if (isSolid(r, left)) {
        player.x = (left + 1) * TILE + 0.5;
        player.vx = 0;
        return true;
      }
    }
  }
  return false;
}

function resolveY() {
  const left = Math.floor(player.x / TILE);
  const right = Math.floor((player.x + player.w) / TILE);
  if (player.vy > 0) {
    const bot = Math.floor((player.y + player.h) / TILE);
    for (let c = left; c <= right; c++) {
      if (isSolid(bot, c)) {
        player.y = bot * TILE - player.h;
        player.vy = 0;
        player.onGround = true;
        return true;
      }
    }
  } else if (player.vy < 0) {
    const top = Math.floor(player.y / TILE);
    let hit = false;
    for (let c = left; c <= right; c++) {
      if (isSolid(top, c)) {
        hit = true;
        hitBlock(top, c);
      }
    }
    if (hit) {
      player.y = (top + 1) * TILE;
      player.vy = 0;
      return true;
    }
  }
  return false;
}

function onLadder() {
  const c = Math.floor((player.x + player.w / 2) / TILE);
  const top = Math.floor(player.y / TILE);
  const bot = Math.floor((player.y + player.h) / TILE);
  for (let r = top; r <= bot; r++) {
    if (r >= 0 && r < STAGE_H && c >= 0 && c < stageW && map[r][c] === LADDER) return true;
  }
  return false;
}
function onMovingLadder() {
  for (const l of movingLadders) {
    const overlapX = player.x < l.x + TILE && player.x + player.w > l.x;
    const overlapY = player.y < l.y + TILE && player.y + player.h > l.y;
    if (overlapX && overlapY) return l;
  }
  return null;
}
function onSpring() {
  const feetY = player.y + player.h;
  const feetX = player.x + player.w / 2;
  for (const s of springs) {
    if (Math.abs(feetX - (s.x + TILE / 2)) < TILE / 2 && Math.abs(feetY - s.y) < 4) return s;
  }
  return null;
}
function onConveyor() {
  const feetY = player.y + player.h;
  const feetX = player.x + player.w / 2;
  for (const c of conveyors) {
    if (feetX >= c.x && feetX < c.x + c.w && Math.abs(feetY - c.y) < 4) return c;
  }
  return null;
}
function onFireFloor() {
  const feetY = player.y + player.h;
  const feetX = player.x + player.w / 2;
  for (const f of fireFloors) {
    if (feetX >= f.x && feetX < f.x + f.w && Math.abs(feetY - f.y) < 4) return f;
  }
  return null;
}

function updatePlayer() {
  if (!player.alive) return;
  const wasAirborne = !player.onGround;
  player.vx = 0;
  if (keys['ArrowLeft'] || keys['KeyA']) { player.vx = -MOVE; player.facing = -1; }
  else if (keys['ArrowRight'] || keys['KeyD']) { player.vx = MOVE; player.facing = 1; }
  const ladder = onLadder();
  const ml = onMovingLadder();
  if (ladder || ml) {
    player.vy = 0;
    if (keys['ArrowUp'] || keys['KeyW']) player.vy = -MOVE;
    else if (keys['ArrowDown'] || keys['KeyS']) player.vy = MOVE;
    player.onGround = false;
    if (ml) player.y += ml.dy;
  } else {
    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && (player.onGround || player.coyote > 0)) {
      player.vy = JUMP_POWER;
      player.onGround = false;
      player.coyote = 0;
      playSfx('jump');
    }
    let grav = GRAVITY;
    if (player.vy < 0 && (keys['ArrowUp'] || keys['KeyW'] || keys['Space'])) grav = GRAVITY_HOLD;
    player.vy += grav;
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;
  }
  updatePlatforms();
  for (const p of platforms) {
    const feet = player.y + player.h;
    if (p.vertical) {
      if (player.x < p.x + p.w && player.x + player.w > p.x &&
          Math.abs(feet - p.oldY) <= 2 && player.vy >= 0) {
        player.y += p.dy;
      }
    } else {
      if (player.x < p.oldX + p.w && player.x + player.w > p.oldX &&
          Math.abs(feet - p.y) <= 2 && player.vy >= 0) {
        player.x += p.dx;
      }
    }
  }
  if (player.firePower && (keys['KeyX'] || keys['KeyK']) && fireCooldown <= 0) {
    fireballs.push({ x: player.x + player.w / 2 + player.facing * 10, y: player.y + 8, w: 10, h: 10, vx: player.facing * 6, dead: false });
    fireCooldown = FIREBALL_COOLDOWN;
    playSfx('fireball');
  }
  if (fireCooldown > 0) fireCooldown--;
  player.x += player.vx;
  const conveyor = onConveyor();
  if (conveyor && player.onGround) {
    player.x += conveyor.speed * conveyor.dir;
  }
  if (player.x < 0) player.x = 0;
  resolveX();
  player.y += player.vy;
  resolveY();
  resolvePlatforms();
  for (const p of breakablePlatforms) {
    if (p.state !== 'idle') continue;
    const overlapX = player.x < p.x + p.w && player.x + player.w > p.x;
    const overlapY = player.y < p.y + p.h && player.y + player.h >= p.y;
    if (overlapX && overlapY && player.vy >= 0 && player.y + player.h - player.vy <= p.y + 1) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }
  const spring = onSpring();
  if (spring && (player.onGround || player.vy > 0)) {
    player.vy = -spring.power;
    player.onGround = false;
    playSfx('jump');
  }
  const fireFloor = onFireFloor();
  if (fireFloor && player.onGround) {
    die();
  }
  if (player.onGround) player.coyote = 5;
  else player.coyote = Math.max(0, player.coyote - 1);
  if (player.onGround && wasAirborne) player.squash = 0.8;
  player.squash = Math.max(0, player.squash - 0.08);
  if (player.y > SCREEN_H + 100) die();
  if (invincibility > 0) invincibility--;
  if (stompTimer > 0) {
    stompTimer--;
    if (stompTimer === 0) stompCombo = 0;
  }
  for (const e of enemies) {
    if (e.dead) continue;
    if (player.x < e.x + e.w && player.x + player.w > e.x && player.y < e.y + e.h && player.y + player.h > e.y) {
      const isAbove = player.y + player.h <= e.y + e.h * 0.6 && player.vy >= 0;
      if (isAbove) {
        e.dead = true;
        player.vy = JUMP_POWER * 0.6;
        stompTimer = STOMP_WINDOW;
        stompCombo++;
        const comboScore = [100, 200, 400, 800][Math.min(stompCombo - 1, 3)];
        score += comboScore;
        enemiesDefeated++;
        playSfx('hit');
      } else if (invincibility <= 0) {
        die();
      }
    }
  }
  for (const c of coins) {
    if (c.collected) continue;
    if (player.x < c.x + c.w && player.x + player.w > c.x && player.y < c.y + c.h && player.y + player.h > c.y) {
      c.collected = true;
      score += 100;
      coinsCollected++;
      playSfx('coin');
    }
  }
  for (const cp of checkpoints) {
    if (!cp.active &&
      player.x < cp.x + 16 && player.x + player.w > cp.x &&
      player.y < cp.y + player.h && player.y + player.h > cp.y) {
      cp.active = true;
      playSfx('checkpoint');
    }
  }
  player.animTime += Math.abs(player.vx) * 0.1;
  if (player.onGround && Math.abs(player.vx) > 0) {
    player.stepCooldown--;
    if (player.stepCooldown <= 0) {
      playSfx('footstep');
      player.stepCooldown = FOOTSTEP_COOLDOWN;
    }
  } else {
    player.stepCooldown = 0;
  }
}

function die() {
  if (!player.alive) return;
  player.alive = false;
  lives--;
  playSfx('fall');
  respawnTimer = 40;
}

function updateRespawn() {
  if (!player.alive && respawnTimer > 0) {
    respawnTimer--;
    if (respawnTimer === 0) {
      if (lives <= 0) {
        state = STATE_GAME_OVER;
        gameOverTimer = 0;
        stopBgm();
        playSfx('gameover');
        saveHighScore();
        updateTouchControls();
      } else {
        const cfg = getStageConfig(level);
        const cp = checkpoints.find(c => c.active);
        player.x = cp ? cp.x : cfg.playerStart.x * TILE;
        player.y = cp ? cp.y : (cfg.playerStart.feetRow - 1) * TILE - player.h;
        player.vx = 0;
        player.vy = 0;
        player.onGround = false;
        player.alive = true;
        player.facing = 1;
        player.squash = 0;
        player.coyote = 0;
        player.stepCooldown = 0;
        invincibility = 90;
        cameraX = Math.max(0, Math.min(player.x - SCREEN_W * 0.4, stageW * TILE - SCREEN_W));
      }
    }
  }
}
