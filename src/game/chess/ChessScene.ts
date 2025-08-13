import Phaser from 'phaser';
import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import Cursor from './cursor';

export default class ChessScene extends Phaser.Scene {
  constructor() { super('ChessScene'); }
  private boardOrigin = { x: 112, y: 16 }; // hard-coded origin from slice bounds

  private chess!: Chess;
  private cursor!: Cursor;
  private sprites: (Phaser.GameObjects.Sprite | null)[][] = [];
  private moveMarkers: Phaser.GameObjects.Rectangle[] = [];
  private selectedSprite: Phaser.GameObjects.Sprite | null = null;
  private inputLocked = false; // lock during AI move animations

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key[]; // J/Z as A-button
  private keyB!: Phaser.Input.Keyboard.Key[]; // K/X as B-button
  private debounce = 0;

  create(): void {
    // Draw background composite at (0,0)
    this.add.image(0, 0, 'chessBoard').setOrigin(0);

    // Initialise engine and helpers
    this.chess = new Chess();
    this.cursor = new Cursor(this, this.boardOrigin.x, this.boardOrigin.y);
    this.initSprites();

    // Keyboard input (arrows + WASD; A-button = J/Z, B-button = K/X)
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Phaser.Types.Input.Keyboard.CursorKeys;
    this.keyA = [
      this.input.keyboard!.addKey('J'),
      this.input.keyboard!.addKey('Z'),
    ];
    this.keyB = [
      this.input.keyboard!.addKey('K'),
      this.input.keyboard!.addKey('X'),
    ];

    // Mouse/touch input
    this.input.on('pointerdown', this.handlePointer, this);
  }

  private initSprites(): void {
    this.sprites = Array.from({ length: 8 }, () => Array(8).fill(null));

    this.chess.board().forEach((row, rankIdx) => {
      row.forEach((piece, fileIdx) => {
        if (!piece) return;
        const { x, y } = this.squareToWorld(fileIdx, 7 - rankIdx);
        const frame = this.codeToFrame(piece);
        const spr = this.add.sprite(x, y, 'chessPieces', frame);
        this.sprites[7 - rankIdx][fileIdx] = spr;
      });
    });
  }

  update(time: number): void {
    if (this.inputLocked) return;
    // Arrow/WASD movement debounce (150 ms)
    if (time > this.debounce) {
      if ((this.cursors.left!.isDown) || (this.wasd.left!.isDown)) { this.cursor.move(-1, 0); this.debounce = time + 150; }
      if ((this.cursors.right!.isDown) || (this.wasd.right!.isDown)) { this.cursor.move(1, 0);  this.debounce = time + 150; }
      if ((this.cursors.up!.isDown) || (this.wasd.up!.isDown)) { this.cursor.move(0, 1);   this.debounce = time + 150; }
      if ((this.cursors.down!.isDown) || (this.wasd.down!.isDown)) { this.cursor.move(0, -1);  this.debounce = time + 150; }
    }

    if (this.keyA.some(k => Phaser.Input.Keyboard.JustDown(k))) this.handleA();
    if (this.keyB.some(k => Phaser.Input.Keyboard.JustDown(k))) this.clearSelection();
  }

  // ───────────────────────── selection logic ─────────────────────────
  private selected: string | null = null;
  private legalTargets: Set<string> = new Set();

  private handleA(): void {
    if (this.inputLocked) return;
    const sq = this.cursor.algebraic();
    console.log('[CHESS] A pressed on', sq);
    this.handleSquare(sq);
  }

  private handlePointer(pointer: Phaser.Input.Pointer): void {
    if (this.inputLocked) return;
    const sq = this.pointerToSquare(pointer.worldX, pointer.worldY);
    if (!sq) return;

    const { file, rank } = this.algToCoords(sq);
    this.cursor.file = file;
    this.cursor.rank = rank;
    this.handleSquare(sq);
  }

  private handleSquare(sq: string): void {
    if (!this.selected) {
      // No source selected yet → try selecting own piece
      const piece = this.chess.get(sq);
      console.log('[CHESS] Selecting', sq, 'piece=', piece);
      if (piece && piece.color === this.chess.turn()) {
        this.selected = sq;
        const moves = this.chess.moves({ square: sq, verbose: true }) as Move[];
        this.legalTargets = new Set(moves.map(m => m.to));
        console.log('[CHESS] Legal targets from', sq, '→', Array.from(this.legalTargets));
        // Tint the selected source sprite
        const { file, rank } = this.algToCoords(sq);
        this.selectedSprite = this.sprites[rank][file] || null;
        if (this.selectedSprite) this.selectedSprite.setTint(0xffff00);
        this.highlightTargets(true);
      }
      return;
    }

    // We already have a source; attempt to move
    if (this.legalTargets.has(sq)) {
      const move = this.chess.move({ from: this.selected, to: sq }) as Move;
      console.log('[CHESS] Move success', move);
      this.animateMove(move);
      // Schedule simple AI reply after animation
      this.time.delayedCall(150, () => this.makeAIMoveIfNeeded());
    }
    else {
      console.log('[CHESS] Move rejected: not in legal set', sq);
    }
    this.clearSelection();
  }

