import Phaser from 'phaser';

class GameStateClass {
  private _moneyCents = 0;
  public readonly events = new Phaser.Events.EventEmitter();

  get moneyCents(): number {
    return this._moneyCents;
  }

  set moneyCents(value: number) {
    this._moneyCents = Math.max(0, value | 0);
    this.events.emit('money:changed', this._moneyCents);
  }

  addMoney(cents: number): void {
    this.moneyCents = this._moneyCents + (cents | 0);
  }
}

export const GameState = new GameStateClass();


