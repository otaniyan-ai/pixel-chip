let enemies = [];

function updateEnemies() {
  for (const e of enemies) {
    if (e.remove) continue;
    if (e.dead) {
      e.squash = Math.min(1, e.squash + 0.1);
      if (e.squash >= 1) e.remove = true;
      continue;
    }
    if (e.type === 'fly') {
      e.flyPhase += 0.05;
      e.x += e.dir * e.speed;
      e.y = e.baseY + Math.sin(e.flyPhase) * 40;
      if (e.x < 0 || e.x + e.w > stageW * TILE) e.dir *= -1;
      continue;
    }
    if (e.type === 'jump') {
      if (e.jumpVy !== 0) {
        e.jumpVy += GRAVITY;
        e.y += e.jumpVy;
        const centerC = Math.floor((e.x + e.w / 2) / TILE);
        const feetRow = Math.floor((e.y + e.h) / TILE);
        if (isSolid(feetRow, centerC)) {
          e.y = feetRow * TILE - e.h;
          e.jumpVy = 0;
        }
      } else {
        const centerC = Math.floor((e.x + e.w / 2) / TILE);
        const feetRow = Math.floor((e.y + e.h) / TILE);
        if (isSolid(feetRow, centerC)) {
          e.jumpTimer++;
          if (e.jumpTimer > 90) {
            e.jumpVy = -8;
            e.jumpTimer = 0;
          }
        }
      }
    }
    if (e.type === 'shooter') {
      e.shootTimer++;
      if (e.shootTimer >= 90) {
        e.shootTimer = 0;
        enemyProjectiles.push({
          x: e.x + e.w / 2 + e.dir * 12,
          y: e.y + 8,
          w: 8, h: 8,
          vx: e.dir * 3,
          dead: false,
        });
        playSfx('fireball');
      }
    }
    e.x += e.dir * e.speed;
    const frontX = e.dir > 0 ? e.x + e.w : e.x;
    const top = Math.floor(e.y / TILE);
    const bot = Math.floor((e.y + e.h) / TILE);
    let hitWall = false;
    for (let r = top; r < bot; r++) {
      if (isSolid(r, Math.floor(frontX / TILE))) { hitWall = true; break; }
    }
    if (hitWall) e.dir *= -1;
    const feetRow = Math.floor((e.y + e.h) / TILE);
    const frontC = Math.floor(frontX / TILE);
    if (!isSolid(feetRow, frontC)) e.dir *= -1;
  }
}

function updateEnemyProjectiles() {
  for (const p of enemyProjectiles) {
    p.x += p.vx;
    p.y += p.vy || 0;
    const c = Math.floor((p.x + p.w / 2) / TILE);
    const r = Math.floor((p.y + p.h / 2) / TILE);
    if (r >= 0 && r < STAGE_H && c >= 0 && c < stageW && isSolid(r, c)) p.dead = true;
    if (p.x < cameraX - TILE || p.x > cameraX + SCREEN_W + TILE || p.y > STAGE_H * TILE) p.dead = true;
    if (player.alive && invincibility <= 0 &&
      player.x < p.x + p.w && player.x + player.w > p.x &&
      player.y < p.y + p.h && player.y + player.h > p.y) {
      p.dead = true;
      die();
    }
  }
  enemyProjectiles = enemyProjectiles.filter(p => !p.dead);
}

