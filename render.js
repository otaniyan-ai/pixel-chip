function wrap(v, range) {
  let r = v % range;
  if (r < 0) r += range;
  return r;
}
function drawBackground() {
  const bg = getStageConfig(level).bg;
  const grad = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  grad.addColorStop(0, bg.skyTop);
  grad.addColorStop(1, bg.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  if (bg.mountains) drawMountains(bg);
  drawClouds(bg);
}

function drawMountains(bg) {
  const distantParallax = cameraX * 0.05;
  const farParallax = cameraX * 0.1;
  const nearParallax = cameraX * 0.15;
  const midParallax = cameraX * 0.2;
  const foregroundParallax = cameraX * 0.4;
  ctx.fillStyle = bg.mountainDistant;
  ctx.fillRect(0, 260, SCREEN_W, 60);
  for (let i = 0; i < 6; i++) {
    const baseX = i * 140;
    const x = wrap(baseX - distantParallax, SCREEN_W + 140) - 70;
    ctx.fillRect(x, 220, 100, 100);
    ctx.fillRect(x + 15, 200, 60, 120);
  }
  ctx.fillStyle = bg.mountainFar;
  ctx.fillRect(0, 280, SCREEN_W, 40);
  for (let i = 0; i < 5; i++) {
    const baseX = i * 160;
    const x = wrap(baseX - farParallax, SCREEN_W + 160) - 80;
    ctx.fillRect(x, 240, 120, 80);
    ctx.fillRect(x + 20, 220, 80, 100);
    ctx.fillRect(x + 40, 200, 40, 120);
  }
  ctx.fillStyle = bg.mountainNear;
  ctx.fillRect(0, 300, SCREEN_W, 20);
  for (let i = 0; i < 4; i++) {
    const baseX = i * 200 + 50;
    const x = wrap(baseX - nearParallax, SCREEN_W + 200) - 100;
    ctx.fillRect(x, 260, 160, 60);
    ctx.fillRect(x + 30, 240, 100, 80);
    ctx.fillRect(x + 60, 220, 40, 100);
  }
  ctx.fillStyle = bg.mountainMid;
  ctx.fillRect(0, 310, SCREEN_W, 10);
  for (let i = 0; i < 5; i++) {
    const baseX = i * 180 + 20;
    const x = wrap(baseX - midParallax, SCREEN_W + 180) - 90;
    ctx.fillRect(x, 280, 140, 40);
    ctx.fillRect(x + 25, 260, 90, 60);
    ctx.fillRect(x + 50, 240, 30, 80);
  }
  ctx.fillStyle = bg.mountainForeground;
  ctx.fillRect(0, 320, SCREEN_W, 10);
  for (let i = 0; i < 4; i++) {
    const baseX = i * 220 + 80;
    const x = wrap(baseX - foregroundParallax, SCREEN_W + 220) - 110;
    ctx.fillRect(x, 300, 180, 30);
    ctx.fillRect(x + 40, 280, 120, 50);
    ctx.fillRect(x + 80, 260, 40, 70);
  }
}

function drawClouds(bg) {
  ctx.fillStyle = bg.cloudColor;
  const parallax = cameraX * 0.3;
  for (let i = 0; i < 5; i++) {
    const baseX = i * 250 + cloudOffset;
    const x = wrap(baseX - parallax, SCREEN_W + 200) - 100;
    const y = 30 + (i * 25) % 120;
    ctx.fillRect(x, y, 40, 12);
    ctx.fillRect(x + 12, y - 8, 24, 12);
    ctx.fillRect(x + 28, y - 16, 32, 12);
  }
}

function drawTiles() {
  const startCol = Math.floor(cameraX / TILE);
  const count = Math.ceil(SCREEN_W / TILE) + 2;
  for (let c = startCol; c < startCol + count; c++) {
    for (let r = 0; r < STAGE_H; r++) {
      const t = map[r][c];
      const sx = c * TILE - cameraX;
      const sy = r * TILE;
      if (sx > SCREEN_W + 32 || sx + TILE < -32) continue;
      if (t === GROUND) {
        const isTop = r > 0 && map[r - 1][c] !== GROUND;
        ctx.fillStyle = '#9c6a3a';
        ctx.fillRect(sx, sy, TILE, TILE);
        if (isTop) {
          ctx.fillStyle = '#7ab04a';
          ctx.fillRect(sx, sy, TILE, 10);
          ctx.fillStyle = '#8a7a4a';
          ctx.fillRect(sx + 6, sy + 3, 8, 4);
          ctx.fillRect(sx + 18, sy + 3, 8, 4);
        }
      } else if (t === BRICK) {
        ctx.fillStyle = '#b05a2a';
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = '#8a3a1a';
        ctx.fillRect(sx, sy + 14, TILE, 4);
        ctx.fillRect(sx + 14, sy, 4, 14);
        ctx.fillRect(sx + 14, sy + 18, 4, 14);
      } else if (t === PIPE_TOP) {
        ctx.fillStyle = '#2a9a2a';
        ctx.fillRect(sx - 2, sy, TILE + 4, TILE);
        ctx.fillStyle = '#1a7a1a';
        ctx.fillRect(sx - 2, sy, 4, 8);
        ctx.fillRect(sx + TILE - 2, sy, 4, 8);
        ctx.fillStyle = '#4ab04a';
        ctx.fillRect(sx + 2, sy + 2, TILE - 4, 8);
      } else if (t === PIPE_BODY) {
        ctx.fillStyle = '#2a9a2a';
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = '#1a7a1a';
        ctx.fillRect(sx, sy, 4, TILE);
        ctx.fillRect(sx + TILE - 4, sy, 4, TILE);
        ctx.fillStyle = '#4ab04a';
        ctx.fillRect(sx + 4, sy, TILE - 8, TILE);
      } else if (t === QUESTION) {
        ctx.fillStyle = '#e0a020';
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = '#c08010';
        ctx.fillRect(sx + 2, sy + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = '#fff7c0';
        ctx.fillRect(sx + 10, sy + 8, 12, 12);
        ctx.fillStyle = '#e0a020';
        ctx.fillRect(sx + 12, sy + 10, 8, 8);
      } else if (t === QUESTION_USED) {
        ctx.fillStyle = '#8a7a5a';
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = '#6a5a4a';
        ctx.fillRect(sx + 2, sy + 2, TILE - 4, TILE - 4);
      } else if (t === BRICK_BREAKABLE) {
        ctx.fillStyle = '#c07030';
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = '#905020';
        ctx.fillRect(sx, sy + 14, TILE, 4);
        ctx.fillRect(sx + 14, sy, 4, 14);
        ctx.fillRect(sx + 14, sy + 18, 4, 14);
      } else if (t === LADDER) {
        ctx.fillStyle = '#8a5a2a';
        ctx.fillRect(sx + 8, sy, 4, TILE);
        ctx.fillRect(sx + 20, sy, 4, TILE);
        ctx.fillStyle = '#6a4a1a';
        ctx.fillRect(sx + 6, sy + 8, 20, 4);
        ctx.fillRect(sx + 6, sy + 20, 20, 4);
      }
    }
  }
}

function drawCoins() {
  for (const c of coins) {
    if (c.collected) continue;
    const sx = c.x - cameraX;
    const sy = c.y;
    if (sx < -20 || sx > SCREEN_W + 20) continue;
    const flash = Math.floor(Date.now() / 150) % 2;
    ctx.fillStyle = flash ? '#ffd700' : '#e6b800';
    ctx.fillRect(sx + 4, sy + 4, 16, 16);
    ctx.fillStyle = '#fff7c0';
    ctx.fillRect(sx + 8, sy + 8, 8, 8);
  }
}
function drawPopCoins() {
  for (const c of popCoins) {
    const sx = c.x - cameraX;
    const sy = c.y;
    if (sx < -20 || sx > SCREEN_W + 20) continue;
    const alpha = Math.min(1, c.life / 20);
    ctx.fillStyle = 'rgba(255,215,0,' + alpha + ')';
    ctx.fillRect(sx - 8, sy - 8, 16, 16);
    ctx.fillStyle = 'rgba(255,247,192,' + alpha + ')';
    ctx.fillRect(sx - 4, sy - 4, 8, 8);
  }
}
function drawParticles() {
  for (const p of particles) {
    const sx = p.x - cameraX;
    const sy = p.y;
    if (sx < -20 || sx > SCREEN_W + 20) continue;
    const alpha = Math.min(1, p.life / 20);
    ctx.fillStyle = 'rgba(192,112,48,' + alpha + ')';
    ctx.fillRect(sx - 4, sy - 4, 8, 8);
  }
}
function drawItems() {
  for (const it of items) {
    const sx = it.x - cameraX;
    const sy = it.y;
    if (sx < -20 || sx > SCREEN_W + 20) continue;
    if (it.type === 'mushroom') {
      ctx.fillStyle = '#e04030';
      ctx.fillRect(sx + 4, sy + 4, 16, 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx + 6, sy + 8, 12, 6);
      ctx.fillStyle = '#e0c090';
      ctx.fillRect(sx + 8, sy + 16, 8, 8);
    } else if (it.type === 'fireflower') {
      ctx.fillStyle = '#4080c0';
      ctx.fillRect(sx + 8, sy + 14, 8, 10);
      ctx.fillStyle = '#e04030';
      ctx.fillRect(sx + 4, sy + 4, 16, 12);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx + 8, sy + 8, 8, 8);
    }
  }
}
function drawFireballs() {
  for (const f of fireballs) {
    const sx = f.x - cameraX;
    const sy = f.y;
    if (sx < -20 || sx > SCREEN_W + 20) continue;
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(sx, sy, f.w, f.h);
    ctx.fillStyle = '#e04030';
    ctx.fillRect(sx + 2, sy + 2, f.w - 4, f.h - 4);
  }
}
function drawEnemyProjectiles() {
  for (const p of enemyProjectiles) {
    const sx = p.x - cameraX;
    const sy = p.y;
    if (sx < -20 || sx > SCREEN_W + 20) continue;
    ctx.fillStyle = '#9040c0';
    ctx.fillRect(sx, sy, p.w, p.h);
    ctx.fillStyle = '#6030a0';
    ctx.fillRect(sx + 2, sy + 2, p.w - 4, p.h - 4);
  }
}
function drawCheckpoints() {
  for (const cp of checkpoints) {
    const sx = cp.x - cameraX;
    const sy = cp.y;
    if (sx < -20 || sx > SCREEN_W + 20) continue;
    ctx.fillStyle = cp.active ? '#ffd700' : '#808080';
    ctx.fillRect(sx + 6, sy + 10, 10, 20);
    ctx.fillStyle = cp.active ? '#fff' : '#c0c0c0';
    ctx.fillRect(sx + 10, sy + 12, 14, 10);
  }
}
function drawPlatforms() {
  for (const p of platforms) {
    const sx = p.x - cameraX;
    const sy = p.y;
    if (sx < -40 || sx > SCREEN_W + 40) continue;
    ctx.fillStyle = '#4070c0';
    ctx.fillRect(sx, sy, p.w, p.h);
    ctx.fillStyle = '#2a50a0';
    ctx.fillRect(sx, sy + p.h - 4, p.w, 4);
    ctx.fillStyle = '#6090e0';
    ctx.fillRect(sx + 4, sy + 4, p.w - 8, p.h - 8);
  }
}
function drawMovingLadders() {
  for (const l of movingLadders) {
    const sx = l.x - cameraX;
    const sy = l.y;
    if (sx < -40 || sx > SCREEN_W + 40) continue;
    ctx.fillStyle = '#8a5a2a';
    ctx.fillRect(sx + 8, sy, 4, TILE);
    ctx.fillRect(sx + 20, sy, 4, TILE);
    ctx.fillStyle = '#6a4a1a';
    ctx.fillRect(sx + 6, sy + 8, 20, 4);
    ctx.fillRect(sx + 6, sy + 20, 20, 4);
  }
}
function drawFireFloors() {
  for (const f of fireFloors) {
    const sx = f.x - cameraX;
    const sy = f.y;
    if (sx < -40 || sx > SCREEN_W + 40) continue;
    ctx.fillStyle = '#e04030';
    ctx.fillRect(sx, sy + 16, f.w, 8);
    ctx.fillStyle = '#ffd700';
    const flame = Math.floor(Date.now() / 100) % 2;
    for (let i = 0; i < Math.floor(f.w / 16); i++) {
      const fx = sx + 8 + i * 16;
      ctx.fillRect(fx, sy + 12 - flame * 4, 4, 8);
    }
  }
}
function drawConveyors() {
  for (const c of conveyors) {
    const sx = c.x - cameraX;
    const sy = c.y;
    if (sx < -40 || sx > SCREEN_W + 40) continue;
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(sx, sy + 16, c.w, 8);
    ctx.fillStyle = '#6a6a6a';
    const arrowDir = c.dir > 0 ? 1 : -1;
    for (let i = 0; i < Math.floor(c.w / 16); i++) {
      const ax = sx + 8 + i * 16 + (arrowDir > 0 ? (Date.now() % 16) : -(Date.now() % 16));
      ctx.fillRect(ax, sy + 18, 4, 4);
    }
  }
}
function drawSprings() {
  for (const s of springs) {
    const sx = s.x - cameraX;
    const sy = s.y;
    if (sx < -40 || sx > SCREEN_W + 40) continue;
    ctx.fillStyle = '#e04030';
    ctx.fillRect(sx + 4, sy + 16, TILE - 8, 8);
    ctx.fillStyle = '#c03020';
    ctx.fillRect(sx + 8, sy + 12, TILE - 16, 4);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(sx + 12, sy + 8, TILE - 24, 4);
  }
}
function drawBreakablePlatforms() {
  for (const p of breakablePlatforms) {
    if (p.state === 'gone') continue;
    const sx = p.x - cameraX;
    const sy = p.y;
    if (sx < -40 || sx > SCREEN_W + 40) continue;
    ctx.fillStyle = '#c04040';
    ctx.fillRect(sx, sy, p.w, p.h);
    ctx.fillStyle = '#902020';
    ctx.fillRect(sx, sy + p.h - 4, p.w, 4);
    ctx.fillStyle = '#e06060';
    ctx.fillRect(sx + 4, sy + 4, p.w - 8, p.h - 8);
  }
}

function drawEnemies() {
  for (const e of enemies) {
    if (e.remove) continue;
    const sx = e.x - cameraX;
    const sy = e.y;
    if (sx < -40 || sx > SCREEN_W + 40) continue;
    const color = ENEMY_COLORS[e.type] || ENEMY_COLORS.walk;
    if (e.dead) {
      const flat = 1 - e.squash * 0.7;
      ctx.fillStyle = color.body;
      ctx.fillRect(sx, sy + e.h - 6 * flat, e.w, 6 * flat);
      continue;
    }
    ctx.save();
    ctx.translate(sx + e.w / 2, sy + e.h / 2);
    if (e.dir < 0) ctx.scale(-1, 1);
    drawEnemyBody(color);
    if (e.type === 'fly') {
      const flap = Math.floor(Date.now() / 100) % 2;
      ctx.fillStyle = color.top;
      if (flap) {
        ctx.fillRect(-15, -12, 6, 4);
        ctx.fillRect(9, -12, 6, 4);
      } else {
        ctx.fillRect(-15, -8, 6, 4);
        ctx.fillRect(9, -8, 6, 4);
      }
    }
    if (e.type === 'shooter') {
      ctx.fillStyle = color.top;
      ctx.fillRect(8, -4, 8, 6);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(12, -2, 4, 4);
    }
    ctx.restore();
  }
}

function drawEnemyBody(color) {
  const w = 26, h = 26;
  ctx.fillStyle = color.body;
  ctx.fillRect(-w / 2, -h / 2 + 2, w, h - 6);
  ctx.fillStyle = color.top;
  ctx.fillRect(-w / 2 + 2, -h / 2, w - 4, 4);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-6, -6, 5, 5);
  ctx.fillRect(2, -6, 5, 5);
  ctx.fillStyle = '#202020';
  ctx.fillRect(-5, -5, 3, 3);
  ctx.fillRect(3, -5, 3, 3);
  ctx.fillStyle = '#604020';
  ctx.fillRect(-w / 2 + 1, h / 2 - 4, 7, 4);
  ctx.fillRect(w / 2 - 8, h / 2 - 4, 7, 4);
}

