import Phaser from 'phaser';
import BaseMapScene, { MapSceneConfig } from './BaseMapScene';
import { PlayerController } from '../player/PlayerController';
import { IPlayerMovementInput } from '../player/types/PlayerTypes';

export default class ApartmentInterior extends BaseMapScene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private playerController!: PlayerController;

    private sceneConfig: MapSceneConfig = {
        collision: {
            key: 'apartmentCollision',
            path: 'assets/images/levels/apartment-interior.json',
        },
        triggers: {
            entries: [
                { tileX: 11, tileY: 15, targetScene: 'pacc-house', key: 'door_left' },
                { tileX: 12, tileY: 15, targetScene: 'pacc-house', key: 'door_right' },
            ],
        },
    };

    constructor() {
        super('apartment-interior');
    }

    preload() {
        super.preload(this.sceneConfig);
    }

    create() {
        this.add.image(192, 144, 'apartment-interior');

        this.player = this.physics.add.sprite(192, 144, 'loop-player');
        this.player.play('player-idle-down');
        this.player.setSize(12, 12);
        this.player.setOffset(11, 20);
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.physics.world.setBounds(0, 0, 384, 288);
        this.cameras.main.setBounds(0, 0, 384, 288);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1);

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
