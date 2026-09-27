const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const SCREEN_W = 640;
const SCREEN_H = 384;
canvas.width = SCREEN_W;
canvas.height = SCREEN_H;
function scaleCanvas() {
  const topPad = 56;
  const botPad = 88;
  const availW = window.innerWidth;
  const availH = window.innerHeight - topPad - botPad;
  const s = Math.min(availW / SCREEN_W, availH / SCREEN_H, 1);
  canvas.style.transform = `scale(${s})`;
}
window.addEventListener('resize', scaleCanvas);
scaleCanvas();

const TILE = 32;
const STAGE_H = 12;
const GRAVITY = 0.55;
const GRAVITY_HOLD = 0.35;
const JUMP_POWER = -11;
const MOVE = 3.2;
const MAX_FALL = 12;
const FOOTSTEP_COOLDOWN = 15;

const EMPTY = 0;
const GROUND = 1;
const BRICK = 2;
const PIPE_TOP = 3;
const PIPE_BODY = 4;
const QUESTION = 5;
const QUESTION_USED = 6;
const BRICK_BREAKABLE = 7;
const HIDDEN = 8;
const LADDER = 9;

const CHIP_COLORS = [null, '#e04030', '#f0c090', '#3040a0', '#805030', '#202020'];
const ENEMY_COLORS = {
  walk: { body: '#8b5a2b', top: '#a07040' },
  fast: { body: '#c04030', top: '#d06050' },
  jump: { body: '#7040a0', top: '#9060c0' },
  fly: { body: '#4080c0', top: '#60a0e0' },
  shooter: { body: '#6040a0', top: '#403080' },
};

const CHIP_IDLE = [
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,2,2,5,2,2,2,2,2,2,0,0],
  [0,0,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,3,3,3,3,3,3,1,0,0],
  [0,0,0,3,3,3,3,3,3,3,0,0,0],
  [0,0,0,3,3,3,3,3,3,3,0,0,0],
  [0,0,4,4,4,4,4,4,4,4,0,0,0],
];
const CHIP_RUN_A = [
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,2,2,5,2,2,2,2,2,2,0,0],
  [0,0,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,3,3,3,3,3,3,1,0,0],
  [0,0,1,3,3,3,0,0,3,3,0,0,0],
  [0,0,1,3,3,3,0,0,3,3,0,0,0],
  [0,0,4,4,4,0,0,0,4,4,4,0,0,0],
];
const CHIP_RUN_B = [
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,2,2,5,2,2,2,2,2,2,0,0],
  [0,0,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,3,3,3,3,3,3,1,0,0],
  [0,0,0,3,3,3,0,0,3,3,0,0,0],
  [0,0,0,3,3,3,0,0,3,3,0,0,0],
  [0,0,0,4,4,4,0,0,4,4,4,0,0,0],
];

const STATE_TITLE = 0;
const STATE_PLAYING = 1;
const STATE_STAGE_CLEAR = 2;
const STATE_GAME_OVER = 3;
const STATE_VICTORY = 4;
const STATE_PAUSED = 5;
const STATE_STAGE_SELECT = 6;
const STATE_ENDING = 7;

