const STAGE_BGS = [
  {skyTop:'#6cb5f0',skyBottom:'#bfe0ff',mountains:false,mountainFar:'#4a7a9a',mountainNear:'#3a6a8a',mountainDistant:'#7aa0b8',mountainMid:'#5a8aa0',mountainForeground:'#2a5a7a',cloudSpeed:0.2,cloudColor:'rgba(255,255,255,0.95)'},
  {skyTop:'#6cb5f0',skyBottom:'#bfe0ff',mountains:true,mountainFar:'#4a7a9a',mountainNear:'#3a6a8a',mountainDistant:'#6a8aa0',mountainMid:'#5a8aa0',mountainForeground:'#2a5a7a',cloudSpeed:0.5,cloudColor:'rgba(255,255,255,0.95)'},
  {skyTop:'#7a4a6a',skyBottom:'#ffb36a',mountains:true,mountainFar:'#5a4a6a',mountainNear:'#4a3a5a',mountainDistant:'#7a5a7a',mountainMid:'#5a4a6a',mountainForeground:'#3a2a4a',cloudSpeed:0.8,cloudColor:'rgba(255,220,180,0.9)'},
  {skyTop:'#4a3a6a',skyBottom:'#ff8a5a',mountains:true,mountainFar:'#3a2a4a',mountainNear:'#2a1a3a',mountainDistant:'#5a3a5a',mountainMid:'#3a2a4a',mountainForeground:'#1a0a2a',cloudSpeed:1,cloudColor:'rgba(255,180,140,0.85)'},
  {skyTop:'#2a3a5a',skyBottom:'#4a5a7a',mountains:true,mountainFar:'#2a3a4a',mountainNear:'#1a2a3a',mountainDistant:'#4a5a7a',mountainMid:'#2a3a4a',mountainForeground:'#0a1a2a',cloudSpeed:1.5,cloudColor:'rgba(200,220,255,0.8)'},
  {skyTop:'#4a6a8a',skyBottom:'#bfe0ff',mountains:true,mountainFar:'#4a7a9a',mountainNear:'#3a6a8a',mountainDistant:'#6a8aa0',mountainMid:'#4a7a9a',mountainForeground:'#2a5a7a',cloudSpeed:1.2,cloudColor:'rgba(255,255,255,0.9)'},
  {skyTop:'#3a4a6a',skyBottom:'#5a6a8a',mountains:true,mountainFar:'#3a4a6a',mountainNear:'#3a3a5a',mountainDistant:'#5a5a7a',mountainMid:'#3a4a6a',mountainForeground:'#1a2a3a',cloudSpeed:1.8,cloudColor:'rgba(200,220,255,0.85)'},
  {skyTop:'#1a2a3a',skyBottom:'#3a4a5a',mountains:true,mountainFar:'#2a3a4a',mountainNear:'#1a2a3a',mountainDistant:'#3a4a5a',mountainMid:'#2a3a4a',mountainForeground:'#0a1a2a',cloudSpeed:2,cloudColor:'rgba(180,200,255,0.75)'},
  {skyTop:'#0a0a1a',skyBottom:'#1a1a2a',mountains:true,mountainFar:'#1a1a2a',mountainNear:'#0a0a1a',mountainDistant:'#2a3a4a',mountainMid:'#1a2a3a',mountainForeground:'#0a0a1a',cloudSpeed:1,cloudColor:'rgba(100,100,150,0.5)'},
  {skyTop:'#0a0a1a',skyBottom:'#1a1a2a',mountains:true,mountainFar:'#1a1a2a',mountainNear:'#0a0a1a',mountainDistant:'#2a3a4a',mountainMid:'#1a2a3a',mountainForeground:'#0a0a1a',cloudSpeed:1,cloudColor:'rgba(100,100,150,0.5)'}
];
const MAIN_STAGE_CONFIGS = [
  { patterns: ['s1-a','v-s1-a','s1-b','v-s1-b','s1-c','v-s3-a'], bg: STAGE_BGS[0], scroll: 0 },
  { patterns: ['s2-a','v-s2-a','g-gap-pipe-2','v-g-longmove-3','g-ladder-1','v-g-ladder-2','g-enemy-1'], bg: STAGE_BGS[1], scroll: 0 },
  { patterns: ['s3-a','g-gap-pipe-3','v-g-longmove-11','g-doublegap-1','g-elevated-1','v-g-longmove-13','g-enemy-2','v-g-enemy-4'], bg: STAGE_BGS[2], scroll: 0 },
  { patterns: ['s4-a','v-s4-a','g-longmove-3','g-ecorridor-1','g-chainmove-1','g-vertical-2','g-shooter-1','s7-a','g-movladder-1'], bg: STAGE_BGS[3], scroll: 0 },
  { patterns: ['s5-a','v-s6-a','g-longmove-4','g-spring-1','g-vertical-3','g-elevated-2','g-conveyor-1','g-firefloor-1','g-enemy-4','v-g-enemy-8'], bg: STAGE_BGS[4], scroll: 1.0 },
  { patterns: ['boss-1','boss-2'], bg: STAGE_BGS[8], scroll: 0 }
];
function buildStage(patternIds, bg, scrollSpeed) {
  const stage = { width: 0, bg, patternIds: [...patternIds], gaps: [], platforms: [], pipes: [], blocks: [], hiddenBlocks: [], ladders: [], movingPlatforms: [], verticalPlatforms: [], breakablePlatforms: [], movingLadders: [], springs: [], conveyors: [], fireFloors: [], enemies: [], coins: [], checkpoints: [] };
  if (scrollSpeed) stage.scrollSpeed = scrollSpeed;
  let offset = 0;
  for (const pid of patternIds) {
    const p = PATTERNS[pid];
    stage.width += p.width;
    for (const g of p.gaps) stage.gaps.push(g + offset);
    for (const pl of (p.platforms || [])) stage.platforms.push({ x: pl.x + offset, y: pl.y, w: pl.w, h: pl.h });
    for (const pi of (p.pipes || [])) stage.pipes.push({ x: pi.x + offset, y: pi.y, w: pi.w, h: pi.h });
    for (const b of (p.blocks || [])) stage.blocks.push({ x: b.x + offset, y: b.y, type: b.type, content: b.content });
    for (const hb of (p.hiddenBlocks || [])) stage.hiddenBlocks.push({ x: hb.x + offset, y: hb.y, content: hb.content });
    for (const l of (p.ladders || [])) stage.ladders.push({ x: l.x + offset, y: l.y });
    for (const mp of (p.movingPlatforms || [])) stage.movingPlatforms.push({ x: mp.x + offset, y: mp.y, w: mp.w, range: mp.range, speed: mp.speed });
    for (const vp of (p.verticalPlatforms || [])) stage.verticalPlatforms.push({ x: vp.x + offset, y: vp.y, w: vp.w, range: vp.range, speed: vp.speed });
    for (const bp of (p.breakablePlatforms || [])) stage.breakablePlatforms.push({ x: bp.x + offset, y: bp.y, w: bp.w, h: bp.h });
    for (const ml of (p.movingLadders || [])) stage.movingLadders.push({ x: ml.x + offset, y: ml.y, range: ml.range, speed: ml.speed });
    for (const s of (p.springs || [])) stage.springs.push({ x: s.x + offset, y: s.y, power: s.power });
    for (const c of (p.conveyors || [])) stage.conveyors.push({ x: c.x + offset, y: c.y, w: c.w, speed: c.speed, dir: c.dir });
    for (const f of (p.fireFloors || [])) stage.fireFloors.push({ x: f.x + offset, y: f.y, w: f.w });
    for (const e of (p.enemies || [])) stage.enemies.push({ x: e.x + offset, feetRow: e.feetRow, speed: e.speed, dir: e.dir, type: e.type });
    for (const c of (p.coins || [])) stage.coins.push({ x: c.x + offset, y: c.y });
    for (const cp of (p.checkpoints || [])) stage.checkpoints.push({ x: cp.x + offset, feetRow: cp.feetRow });
    offset += p.width;
  }
  stage.gaps = [...new Set(stage.gaps)].sort((a, b) => a - b);
  stage.flagX = stage.width - 5;
  stage.playerStart = { x: 3, feetRow: 10 };
  return stage;
}
const STAGES = MAIN_STAGE_CONFIGS.map(cfg => buildStage(cfg.patterns, cfg.bg, cfg.scroll));
const EXTRA_PATTERN_POOL = Object.keys(PATTERNS).filter(id => id !== 'boss-1' && id !== 'boss-2');
let extraSeed = Date.now() % 2147483647;
function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
function buildRandomStage(seed) {
  const rand = seededRand(seed);
  const count = 6 + Math.floor(rand() * 5);
  const pool = [...EXTRA_PATTERN_POOL];
  const ids = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    ids.push(pool.splice(idx, 1)[0]);
  }
  const bg = STAGE_BGS[Math.floor(rand() * STAGE_BGS.length)];
  const scroll = rand() < 0.5 ? 0 : 1.0;
  return buildStage(ids, bg, scroll);
}
let extraStage = buildRandomStage(extraSeed);
