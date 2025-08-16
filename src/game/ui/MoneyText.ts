import Phaser from 'phaser';
import { GameState } from '../state/GameState';

/** Tiny money label fixed to top-right of the viewport. */
export default class MoneyText {
  private scene: Phaser.Scene;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const pad = 2;
    const width = scene.cameras.main.width;

    this.text = scene.add.text(width - pad, pad, this.format(GameState.moneyCents), {
      fontFamily: 'Area51 Serif',
      fontSize: '8px',
      color: '#ffffff',
      align: 'right'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    GameState.events.on('money:changed', this.onMoneyChanged, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      GameState.events.off('money:changed', this.onMoneyChanged, this);
    });
  }

  private onMoneyChanged = (cents: number) => {
    this.text.setText(this.format(cents));
  }

  private format(cents: number): string {
    const dollars = Math.floor(cents / 100);
    return `$${dollars.toLocaleString('en-US', { minimumIntegerDigits: 2 })}`;
  }
}


