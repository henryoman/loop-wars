import Phaser from 'phaser';

/**
 * Cursor helper that highlights the currently selected square and
 * converts between board coordinates and algebraic notation.
 * One instance is owned by the ChessScene.
 */
export default class Cursor {
  private rect: Phaser.GameObjects.Rectangle;
  private originX: number;
  private originY: number;

  public file = 0;  // 0 – 7 (a → h)
  public rank = 0;  // 0 – 7 (1 → 8)

  constructor(scene: Phaser.Scene, originX: number, originY: number) {
    this.originX = originX;
    this.originY = originY;

    // Create a transparent rectangle with a yellow stroke
    this.rect = scene.add.rectangle(
      originX + 16,                 // tile centre X
      originY + 7 * 32 + 16,        // start on a1 (bottom-left)
      32, 32,
      0x000000, 0
    ).setStrokeStyle(2, 0xffff00);
  }

  /** Move the cursor clamping to board edges */
  move(dx: number, dy: number): void {
    this.file = Phaser.Math.Clamp(this.file + dx, 0, 7);
    this.rank = Phaser.Math.Clamp(this.rank + dy, 0, 7);
    this.rect.setPosition(
      this.originX + this.file * 32 + 16,
      this.originY + (7 - this.rank) * 32 + 16
    );
  }

  /** Returns algebraic notation like 'e4' */
  algebraic(): string {
    return 'abcdefgh'[this.file] + (this.rank + 1);
  }
}