function bossDirToPlayer() {
  return player.x + player.w / 2 > boss.x + boss.w / 2 ? 1 : -1;
}
function bossShootSingle() {
  const d = bossDirToPlayer();
  enemyProjectiles.push({
    x: boss.x + boss.w / 2 + d * 20,
    y: boss.y + 20,
    w: 10, h: 10,
    vx: d * 4,
    vy: 0,
    dead: false,
  });
  playSfx('fireball');
}
function bossShootSpread() {
  const d = bossDirToPlayer();
  for (const vy of [-2, 0, 2]) {
    enemyProjectiles.push({
      x: boss.x + boss.w / 2 + d * 20,
      y: boss.y + 20,
      w: 10, h: 10,
      vx: d * 4,
      vy,
      dead: false,
    });
  }
  playSfx('fireball');
}
function bossShootBarrage() {
  bossShootSpread();
  const d = bossDirToPlayer();
  enemyProjectiles.push({
    x: boss.x + boss.w / 2 + d * 30,
    y: boss.y + 10,
    w: 10, h: 10,
    vx: d * 5,
    vy: -1,
    dead: false,
  });
  playSfx('fireball');
}
function defeatBoss() {
  boss.dead = true;
  enemiesDefeated++;
  bossDefeatTimer = 90;
  shakeTimer = 12;
  for (let i = 0; i < 12; i++) {
    particles.push({ x: boss.x + boss.w / 2, y: boss.y + boss.h / 2, vx: (i - 5.5) * 3, vy: -5 - Math.random() * 4, life: 60 });
  }
  playSfx('boss_victory');
}
function updateBoss() {
  if (!boss || boss.dead) return;
  boss.phase = boss.hp >= 7 ? 1 : boss.hp >= 4 ? 2 : 3;
  if (boss.stunnedTimer > 0) {
    boss.stunnedTimer--;
    if (boss.stunnedTimer === 0) boss.state = 'patrol';
  }
  if (boss.state === 'intro') {
    boss.introTimer--;
    if (boss.introTimer === 0) {
      boss.invulnerable = false;
      boss.state = 'patrol';
    }
    return;
  }
  if (boss.state === 'patrol') {
    const speed = boss.phase === 1 ? 1 : boss.phase === 2 ? 1.5 : 2;
    boss.x += boss.dir * speed;
    const rightLimit = Math.min(stageW * TILE - 50, flagX * TILE - 50);
    if (boss.x < 50 || boss.x + boss.w > rightLimit) boss.dir *= -1;
    boss.attackTimer++;
    const attackInterval = boss.phase === 1 ? 240 : boss.phase === 2 ? 200 : 150;
    if (boss.attackTimer >= attackInterval) {
      boss.attackTimer = 0;
      boss.attackCycle = (boss.attackCycle + 1) % (boss.phase === 1 ? 1 : boss.phase === 2 ? 2 : 4);
      if (boss.phase === 1) {
        bossShootSpread();
      } else if (boss.phase === 2) {
        if (boss.attackCycle === 1) {
          boss.state = 'telegraph';
          boss.timer = 45;
          boss.chargeDir = player.x + player.w / 2 > boss.x + boss.w / 2 ? 1 : -1;
        } else {
          bossShootSpread();
        }
      } else {
        if (boss.attackCycle === 1) {
          bossShootSpread();
        } else if (boss.attackCycle === 2) {
          boss.state = 'telegraph';
          boss.timer = 45;
          boss.chargeDir = player.x + player.w / 2 > boss.x + boss.w / 2 ? 1 : -1;
        } else if (boss.attackCycle === 3) {
          boss.state = 'jumpTelegraph';
          boss.timer = 30;
          boss.chargeDir = player.x + player.w / 2 > boss.x + boss.w / 2 ? 1 : -1;
        } else {
          bossShootBarrage();
        }
      }
    }
    if (boss.phase === 1) {
      boss.jumpTimer++;
      if (boss.jumpTimer >= 240) {
        boss.jumpTimer = 0;
        boss.jumpVy = -10;
      }
    }
  } else if (boss.state === 'telegraph') {
    boss.timer--;
    if (boss.timer === 0) {
      boss.state = 'charge';
      boss.timer = 30;
    }
  } else if (boss.state === 'charge') {
    boss.x += boss.chargeDir * 8;
    const rightLimit = Math.min(stageW * TILE - 50, flagX * TILE - 50);
    if (boss.x < 50 || boss.x + boss.w > rightLimit) {
      boss.x = Math.max(50, Math.min(boss.x, rightLimit - boss.w));
      boss.state = 'stunned';
      boss.stunnedTimer = 60;
      shakeTimer = 8;
    }
    boss.timer--;
    if (boss.timer === 0) {
      boss.state = 'stunned';
      boss.stunnedTimer = 60;
    }
  } else if (boss.state === 'jumpTelegraph') {
    boss.timer--;
    if (boss.timer === 0) {
      boss.state = 'jump';
      boss.jumpVy = -10;
    }
  } else if (boss.state === 'jump') {
    boss.x += boss.chargeDir * 3;
    const rightLimit = Math.min(stageW * TILE - 50, flagX * TILE - 50);
    if (boss.x < 50 || boss.x + boss.w > rightLimit) boss.x = Math.max(50, Math.min(boss.x, rightLimit - boss.w));
  }
  if (boss.jumpVy !== 0) {
    boss.jumpVy += GRAVITY;
    boss.y += boss.jumpVy;
    const feetRow = Math.floor((boss.y + boss.h) / TILE);
    const centerC = Math.floor((boss.x + boss.w / 2) / TILE);
    if (isSolid(feetRow, centerC)) {
      boss.y = feetRow * TILE - boss.h;
      boss.jumpVy = 0;
      if (boss.state === 'jump') {
        boss.state = 'patrol';
        shakeTimer = 6;
        if (player.alive && invincibility <= 0 &&
          Math.abs(player.x + player.w / 2 - (boss.x + boss.w / 2)) < 40 &&
          Math.abs(player.y + player.h / 2 - (boss.y + boss.h / 2)) < 40) {
          die();
        }
      }
    }
  }
  if (player.alive && invincibility <= 0 && !boss.invulnerable &&
    player.x < boss.x + boss.w && player.x + player.w > boss.x &&
    player.y < boss.y + boss.h && player.y + player.h > boss.y) {
    const isAbove = player.y + player.h <= boss.y + boss.h * 0.6 && player.vy >= 0;
    if (isAbove) {
      boss.hp--;
      player.vy = JUMP_POWER * 0.6;
      stompTimer = STOMP_WINDOW;
      stompCombo++;
      const comboScore = [100, 200, 400, 800][Math.min(stompCombo - 1, 3)];
      score += comboScore;
      playSfx('hit');
      if (boss.state === 'charge' || boss.state === 'jump') {
        boss.state = 'stunned';
        boss.stunnedTimer = 60;
        boss.jumpVy = 0;
      }
      if (boss.hp <= 0) defeatBoss();
    } else if (boss.state !== 'stunned') {
      die();
    }
  }
  for (const f of fireballs) {
    if (f.dead) continue;
    if (f.x < boss.x + boss.w && f.x + f.w > boss.x && f.y < boss.y + boss.h && f.y + f.h > boss.y) {
      boss.hp--;
      f.dead = true;
      score += 200;
      playSfx('hit');
      if (boss.hp <= 0) defeatBoss();
    }
  }
}