function drawBoss() {
  if (!boss || boss.dead) return;
  const sx = boss.x - cameraX;
  const sy = boss.y;
  if (sx < -80 || sx > SCREEN_W + 80) return;
  const phaseColor = boss.phase === 1 ? '#403080' : boss.phase === 2 ? '#3050a0' : '#a03030';
  const bodyColor = boss.state === 'stunned' ? '#606060' : boss.state === 'charge' ? '#ff6040' : phaseColor;
  ctx.fillStyle = bodyColor;
  ctx.fillRect(sx, sy, boss.w, boss.h);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(sx + 4, sy + 4, boss.w - 8, boss.h - 8);
  if (boss.state === 'intro') {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(sx, sy, boss.w, boss.h);
  }
  ctx.fillStyle = '#fff';
  if (boss.state === 'charge') {
    ctx.fillRect(sx + 16, sy + 16, 14, 14);
    ctx.fillRect(sx + 34, sy + 16, 14, 14);
  } else {
    ctx.fillRect(sx + 16, sy + 16, 12, 12);
    ctx.fillRect(sx + 36, sy + 16, 12, 12);
  }
  ctx.fillStyle = '#202020';
  ctx.fillRect(sx + 18, sy + 18, 8, 8);
  ctx.fillRect(sx + 38, sy + 18, 8, 8);
  ctx.fillStyle = '#e04030';
  ctx.fillRect(sx + 20, sy + 40, 24, 12);
  if (boss.state === 'telegraph' || boss.state === 'jumpTelegraph') {
    const targetX = boss.chargeDir > 0 ? boss.x + boss.w + 40 : boss.x - 40;
    const tx = targetX - cameraX;
    if (Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(tx, sy + boss.h / 2 - 4, 16, 8);
    }
  }
  if (boss.state === 'charge') {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    const lineX = boss.chargeDir > 0 ? sx - 30 : sx + boss.w;
    ctx.fillRect(lineX, sy + 10, 30, 4);
    ctx.fillRect(lineX, sy + 30, 30, 4);
  }
  if (boss.state === 'stunned') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx + 10, sy - 6, 4, 4);
    ctx.fillRect(sx + 40, sy - 10, 4, 4);
    ctx.fillRect(sx + 28, sy - 14, 4, 4);
  }
  const hpBarX = sx + 8, hpBarY = sy - 12, hpBarW = boss.w - 16, hpBarH = 6;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
  ctx.fillStyle = '#e04030';
  ctx.fillRect(hpBarX, hpBarY, hpBarW * (boss.hp / 10), hpBarH);
}