let state = STATE_TITLE;
let level = 0;
let score = 0;
let lives = 3;
let stageW = 0;
let map = [];
let flagX = 0;
let cameraX = 0;
let cloudOffset = 0;
let invincibility = 0;
let respawnTimer = 0;
let stageClearTimer = 0;
let gameOverTimer = 0;
let timeLeft = 0;
const TIME_LIMIT = 300 * 60;
let items = [];
let fireballs = [];
let enemyProjectiles = [];
let checkpoints = [];
let stompCombo = 0;
let stompTimer = 0;
const STOMP_WINDOW = 90;
const FIREBALL_COOLDOWN = 120;
let fireCooldown = 0;
let blockContents = {};
let breakablePlatforms = [];
let movingLadders = [];
let springs = [];
let conveyors = [];
let fireFloors = [];
let highScore = 0;
let stageSelectIndex = 0;
let bgmVolume = 0.35;
let boss = null;
let bossDefeatTimer = 0;
let bossStageCleared = false;
let shakeTimer = 0;
let enemiesDefeated = 0;
let coinsCollected = 0;
let stagesCleared = 0;

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyP' || e.code === 'Escape') e.preventDefault();
  if (state === STATE_PLAYING && (e.code === 'KeyP' || e.code === 'Escape')) {
    pauseGame();
    return;
  }
  if (state === STATE_PAUSED) {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      bgmVolume = Math.min(1, bgmVolume + 0.05);
      if (bgm) bgm.volume = bgmVolume;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      bgmVolume = Math.max(0, bgmVolume - 0.05);
      if (bgm) bgm.volume = bgmVolume;
    } else if (e.code === 'KeyQ') {
      quitToTitle();
      return;
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      resumeGame();
      return;
    }
    return;
  }
  if (state === STATE_STAGE_SELECT) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      stageSelectIndex = Math.max(0, stageSelectIndex - 1);
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      stageSelectIndex = Math.min(STAGES.length, stageSelectIndex + 1);
    } else if (e.code === 'Enter' || e.code === 'KeyR') {
      confirmStageSelect();
    } else if (e.code === 'Escape' || e.code === 'KeyP') {
      state = STATE_TITLE;
      updateTouchControls();
    }
    return;
  }
  if (state === STATE_TITLE) {
    ensureAudio();
    startGame();
  } else if (state === STATE_STAGE_CLEAR) {
    nextStage();
  } else if (state === STATE_GAME_OVER) {
    if (e.code === 'KeyR' || e.code === 'Enter') restart();
  } else if (state === STATE_VICTORY) {
    if (e.code === 'KeyR' || e.code === 'Enter') resetAll();
  } else if (state === STATE_ENDING) {
    if (e.code === 'KeyR' || e.code === 'Enter') resetAll();
  }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
canvas.addEventListener('click', () => {
  if (state === STATE_TITLE) {
    ensureAudio();
    startGame();
  }
});

function resizeGame() {
  const scale = Math.min(window.innerWidth / SCREEN_W, window.innerHeight / SCREEN_H, 1);
  canvas.style.width = (SCREEN_W * scale) + 'px';
  canvas.style.height = (SCREEN_H * scale) + 'px';
}
window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', resizeGame);
resizeGame();

const touchButtons = [
  { id: 'btn-left', key: 'ArrowLeft' },
  { id: 'btn-right', key: 'ArrowRight' },
  { id: 'btn-jump', key: 'Space' },
  { id: 'btn-fire', key: 'KeyX' },
  { id: 'btn-pause', key: 'KeyP' },
  { id: 'btn-quit', key: 'KeyQ' },
];
function initTouchControls() {
  for (const b of touchButtons) {
    const el = document.getElementById(b.id);
    if (!el) continue;
    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (b.id === 'btn-pause') {
        if (state === STATE_PLAYING) pauseGame();
        else if (state === STATE_PAUSED) resumeGame();
      } else if (b.id === 'btn-quit') {
        if (state === STATE_PAUSED) quitToTitle();
      } else if (state === STATE_STAGE_SELECT) {
        if (b.key === 'ArrowLeft') stageSelectIndex = Math.max(0, stageSelectIndex - 1);
        else if (b.key === 'ArrowRight') stageSelectIndex = Math.min(STAGES.length, stageSelectIndex + 1);
      } else {
        keys[b.key] = true;
      }
    });
    el.addEventListener('touchend', () => { if (b.id !== 'btn-pause' && b.id !== 'btn-quit') keys[b.key] = false; });
    el.addEventListener('touchcancel', () => { if (b.id !== 'btn-pause' && b.id !== 'btn-quit') keys[b.key] = false; });
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (b.id === 'btn-pause') {
        if (state === STATE_PLAYING) pauseGame();
        else if (state === STATE_PAUSED) resumeGame();
      } else if (b.id === 'btn-quit') {
        if (state === STATE_PAUSED) quitToTitle();
      } else if (state === STATE_STAGE_SELECT) {
        if (b.key === 'ArrowLeft') stageSelectIndex = Math.max(0, stageSelectIndex - 1);
        else if (b.key === 'ArrowRight') stageSelectIndex = Math.min(STAGES.length, stageSelectIndex + 1);
      } else {
        keys[b.key] = true;
      }
    });
    el.addEventListener('mouseup', () => { if (b.id !== 'btn-pause' && b.id !== 'btn-quit') keys[b.key] = false; });
    el.addEventListener('mouseleave', () => { if (b.id !== 'btn-pause' && b.id !== 'btn-quit') keys[b.key] = false; });
    el.addEventListener('blur', () => { if (b.id !== 'btn-pause' && b.id !== 'btn-quit') keys[b.key] = false; });
  }
}
initTouchControls();

