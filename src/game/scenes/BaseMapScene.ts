import Phaser from 'phaser';
import { PlayerController } from '../player/PlayerController';
import { IPlayerMovementInput } from '../player/types/PlayerTypes';

export default class BaseMapScene extends Phaser.Scene {
    protected player!: Phaser.Physics.Arcade.Sprite;
    protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    protected playerController!: PlayerController;

    protected create(mapWidth: number, mapHeight: number, spawnX: number, spawnY: number): void {
        this.createPlayer(spawnX, spawnY);
        this.initWorld(mapWidth, mapHeight);
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.playerController = new PlayerController(this.player);
    }

    protected createPlayer(x: number, y: number): void {
        this.player = this.physics.add.sprite(x, y, 'loop-player');
        this.player.play('player-idle-down');
        this.player.setSize(12, 12);
        this.player.setOffset(10, 20);
        this.player.setCollideWorldBounds(true);
    }

    protected initWorld(width: number, height: number): void {
        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1);
        this.cameras.main.roundPixels = true;
    }

    update(time: number, delta: number): void {
        this.handlePlayerUpdate();
    }

    protected handlePlayerUpdate(): void {
        if (!this.cursors || !this.playerController) {
            return;
        }

        const input: IPlayerMovementInput = {
            up: this.cursors.up.isDown,
            down: this.cursors.down.isDown,
            left: this.cursors.left.isDown,
            right: this.cursors.right.isDown,
        };

        this.playerController.update(input);

        const playerState = this.playerController.getState();
        if (playerState.currentState === 'walking') {
            const sprite = this.playerController.getSprite();
            console.log(`Moving: ${playerState.lastDirection}, Position: ${sprite.x}, ${sprite.y}`);
        }
    }
}