function drawFlag() {
  const sx = flagX * TILE - cameraX;
  const groundTop = (STAGE_H - 2) * TILE;
  const poleTop = groundTop - 5 * TILE;
  const poleH = groundTop - poleTop;
  ctx.fillStyle = '#888';
  ctx.fillRect(sx + 8, poleTop, 6, poleH);
  ctx.fillStyle = '#e04030';
  const wave = Math.sin(Date.now() * 0.004) * 4;
  ctx.fillRect(sx + 14, poleTop + 8, 30 + wave, 20);
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(sx - 6, groundTop - 8, 44, 8);
}

function drawPlayer() {
  const sx = Math.round(player.x - cameraX);
  const sy = Math.round(player.y);
  if (sx < -40 || sx > SCREEN_W + 40) return;
  ctx.save();
  ctx.translate(sx + player.w / 2, sy + player.h / 2);
  if (player.facing < 0) ctx.scale(-1, 1);
  const syScale = 1 - player.squash * 0.3;
  const sxScale = 1 + player.squash * 0.2;
  ctx.scale(sxScale, syScale);
  let sprite;
  if (player.onGround && Math.abs(player.vx) > 0) {
    sprite = (Math.floor(player.animTime) % 2) ? CHIP_RUN_A : CHIP_RUN_B;
  } else {
    sprite = CHIP_IDLE;
  }
  drawSprite(sprite);
  ctx.restore();
}