function updateTouchControls() {
  for (const b of touchButtons) {
    const el = document.getElementById(b.id);
    if (!el) continue;
    if (b.id === 'btn-pause') {
      el.style.pointerEvents = (state === STATE_PLAYING || state === STATE_PAUSED) ? 'auto' : 'none';
    } else if (b.id === 'btn-quit') {
      el.style.pointerEvents = (state === STATE_PAUSED) ? 'auto' : 'none';
    } else if (b.key === 'ArrowLeft' || b.key === 'ArrowRight') {
      el.style.pointerEvents = (state === STATE_PLAYING || state === STATE_STAGE_SELECT) ? 'auto' : 'none';
    } else {
      el.style.pointerEvents = (state === STATE_PLAYING) ? 'auto' : 'none';
    }
  }
}

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (state === STATE_TITLE) {
    ensureAudio();
    startGame();
  } else if (state === STATE_STAGE_SELECT) {
    confirmStageSelect();
  } else if (state === STATE_STAGE_CLEAR) {
    nextStage();
  } else if (state === STATE_GAME_OVER) {
    restart();
  } else if (state === STATE_VICTORY) {
    resetAll();
  } else if (state === STATE_ENDING) {
    resetAll();
  }
});
const btnStageSelect = document.getElementById('btn-stage-select');
if (btnStageSelect) {
  btnStageSelect.addEventListener('click', () => {
    if (state === STATE_TITLE) enterStageSelect();
  });
}

function startGame() {
  level = 0;
  score = 0;
  lives = 3;
  enemiesDefeated = 0;
  coinsCollected = 0;
  stagesCleared = 0;
  bossStageCleared = false;
  extraSeed = Date.now() % 2147483647;
  extraStage = buildRandomStage(extraSeed);
  state = STATE_PLAYING;
  loadHighScore();
  loadStage(0);
  startBgm();
  updateTouchControls();
}
function nextStage() {
  level++;
  if (level === 6) {
    extraSeed = Date.now() % 2147483647;
    extraStage = buildRandomStage(extraSeed);
    loadStage(6);
    state = STATE_PLAYING;
    startBgm();
    updateTouchControls();
  } else if (level >= STAGES.length) {
    state = STATE_VICTORY;
    stopBgm();
    playSfx('victory');
    updateTouchControls();
    saveHighScore();
  } else {
    loadStage(level);
    state = STATE_PLAYING;
    if (level === 5) startBossBgm();
    else startBgm();
    updateTouchControls();
  }
}
function restart() { startGame(); }
function resetAll() {
  level = 0;
  score = 0;
  lives = 3;
  enemiesDefeated = 0;
  coinsCollected = 0;
  stagesCleared = 0;
  bossStageCleared = false;
  extraSeed = Date.now() % 2147483647;
  extraStage = buildRandomStage(extraSeed);
  state = STATE_TITLE;
  stopBgm();
  updateTouchControls();
}
function pauseGame() {
  if (state !== STATE_PLAYING) return;
  state = STATE_PAUSED;
  stopBgm();
  updateTouchControls();
}
function resumeGame() {
  if (state !== STATE_PAUSED) return;
  state = STATE_PLAYING;
  if (level === 5) startBossBgm();
  else startBgm();
  updateTouchControls();
}
function quitToTitle() {
  if (state !== STATE_PAUSED) return;
  resetAll();
}

