# Pixel Chip

A 2D pixel-art platformer. Run, jump, shoot fireballs, and clear 6 main stages plus a random EXTRA stage.

Play: https://otaniyan-ai.github.io/pixel-chip/

## 遊び方

| 入力 | 操作 |
|------|------|
| 左 / 右矢印 | 移動 |
| 上矢印 / Space | ジャンプ（長押しで高く跳ぶ） |
| Xキー | 火球 |
| タッチボタン（スマホ） | 左 / ジャンプ / 火 / 右 |

- 3ライフ、チェックポイントで復活、Stage 5で強制スクロール
- 敵を踏むとスコア、火球で遠距離攻撃
- フラグで次のステージへ、EXTRAはシードランダム
- 右上の STAGE ボタンで任意のステージへ

## How to Play

| Input | Action |
|-------|--------|
| Left / Right arrow | Move |
| Up arrow / Space | Jump (hold for higher jump) |
| X key | Fireball |
| Touch buttons (mobile) | Left / Jump / Fire / Right |

- 3 lives, checkpoint respawn, forced scroll on Stage 5
- Stomp enemies for score, fireballs kill from range
- Clear the flag to advance; EXTRA stage is seed-random
- Stage select button (top-right) to jump to any stage

## Technical Architecture

### Pattern System

- **216 patterns**, each 50 columns × 12 rows (TILE = 32px)
- 216パターン、各50列×12行、17種の要素（Gap/コイン/敵/プラットフォーム/パイプ/ブロック/梯子/スプリング/コンベヤー/火床/チェックポイント等）
- 17 element types: gaps, platforms, moving platforms, vertical platforms, breakable platforms, pipes, blocks (?/brick), hidden blocks, ladders, moving ladders, springs, conveyors, fire floors, enemies, coins, checkpoints
- Patterns are composed into stages; each stage concatenates pattern widths
- Difficulty 1–5 per pattern

### Stage Composition

- **6 main stages** (fixed pattern sequences, different BG + scroll)
- メイン6本（固定パターン列、BG/スクロール違い）+ EXTRAシードランダム
- **EXTRA stage**: seed-based random (6–10 patterns from pool, random BG/scroll)
- `extraSeed = Date.now() % 2147483647` — different every play

### Enemy AI

- 5種: walk / fast / jump / fly / shooter

| Type | Speed | Behavior |
|------|-------|----------|
| walk | 0.8 | Walks on ground |
| fast | 1.2 | Walks faster |
| jump | 0.8 | Jumps periodically |
| fly | 1.0 | Flies in sine wave |
| shooter | 0.8 | Fires projectiles |

### Rendering

- Canvas 640×384 (20×12 tiles at 32px)
- Canvas 640×384、pixelated描画、ステージごとに空/山/雲が変化
- `image-rendering: pixelated` for crisp pixels
- Background: gradient sky + mountains + clouds (varies per stage)
- Ground: grass + dirt layers

### Variable Jump

- Quick tap = short jump
- 短押し=低いジャンプ、長押し=高いジャンプ
- Hold = higher jump (velocity scales with hold time)

## Pattern Editor (`editor.html`)

Open `editor.html` in a browser (same directory). No server needed.

### Tools (17)

Gap / Coin / Enemy / Platform / Moving Platform / Vertical Platform / Breakable Platform / Pipe / Block / Hidden Block / Ladder / Moving Ladder / Spring / Conveyor / Fire Floor / Checkpoint / Select / Delete

- **Select**: click an element to inspect/edit properties
- **Delete**: click any element to remove it
- **Enemy type**: dropdown next to Enemy tool (walk/fast/jump/fly/shooter)

### Features

- **Grid editing**: drag to paint, full TILE=32 rendering (1600×384 canvas)
- **Properties panel**: edit x/y/w/h/range/speed/power/dir per element
- **Copy / Paste**: select region → Ctrl+C → Ctrl+V at new position
- **Undo / Redo**: Ctrl+Z / Ctrl+Y
- **Validation**: checks consecutive gaps, enemy placement, coin positions
- **Stage filter**: left panel filter by stage (shows only patterns used in that stage)
- **Category filter**: All / Anchor / Generic / Variation / Boss
- **Export**: Blob download (`patterns.js` / `stages.js`) → replace file in project
- **Copy to Clipboard**: separate buttons for patterns.js / stages.js
- **Language toggle**: JP / EN
- **localStorage**: save/load editor state

### Stage Composition Tab

- Stage 1–6 + EXTRA selector
- Add/remove patterns per stage
- BG / scroll speed selection

## BGM / SFX

All audio is from **Conte de Fées (こんとどぅふぇ)** — https://conte-de-fees.com/

- Commercial use OK / Attribution optional / Content ID free
- See [LICENSE-AUDIO.md](LICENSE-AUDIO.md) for full terms

```
BGM: こんとどぅふぇ https://conte-de-fees.com/
```

## Development Log

- `test-play.js`: 302 assertions, all passing
- Tests cover: movement, jump, stomp, gaps, fall death, respawn, game over, restart, stage clear, blocks, moving platforms, time limit, enemy types, variable jump, touch controls, SFX, BGM, backgrounds, clouds, mountains, fire power, fireball, stomp combo, checkpoint, hidden block, fire cooldown, boss stage, ladder, vertical platform, breakable platform, forced scroll, stage select, high score, pause, volume, pattern library, double-gap, elevated, enemy-corridor, chain-move, moving-ladder, spring, conveyor, fire-floor patterns

## License

- **Game code**: [MIT](LICENSE)
- **Audio assets**: [Conte de Fées license](LICENSE-AUDIO.md)