function drawSprite(sprite) {
  const u = 2;
  const w = sprite[0].length;
  const h = sprite.length;
  const startX = -w * u / 2;
  const startY = -h * u / 2;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const col = sprite[r][c];
      if (col === 0) continue;
      ctx.fillStyle = CHIP_COLORS[col];
      ctx.fillRect(startX + c * u, startY + r * u, u, u);
    }
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, SCREEN_W, 28);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('SCORE ' + score, 10, 20);
  ctx.fillText('LIVES ' + lives, 160, 20);
  ctx.fillText(level === 6 ? 'STAGE EXTRA' : 'STAGE ' + (level + 1) + '/' + STAGES.length, 320, 20);
  ctx.fillText('TIME ' + Math.ceil(timeLeft / 60), 480, 20);
  const barX = 10, barY = 30, barW = 200, barH = 8;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(barX, barY, barW, barH);
  const progress = Math.min(1, Math.max(0, (player.x + player.w / 2) / (flagX * TILE)));
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(barX, barY, barW * progress, barH);
  ctx.fillStyle = '#fff';
  ctx.fillRect(barX + barW, barY - 2, 4, barH + 4);
  ctx.font = 'bold 12px monospace';
  ctx.fillText('GOAL', barX + barW + 8, barY + 8);
  if (player.firePower) {
    const fireBarX = 500, fireBarY = 30, fireBarW = 100, fireBarH = 8;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(fireBarX, fireBarY, fireBarW, fireBarH);
    const ready = fireCooldown <= 0;
    const fill = ready ? 1 : 1 - fireCooldown / FIREBALL_COOLDOWN;
    ctx.fillStyle = ready ? '#ffd700' : '#ff6a00';
    ctx.fillRect(fireBarX, fireBarY, fireBarW * fill, fireBarH);
    ctx.fillStyle = '#fff';
    ctx.fillText('FIRE', fireBarX + fireBarW + 8, fireBarY + 8);
  }
}