function getStageConfig(i) {
  return i < STAGES.length ? STAGES[i] : extraStage;
}
function loadStage(i) {
  const cfg = getStageConfig(i);
  stageW = cfg.width;
  map = [];
  for (let r = 0; r < STAGE_H; r++) map[r] = new Array(stageW).fill(0);
  for (let c = 0; c < stageW; c++) {
    if (!cfg.gaps.includes(c)) {
      map[STAGE_H - 1][c] = GROUND;
      map[STAGE_H - 2][c] = GROUND;
    }
  }
  for (const p of cfg.platforms) {
    for (let c = p.x; c < p.x + p.w; c++) {
      for (let r = p.y; r < p.y + p.h; r++) {
        if (c >= 0 && c < stageW && r >= 0 && r < STAGE_H) map[r][c] = BRICK;
      }
    }
  }
  for (const p of cfg.pipes) {
    for (let c = p.x; c < p.x + p.w; c++) {
      for (let r = p.y; r < p.y + p.h; r++) {
        if (c >= 0 && c < stageW && r >= 0 && r < STAGE_H) map[r][c] = (r === p.y) ? PIPE_TOP : PIPE_BODY;
      }
    }
  }
  blockContents = {};
  for (const b of cfg.blocks) {
    if (b.x >= 0 && b.x < stageW && b.y >= 0 && b.y < STAGE_H) {
      if (b.type === 'q') {
        map[b.y][b.x] = QUESTION;
        blockContents[b.y + ',' + b.x] = b.content || 'coin';
      } else {
        map[b.y][b.x] = BRICK_BREAKABLE;
      }
    }
  }
  for (const b of (cfg.hiddenBlocks || [])) {
    if (b.x >= 0 && b.x < stageW && b.y >= 0 && b.y < STAGE_H) {
      map[b.y][b.x] = HIDDEN;
      blockContents[b.y + ',' + b.x] = b.content || 'coin';
    }
  }
  for (const b of (cfg.ladders || [])) {
    if (b.x >= 0 && b.x < stageW && b.y >= 0 && b.y < STAGE_H) {
      map[b.y][b.x] = LADDER;
    }
  }
  checkpoints = (cfg.checkpoints || []).map(c => ({
    x: c.x * TILE, y: (c.feetRow - 1) * TILE - player.h, active: false,
  }));
  platforms = cfg.movingPlatforms.map(p => ({
    x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, h: TILE,
    centerX: p.x * TILE, range: p.range, speed: p.speed, phase: 0, dx: 0, oldX: p.x * TILE,
  }));
  for (const p of (cfg.verticalPlatforms || [])) {
    platforms.push({
      x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, h: TILE,
      centerY: p.y * TILE, range: p.range, speed: p.speed, phase: 0, dy: 0, oldY: p.y * TILE,
      vertical: true,
    });
  }
  breakablePlatforms = (cfg.breakablePlatforms || []).map(p => ({
    x: p.x * TILE, y: p.y * TILE, w: p.w * TILE, h: TILE,
    state: 'idle', fallVy: 0, delay: 0,
  }));
  movingLadders = (cfg.movingLadders || []).map(l => ({
    x: l.x * TILE, centerY: l.y * TILE, y: l.y * TILE, range: l.range, speed: l.speed, phase: 0, dy: 0, oldY: l.y * TILE,
  }));
  springs = (cfg.springs || []).map(s => ({ x: s.x * TILE, y: s.y * TILE, power: s.power }));
  conveyors = (cfg.conveyors || []).map(c => ({ x: c.x * TILE, y: c.y * TILE, w: c.w * TILE, speed: c.speed, dir: c.dir }));
  fireFloors = (cfg.fireFloors || []).map(f => ({ x: f.x * TILE, y: f.y * TILE, w: f.w * TILE }));
  flagX = cfg.flagX;
  enemies = cfg.enemies.map((e) => ({
    x: e.x * TILE, y: e.feetRow * TILE - 26, w: 26, h: 26,
    speed: e.speed, dir: e.dir, dead: false, remove: false, squash: 0,
    type: e.type || 'walk', jumpTimer: 0, jumpVy: 0, flyPhase: 0, baseY: e.feetRow * TILE - 26,
    shootTimer: 0,
  }));
  enemyProjectiles = [];
  boss = null;
  bossDefeatTimer = 0;
  shakeTimer = 0;
  bossStageCleared = false;
  if (i === 5) {
    boss = {
      x: stageW * TILE / 2 - 32, y: (STAGE_H - 3) * TILE - 64, w: 64, h: 64,
      hp: 10, dir: 1, shootTimer: 0, jumpTimer: 0, jumpVy: 0,
      state: 'intro', phase: 1, introTimer: 90, attackTimer: 0, timer: 0, chargeDir: 1, attackCycle: 0,
      stunnedTimer: 0, invulnerable: true, dead: false,
    };
  }
  coins = cfg.coins.map((c) => ({
    x: c.x * TILE + 4, y: c.y * TILE + 4, w: 24, h: 24, collected: false,
  }));
  player.x = cfg.playerStart.x * TILE;
  player.y = (cfg.playerStart.feetRow - 1) * TILE - player.h;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.alive = true;
  player.facing = 1;
  player.squash = 0;
  player.coyote = 0;
  player.animTime = 0;
  player.stepCooldown = 0;
  invincibility = 90;
  respawnTimer = 0;
  cameraX = Math.max(0, Math.min(player.x - SCREEN_W * 0.4, stageW * TILE - SCREEN_W));
  cloudOffset = 0;
  timeLeft = TIME_LIMIT;
}

