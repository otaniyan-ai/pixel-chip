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
- 17要素：ギャップ / 固定プラットフォーム / 移動プラットフォーム / 垂直プラットフォーム / 壊れるプラットフォーム / パイプ / ブロック（?/レンガ）/ 隠れブロック / 梯子 / 移動梯子 / スプリング / コンベヤー / 火床 / 敵 / コイン / チェックポイント
- Patterns are composed into stages; each stage concatenates pattern widths
- パターンを連結してステージを構成。各ステージはパターンの幅を足し算
- Difficulty 1–5 per pattern
- 難易度1〜5（パターンごとに設定）

### Stage Composition

- **6 main stages** (fixed pattern sequences, different BG + scroll)
- メイン6本（固定パターン列、BG/スクロール違い）+ EXTRAシードランダム
- **EXTRA stage**: seed-based random (6–10 patterns from pool, random BG/scroll)
- EXTRAステージ：シードベースのランダム（プールから6〜10パターン、BG/スクロールもランダム）
- `extraSeed = Date.now() % 2147483647` — different every play
- 毎回異なるシードで生成される

### Enemy AI

- 5種: walk / fast / jump / fly / shooter

| Type | Speed | Behavior |
|------|-------|----------|
| walk | 0.8 | 地面を歩く |
| fast | 1.2 | 高速で歩く |
| jump | 0.8 | 定期的にジャンプ |
| fly | 1.0 | 正弦波で飛行 |
| shooter | 0.8 | 画面内のみ発射（90フレーム間隔） |

### Rendering

- Canvas 640×384 (20×12 tiles at 32px)
- Canvas 640×384、pixelated描画、ステージごとに空/山/雲が変化
- `image-rendering: pixelated` for crisp pixels
- シャープなピクセル表示
- Background: gradient sky + mountains + clouds (varies per stage)
- 背景：グラデーション空 + 山 + 雲（ステージごとに変化）
- Ground: grass + dirt layers
- 地面：草 + 土の2層

### Variable Jump

- Quick tap = short jump
- 短押し=低いジャンプ、長押し=高いジャンプ
- Hold = higher jump (velocity scales with hold time)
- 長押しで速度が上昇し、跳躍距離が伸びる

## Pattern Editor (`editor.html`)

Open `editor.html` in a browser (same directory). No server needed.
ブラウザで `editor.html` を開く（同ディレクトリ）。サーバー不要。

### Tools (17)

Gap / Coin / Enemy / Platform / Moving Platform / Vertical Platform / Breakable Platform / Pipe / Block / Hidden Block / Ladder / Moving Ladder / Spring / Conveyor / Fire Floor / Checkpoint / Select / Delete

- **Select**: click an element to inspect/edit properties
- 選択：要素をクリックして属性を確認/編集
- **Delete**: click any element to remove it
- 削除：任意の要素をクリックで削除
- **Enemy type**: dropdown next to Enemy tool (walk/fast/jump/fly/shooter)
- 敵種：敵ツールの隣にドロップダウン（walk/fast/jump/fly/shooter）

### Features

- **Grid editing**: drag to paint, full TILE=32 rendering (1600×384 canvas)
- グリッド編集：ドラッグで描画、TILE=32フルサイズ描画（1600×384 canvas）
- **Properties panel**: edit x/y/w/h/range/speed/power/dir per element
- 属性パネル：要素ごとに x/y/w/h/range/speed/power/dir を編集
- **Copy / Paste**: select region → Ctrl+C → Ctrl+V at new position
- コピー/ペースト：領域選択 → Ctrl+C → 新位置で Ctrl+V
- **Undo / Redo**: Ctrl+Z / Ctrl+Y
- 元に戻す/やり直す：Ctrl+Z / Ctrl+Y
- **Validation**: checks consecutive gaps, enemy placement, coin positions
- 検証：連続ギャップ・敵配置・コイン位置をチェック
- **Stage filter**: left panel filter by stage (shows only patterns used in that stage)
- ステージフィルタ：左パネルでステージ別に絞り込み（そのステージ使用パターンのみ表示）
- **Category filter**: All / Anchor / Generic / Variation / Boss
- カテゴリフィルタ：全 / アンカー / ジェネリック / バリエーション / ボス
- **Export**: Blob download (`patterns.js` / `stages.js`) → replace file in project
- エクスポート：Blobダウンロード（`patterns.js` / `stages.js`）→ プロジェクトのファイルに置き換え
- **Copy to Clipboard**: separate buttons for patterns.js / stages.js
- クリップボードにコピー：patterns.js / stages.js の別ボタン
- **Language toggle**: JP / EN
- 言語切替：JP / EN
- **localStorage**: save/load editor state
- localStorage：エディター状態の保存/読み込み

### Stage Composition Tab

- Stage 1–6 + EXTRA selector
- Stage 1〜6 + EXTRA 選択
- Add/remove patterns per stage
- ステージごとにパターンの追加/削除
- BG / scroll speed selection
- BG / スクロール速度の選択

## BGM / SFX

All audio is from **Conte de Fées (こんとどぅふぇ)** — https://conte-de-fees.com/
全音源は **Conte de Fées（こんとどぅふぇ）** — https://conte-de-fees.com/

- Commercial use OK / Attribution optional / Content ID free
- 商用利用OK / クレジット任意 / Content IDフリー
- See [LICENSE-AUDIO.md](LICENSE-AUDIO.md) for full terms
- 詳細は [LICENSE-AUDIO.md](LICENSE-AUDIO.md) を参照

```
BGM: こんとどぅふぇ https://conte-de-fees.com/
```

## License

- **Game code**: [MIT](LICENSE)
- ゲームコード：[MIT](LICENSE)
- **Audio assets**: [Conte de Fées license](LICENSE-AUDIO.md)
- 音源：[Conte de Fées ライセンス](LICENSE-AUDIO.md)
