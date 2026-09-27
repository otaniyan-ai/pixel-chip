let audioCtx = null;
let audioReady = false;
let sfxCache = {};
let bgm = null;
let titleBgm = null;
let bossBgm = null;

function ensureAudio() {
  if (audioReady) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const files = ['jump', 'coin', 'hit', 'footstep', 'fall', 'victory', 'gameover', 'block', 'break', 'powerup', 'fireball', 'checkpoint', 'boss_victory'];
  for (const f of files) {
    const a = new Audio('assets/sfx/' + f + '.mp3');
    sfxCache[f] = a;
  }
  bgm = new Audio('assets/music/chip_action.mp3');
  bgm.loop = true;
  bgm.volume = 0.35;
  titleBgm = new Audio('assets/music/title.mp3');
  titleBgm.loop = true;
  titleBgm.volume = 0.35;
  bossBgm = new Audio('assets/music/boss.mp3');
  bossBgm.loop = true;
  bossBgm.volume = 0.35;
  audioReady = true;
}
function playSfx(name) {
  if (!audioReady || !sfxCache[name]) return;
  const a = sfxCache[name];
  a.pause();
  a.currentTime = 0;
  a.play().catch(() => {});
}
function startBgm() {
  if (!audioReady) return;
  bgm.play().catch(() => {});
}
function stopBgm() {
  if (!audioReady) return;
  bgm.pause();
  titleBgm.pause();
  bossBgm.pause();
}
function startBossBgm() {
  if (!audioReady) return;
  bossBgm.play().catch(() => {});
}