function isSolid(r, c) {
  if (r < 0 || r >= STAGE_H || c < 0 || c >= stageW) return false;
  const t = map[r][c];
  return t === GROUND || t === BRICK || t === PIPE_TOP || t === PIPE_BODY || t === QUESTION || t === QUESTION_USED || t === BRICK_BREAKABLE || t === HIDDEN;
}

let popCoins = [];
let particles = [];
function hitBlock(r, c) {
  const t = map[r][c];
  const content = blockContents[r + ',' + c];
  if (t === QUESTION) {
    map[r][c] = QUESTION_USED;
    if (content === 'mushroom') {
      items.push({ x: c * TILE + 4, y: r * TILE + TILE, w: 24, h: 24, type: 'mushroom', vy: 0 });
      playSfx('powerup');
    } else if (content === 'fireflower') {
      items.push({ x: c * TILE + 4, y: r * TILE + TILE, w: 24, h: 24, type: 'fireflower', vy: 0 });
      playSfx('powerup');
    } else {
      popCoin(c * TILE + TILE / 2, r * TILE - TILE);
      score += 100;
    }
    playSfx('block');
  } else if (t === BRICK_BREAKABLE) {
    map[r][c] = EMPTY;
    spawnBrickParticles(c * TILE + TILE / 2, r * TILE + TILE / 2);
    popCoin(c * TILE + TILE / 2, r * TILE - TILE);
    score += 100;
    playSfx('break');
  } else if (t === HIDDEN) {
    map[r][c] = QUESTION_USED;
    if (content === 'coin') {
      popCoin(c * TILE + TILE / 2, r * TILE - TILE);
      score += 100;
    } else if (content === 'mushroom') {
      items.push({ x: c * TILE + 4, y: r * TILE + TILE, w: 24, h: 24, type: 'mushroom', vy: 0 });
      playSfx('powerup');
    } else if (content === 'fireflower') {
      items.push({ x: c * TILE + 4, y: r * TILE + TILE, w: 24, h: 24, type: 'fireflower', vy: 0 });
      playSfx('powerup');
    }
    playSfx('block');
  }
}
function popCoin(x, y) {
  popCoins.push({ x, y, vy: -6, life: 40 });
}
function updatePopCoins() {
  for (const c of popCoins) {
    c.vy += GRAVITY;
    c.y += c.vy;
    c.life--;
  }
  popCoins = popCoins.filter(c => c.life > 0);
}
function spawnBrickParticles(x, y) {
  for (let i = 0; i < 4; i++) {
    particles.push({ x, y, vx: (i - 1.5) * 2, vy: -4 - Math.random() * 2, life: 40 });
  }
}
function updateParticles() {
  for (const p of particles) {
    p.vy += GRAVITY;
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  }
  particles = particles.filter(p => p.life > 0);
}
function updateMovingLadders() {
  for (const l of movingLadders) {
    l.phase += l.speed;
    const newY = l.centerY + Math.sin(l.phase) * l.range;
    l.oldY = l.y;
    l.dy = newY - l.y;
    l.y = newY;
  }
}
function updateBreakablePlatforms() {
  for (const p of breakablePlatforms) {
    if (p.state === 'idle') {
      const overlapX = player.x < p.x + p.w && player.x + player.w > p.x;
      const overlapY = player.y < p.y + p.h && player.y + player.h >= p.y;
      if (overlapX && overlapY && player.vy >= 0) {
        p.delay++;
        if (p.delay >= 30) {
          p.state = 'falling';
          p.fallVy = 0;
        }
      } else {
        p.delay = 0;
      }
    } else if (p.state === 'falling') {
      p.fallVy += GRAVITY;
      p.y += p.fallVy;
      if (p.y > STAGE_H * TILE + 100) p.state = 'gone';
    }
  }
}
function loadHighScore() {
  try {
    highScore = parseInt(localStorage.getItem('pixelChipHighScore') || '0');
  } catch (e) { highScore = 0; }
}
function saveHighScore() {
  try {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('pixelChipHighScore', String(highScore));
    }
  } catch (e) {}
}
function enterStageSelect() {
  state = STATE_STAGE_SELECT;
  stageSelectIndex = 0;
  stopBgm();
  updateTouchControls();
}
function confirmStageSelect() {
  ensureAudio();
  score = 0;
  lives = 3;
  stagesCleared = 0;
  bossStageCleared = false;
  if (stageSelectIndex === STAGES.length) {
    level = 6;
    extraSeed = Date.now() % 2147483647;
    extraStage = buildRandomStage(extraSeed);
    loadStage(6);
    startBgm();
  } else {
    level = stageSelectIndex;
    loadStage(level);
    if (level === 5) startBossBgm();
    else startBgm();
  }
  state = STATE_PLAYING;
  updateTouchControls();
}
function updateItems() {
  for (const it of items) {
    it.vy += GRAVITY;
    it.y += it.vy;
    const r = Math.floor((it.y + it.h) / TILE);
    const c = Math.floor((it.x + it.w / 2) / TILE);
    if (r >= 0 && r < STAGE_H && c >= 0 && c < stageW && isSolid(r, c)) {
      it.y = r * TILE - it.h;
      it.vy = 0;
    }
    if (it.y > STAGE_H * TILE) it.collected = true;
    if (player.alive && !it.collected &&
      player.x < it.x + it.w && player.x + player.w > it.x &&
      player.y < it.y + it.h && player.y + player.h > it.y) {
      it.collected = true;
      if (it.type === 'mushroom') {
        lives++;
        playSfx('powerup');
      } else if (it.type === 'fireflower') {
        player.firePower = true;
        playSfx('powerup');
      }
    }
  }
  items = items.filter(it => !it.collected);
}
function updateFireballs() {
  for (const f of fireballs) {
    f.x += f.vx;
    const c = Math.floor(f.x / TILE);
    const r = Math.floor(f.y / TILE);
    if (r >= 0 && r < STAGE_H && c >= 0 && c < stageW && isSolid(r, c)) {
      f.dead = true;
      spawnBrickParticles(f.x, f.y);
    }
    if (f.x < cameraX - TILE || f.x > cameraX + SCREEN_W + TILE) f.dead = true;
    for (const e of enemies) {
      if (e.dead || e.remove) continue;
      if (f.x < e.x + e.w && f.x + f.w > e.x && f.y < e.y + e.h && f.y + f.h > e.y) {
        e.dead = true;
        f.dead = true;
        score += 200;
        enemiesDefeated++;
        playSfx('stomp');
      }
    }
    for (const p of enemyProjectiles) {
      if (p.dead) continue;
      if (f.x < p.x + p.w && f.x + f.w > p.x && f.y < p.y + p.h && f.y + f.h > p.y) {
        p.dead = true;
        f.dead = true;
        score += 50;
        playSfx('hit');
      }
    }
  }
  fireballs = fireballs.filter(f => !f.dead);
}

