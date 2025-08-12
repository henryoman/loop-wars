import Phaser from 'phaser';
import BaseMapScene, { MapSceneConfig } from './BaseMapScene';
import { PlayerController } from '../player/PlayerController';
import { IPlayerMovementInput } from '../player/types/PlayerTypes';

export default class ChinatownExterior extends BaseMapScene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private playerController!: PlayerController;

    private sceneConfig: MapSceneConfig = {
        collision: {
            key: 'chinatownCollision',
            path: 'assets/images/levels/chinatown-exterior.json',
        },
        triggers: {
            entries: [
                { tileX: 10, tileY: 20, targetScene: 'apartment-interior', key: 'door_left' },
                { tileX: 11, tileY: 20, targetScene: 'apartment-interior', key: 'door_right' },
                { tileX: 16, tileY: 7, targetScene: 'ChessScene', key: 'chess_left' },
                { tileX: 17, tileY: 7, targetScene: 'ChessScene', key: 'chess_right' },
            ],
        },
    };

    constructor() {
        super('chinatown-exterior');
    }

    preload() {
        super.preload(this.sceneConfig);
    }

    create() {
        const bg = this.add.image(0, 0, 'chinatown-exterior');
        bg.setOrigin(0, 0);

        this.player = this.physics.add.sprite(40, 25, 'loop-player');
        this.player.play('player-idle-down');
        this.player.setSize(12, 12);
        this.player.setOffset(11, 20);
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.physics.world.setBounds(0, 0, 720, 480);
        this.cameras.main.setBounds(0, 0, 720, 480);
        this.cameras.main.roundPixels = true;
        this.cameras.main.startFollow(this.player, true);

        super.create(this.sceneConfig);

        this.playerController = new PlayerController(this.player);
    }

    update() {
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