function drawScreen() {
  if (state === STATE_TITLE) drawTitleScreen();
  else if (state === STATE_STAGE_CLEAR) drawStageClearScreen();
  else if (state === STATE_GAME_OVER) drawGameOverScreen();
  else if (state === STATE_VICTORY) drawVictoryScreen();
  else if (state === STATE_PAUSED) drawPauseScreen();
  else if (state === STATE_STAGE_SELECT) drawStageSelectScreen();
  else if (state === STATE_ENDING) drawEndingScreen();
}

function drawStageSelectScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('STAGE SELECT', SCREEN_W / 2, 80);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  for (let i = 0; i < STAGES.length + 1; i++) {
    const y = 120 + i * 35;
    const label = i === STAGES.length ? 'EXTRA' : 'STAGE ' + (i + 1);
    if (i === stageSelectIndex) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText('>> ' + label + ' <<', SCREEN_W / 2, y);
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillText(label, SCREEN_W / 2, y);
    }
  }
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText('LEFT/RIGHT: Select  ENTER: Confirm  ESC: Back', SCREEN_W / 2, 360);
  ctx.textAlign = 'left';
}

function drawTitleScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 56px monospace';
  ctx.fillText('PIXEL CHIP', SCREEN_W / 2, 120);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('A Famicom-style Platformer', SCREEN_W / 2, 165);
  ctx.save();
  ctx.translate(SCREEN_W / 2, 250);
  ctx.scale(2, 2);
  drawSprite(CHIP_IDLE);
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  if (Math.floor(Date.now() / 400) % 2) ctx.fillText('PRESS ANY KEY TO START', SCREEN_W / 2, 320);
  ctx.font = '14px monospace';
  ctx.fillText('HIGH SCORE: ' + highScore, SCREEN_W / 2, 340);
  ctx.font = '12px monospace';
  ctx.fillText('BGM: Conte de Fées', SCREEN_W / 2, 360);
  ctx.textAlign = 'left';
}

function drawStageClearScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 48px monospace';
  ctx.fillText('STAGE CLEAR!', SCREEN_W / 2, 140);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('SCORE: ' + score, SCREEN_W / 2, 190);
  if (Math.floor(Date.now() / 400) % 2) {
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS ANY KEY FOR NEXT STAGE', SCREEN_W / 2, 300);
  }
  ctx.textAlign = 'left';
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e04030';
  ctx.font = 'bold 48px monospace';
  ctx.fillText('GAME OVER', SCREEN_W / 2, 140);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('SCORE: ' + score, SCREEN_W / 2, 190);
  ctx.font = '14px monospace';
  ctx.fillText('HIGH SCORE: ' + highScore, SCREEN_W / 2, 220);
  ctx.font = '14px monospace';
  ctx.fillText('ENEMIES: ' + enemiesDefeated, SCREEN_W / 2, 250);
  ctx.fillText('COINS: ' + coinsCollected, SCREEN_W / 2, 270);
  ctx.fillText('STAGES: ' + stagesCleared, SCREEN_W / 2, 290);
  if (Math.floor(Date.now() / 400) % 2) {
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS R TO RESTART', SCREEN_W / 2, 320);
  }
  ctx.textAlign = 'left';
}

function drawVictoryScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 48px monospace';
  ctx.fillText('YOU WIN!', SCREEN_W / 2, 120);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px monospace';
  ctx.fillText('ALL STAGES CLEARED', SCREEN_W / 2, 175);
  ctx.font = 'bold 24px monospace';
  ctx.fillText('SCORE: ' + score, SCREEN_W / 2, 220);
  ctx.font = '14px monospace';
  ctx.fillText('HIGH SCORE: ' + highScore, SCREEN_W / 2, 250);
  ctx.fillText('ENEMIES: ' + enemiesDefeated, SCREEN_W / 2, 280);
  ctx.fillText('COINS: ' + coinsCollected, SCREEN_W / 2, 300);
  ctx.fillText('STAGES: ' + stagesCleared, SCREEN_W / 2, 320);
  if (Math.floor(Date.now() / 400) % 2) {
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS R TO PLAY AGAIN', SCREEN_W / 2, 350);
  }
  ctx.textAlign = 'left';
}

function drawEndingScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 40px monospace';
  ctx.fillText('THE END', SCREEN_W / 2, 80);
  ctx.font = 'bold 24px monospace';
  ctx.fillText('★ CONGRATULATIONS ★', SCREEN_W / 2, 130);
  ctx.font = 'bold 18px monospace';
  ctx.fillText('THANK YOU FOR PLAYING', SCREEN_W / 2, 160);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('SCORE: ' + score, SCREEN_W / 2, 210);
  ctx.font = '14px monospace';
  ctx.fillText('HIGH SCORE: ' + highScore, SCREEN_W / 2, 240);
  ctx.fillText('ENEMIES: ' + enemiesDefeated, SCREEN_W / 2, 260);
  ctx.fillText('COINS: ' + coinsCollected, SCREEN_W / 2, 280);
  ctx.fillText('STAGES: ' + stagesCleared, SCREEN_W / 2, 300);
  if (Math.floor(Date.now() / 400) % 2) {
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS R TO RETURN TO TITLE', SCREEN_W / 2, 340);
  }
  ctx.textAlign = 'left';
}

function drawPauseScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 48px monospace';
  ctx.fillText('PAUSED', SCREEN_W / 2, 140);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('P/ESC RESUME', SCREEN_W / 2, 300);
  ctx.fillText('Q QUIT TO TITLE', SCREEN_W / 2, 330);
  ctx.font = '14px monospace';
  ctx.fillText('VOLUME: ' + Math.round(bgmVolume * 100) + '%  (UP/DOWN to adjust)', SCREEN_W / 2, 360);
  ctx.fillStyle = '#8ac0ff';
  ctx.fillText('EXTRA SEED: ' + extraSeed, SCREEN_W / 2, 380);
  ctx.textAlign = 'left';
}