let platforms = [];
function updatePlatforms() {
  for (const p of platforms) {
    p.phase += p.speed;
    if (p.vertical) {
      const newY = p.centerY + Math.sin(p.phase) * p.range;
      p.oldY = p.y;
      p.dy = newY - p.y;
      p.y = newY;
    } else {
      const newX = p.centerX + Math.sin(p.phase) * p.range;
      p.oldX = p.x;
      p.dx = newX - p.x;
      p.x = newX;
    }
  }
}
function resolvePlatforms() {
  for (const p of platforms) {
    const overlapX = player.x < p.x + p.w && player.x + player.w > p.x;
    const overlapY = player.y < p.y + p.h && player.y + player.h > p.y;
    if (!overlapX || !overlapY) continue;
    if (player.vy >= 0 && player.y + player.h - player.vy <= p.y + 1) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (player.vy < 0 && player.y - player.vy >= p.y + p.h - 1) {
      player.y = p.y + p.h;
      player.vy = 0;
    } else if (player.vx > 0) {
      player.x = p.x - player.w;
      player.vx = 0;
    } else if (player.vx < 0) {
      player.x = p.x + p.w;
      player.vx = 0;
    }
  }
}

function checkFlag() {
  if (player.x + player.w / 2 >= flagX * TILE - 8) {
    score += Math.floor(timeLeft / 600) * 100;
    if (level < 6) stagesCleared++;
    if (level === 5) {
      state = STATE_STAGE_CLEAR;
      stopBgm();
      playSfx('boss_victory');
    } else if (level === 6) {
      state = STATE_ENDING;
      stopBgm();
      playSfx('victory');
      saveHighScore();
    } else {
      state = STATE_STAGE_CLEAR;
      stopBgm();
      playSfx('victory');
    }
    stageClearTimer = 0;
    updateTouchControls();
  }
}

