import Phaser from 'phaser';
import { GameState } from '../state/GameState';

export default class HUDScene extends Phaser.Scene {
  private moneyText!: Phaser.GameObjects.Text;

  constructor() { super('HUD'); }

  create(): void {
    // Make HUD scene fully transparent (no screen clear)
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    // Simple money display at top-right (camera-fixed)
    const pad = 2;
    this.moneyText = this.add.text(384 - pad, pad, this.formatMoney(GameState.moneyCents), {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff',
      align: 'right'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    // Ensure camera follow in game scenes doesn't affect HUD
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.ignore([]); // keep defaults; text is already scrollFactor(0)

    // Listen for state changes
    GameState.events.on('money:changed', this.onMoneyChanged, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      GameState.events.off('money:changed', this.onMoneyChanged, this);
    });

    // Always render HUD above any newly started scene
    this.scene.manager.events.on(Phaser.Scenes.Events.START, (scene: Phaser.Scene) => {
      if (scene !== this) this.scene.bringToTop();
    });

    // Bring HUD on top now as well
    this.scene.bringToTop();
  }

  private onMoneyChanged = (cents: number) => {
    this.moneyText.setText(this.formatMoney(cents));
  }

  private formatMoney(cents: number): string {
    const dollars = Math.floor(cents / 100);
    return `$${dollars.toLocaleString('en-US', { minimumIntegerDigits: 2 })}`;
  }
}


