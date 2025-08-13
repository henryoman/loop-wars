import Phaser from 'phaser';
import { Chess, Move } from 'chess.js';
import Cursor from './cursor';

export default class ChessScene extends Phaser.Scene {
  constructor() { super('ChessScene'); }
  private boardOrigin = { x: 112, y: 16 }; // hard-coded origin from slice bounds

  private chess!: Chess;
  private cursor!: Cursor;
  private sprites: (Phaser.GameObjects.Sprite | null)[][] = [];

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
    const sq = this.cursor.algebraic();
    this.handleSquare(sq);
  }

  private handlePointer(pointer: Phaser.Input.Pointer): void {
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
      if (piece && piece.color === this.chess.turn()) {
        this.selected = sq;
        this.legalTargets = new Set(
          this.chess.moves({ square: sq, verbose: true }).map(m => (m as Move).to)
        );
        this.highlightTargets(true);
      }
      return;
    }

    // We already have a source; attempt to move
    if (this.legalTargets.has(sq)) {
      const move = this.chess.move({ from: this.selected, to: sq }) as Move;
      this.animateMove(move);
      if (this.chess.isGameOver()) this.finishGame();
    }
    this.clearSelection();
  }

  private clearSelection(): void {
    this.highlightTargets(false);
    this.selected = null;
    this.legalTargets.clear();
  }

  private highlightTargets(state: boolean): void {
    this.legalTargets.forEach(sq => {
      const { file, rank } = this.algToCoords(sq);
      const spr = this.sprites[rank][file];
      if (spr) spr.setTint(state ? 0x00ff00 : 0xffffff);
    });
  }

  private animateMove(move: Move): void {
    const src = this.algToCoords(move.from);
    const dst = this.algToCoords(move.to);

    const moving = this.sprites[src.rank][src.file]!;
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
    const base = piece.color === 'w' ? 0 : 6;
    return (
      { p: 0, r: 1, n: 2, b: 3, q: 4, k: 5 }[piece.type as 'p'] + base
    );
  }

  private pointerToSquare(x: number, y: number): string | null {
    const file = Math.floor((x - this.boardOrigin.x) / 32);
    const rank = 7 - Math.floor((y - this.boardOrigin.y) / 32);
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
    return 'abcdefgh'[file] + (rank + 1);
  }
}