function updateCamera() {
  const cfg = getStageConfig(level);
  if (cfg.scrollSpeed > 0) {
    cameraX += cfg.scrollSpeed;
    cameraX = Math.min(cameraX, stageW * TILE - SCREEN_W);
  } else {
    const target = player.x - SCREEN_W * 0.4;
    const clamped = Math.max(0, Math.min(target, stageW * TILE - SCREEN_W));
    cameraX += (clamped - cameraX) * 0.2;
  }
}

function update() {
  if (state === STATE_PLAYING) {
    timeLeft--;
    if (timeLeft <= 0) die();
    updatePlayer();
    updateRespawn();
    updateEnemies();
    updateBoss();
    updateItems();
    updateFireballs();
    updateEnemyProjectiles();
    updatePopCoins();
    updateParticles();
    updateBreakablePlatforms();
    updateMovingLadders();
    checkFlag();
    updateCamera();
    if (getStageConfig(level).scrollSpeed > 0 && player.x + player.w / 2 < cameraX) die();
    cloudOffset += getStageConfig(level).bg.cloudSpeed;
  }
  if (state === STATE_STAGE_CLEAR) stageClearTimer++;
  if (state === STATE_GAME_OVER) gameOverTimer++;
  if (shakeTimer > 0) shakeTimer--;
  if (bossDefeatTimer > 0) {
    bossDefeatTimer--;
    if (bossDefeatTimer === 0 && state === STATE_PLAYING && level === 5) {
      if (!bossStageCleared) {
        stagesCleared++;
        bossStageCleared = true;
      }
      state = STATE_STAGE_CLEAR;
      stopBgm();
      stageClearTimer = 0;
      updateTouchControls();
    }
  }
}

function render() {
  drawBackground();
  if (state !== STATE_TITLE && state !== STATE_STAGE_SELECT) {
    drawTiles();
    drawPlatforms();
    drawBreakablePlatforms();
    drawMovingLadders();
    drawSprings();
    drawConveyors();
    drawFireFloors();
    drawCoins();
    drawItems();
    drawFireballs();
    drawEnemyProjectiles();
    drawCheckpoints();
    drawPopCoins();
    drawParticles();
    drawEnemies();
    drawBoss();
    drawFlag();
    if (player.alive) drawPlayer();
  }
  if (state === STATE_PLAYING || state === STATE_STAGE_CLEAR) drawHUD();
  drawScreen();
}

let lastTime = 0;
let acc = 0;
const FRAME = 1000 / 60;
function gameLoop(t) {
  let frameTime = t - lastTime;
  lastTime = t;
  if (frameTime > 100) frameTime = 100;
  acc += frameTime;
  while (acc >= FRAME) {
    update();
    acc -= FRAME;
  }
  render();
  requestAnimationFrame(gameLoop);
}

function initStages() {
  state = STATE_TITLE;
  requestAnimationFrame(gameLoop);
}
initStages();