  private clearSelection(): void {
    this.highlightTargets(false);
    if (this.selectedSprite) {
      this.selectedSprite.setTint(0xffffff);
      this.selectedSprite = null;
    }
    this.selected = null;
    this.legalTargets.clear();
  }

  private highlightTargets(state: boolean): void {
    // Clear existing markers
    this.moveMarkers.forEach(m => m.destroy());
    this.moveMarkers.length = 0;

    if (!state) return;

    // Draw translucent markers on all legal destination squares
    this.legalTargets.forEach(sq => {
      const { file, rank } = this.algToCoords(sq);
      const pos = this.squareToWorld(file, rank);
      const marker = this.add.rectangle(pos.x, pos.y, 32, 32, 0x00ff00, 0.2);
      marker.setStrokeStyle(1, 0x00ff00, 0.9);
      marker.setDepth(10);
      this.moveMarkers.push(marker);
    });
  }

  private animateMove(move: Move): void {
    const src = this.algToCoords(move.from);
    const dst = this.algToCoords(move.to);

    const moving = this.sprites[src.rank][src.file];
    if (!moving) {
      console.warn('[CHESS] No sprite at source square', move.from, src);
      return;
    }
    const captured = this.sprites[dst.rank][dst.file];
    if (captured) captured.destroy();

    this.sprites[dst.rank][dst.file] = moving;
    this.sprites[src.rank][src.file] = null;

    const { x, y } = this.squareToWorld(dst.file, dst.rank);
    this.tweens.add({ targets: moving, x, y, duration: 120 });
  }

  private finishGame(): void {
    const result = this.chess.inCheckmate()
      ? `${this.chess.turn() === 'w' ? 'Black' : 'White'} wins`
      : 'Draw';
    this.events.emit('chess-done', result);
    const winner = this.chess.inCheckmate()
      ? this.chess.turn() === 'w' ? 'black' : 'white'
      : null;
    this.game.events.emit('chess-result', { result, winner });
    this.scene.stop();
  }

  // ───────────────────────── AI (very simple): prefer capture, else random
  private makeAIMoveIfNeeded(): void {
    if (this.chess.isGameOver()) { this.finishGame(); return; }
    // Assuming player is White; AI plays when it's Black's turn
    if (this.chess.turn() !== 'b') return;

    this.inputLocked = true;
    const moves = this.chess.moves({ verbose: true }) as Move[];
    if (moves.length === 0) { this.inputLocked = false; this.finishGame(); return; }

    let chosen = moves.find(m => (m as any).captured);
    if (!chosen) {
      const promos = moves.filter(m => (m as any).promotion);
      if (promos.length) chosen = promos[Math.floor(Math.random() * promos.length)];
    }
    if (!chosen) chosen = moves[Math.floor(Math.random() * moves.length)];

    const moved = this.chess.move({ from: chosen.from, to: chosen.to, promotion: (chosen as any).promotion }) as Move;
    console.log('[CHESS][AI] Move', moved);
    this.animateMove(moved);

    this.time.delayedCall(150, () => {
      this.inputLocked = false;
      if (this.chess.isGameOver()) this.finishGame();
    });
  }

  // ───────────────────────── helpers ─────────────────────────
  private squareToWorld(file: number, rank: number) {
    return {
      x: this.boardOrigin.x + file * 32 + 16,
      y: this.boardOrigin.y + (7 - rank) * 32 + 16,
    };
  }

  private algToCoords(a: string) {
    return {
      file: a.charCodeAt(0) - 97,
      rank: parseInt(a[1], 10) - 1,
    };
  }

  private codeToFrame(piece: { type: string; color: string; }): number {
    // Our sheet is 6 columns × 2 rows (top = white, bottom = black)
    const whiteBase = 0;
    const blackBase = 6;
    const indexMap: Record<string, number> = { p: 0, r: 1, n: 2, b: 3, q: 4, k: 5 };
    const base = piece.color === 'w' ? whiteBase : blackBase;
    return base + indexMap[piece.type];
  }

  private pointerToSquare(x: number, y: number): string | null {
    const file = Math.floor((x - this.boardOrigin.x) / 32);
    const rank = 7 - Math.floor((y - this.boardOrigin.y) / 32);
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
    return 'abcdefgh'[file] + (rank + 1);
  }

  // Optional: simple on-screen legend for controls
  // (call once if you want: this.add.text(2, 2, 'Arrows/WASD: Move  J/Z: Select  K/X: Cancel', { fontSize: '8px' }))
}
