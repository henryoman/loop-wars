import Phaser from 'phaser';
import { PlayerController } from '../player/PlayerController';
import { IPlayerMovementInput } from '../player/types/PlayerTypes';

export default class PaccHouse extends Phaser.Scene {

	constructor() {
		super("pacc-house");
	}

	private player!: Phaser.Physics.Arcade.Sprite;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
	private playerController!: PlayerController;

	preload() {
		// Load the collision PNG as a sprite for pixel-perfect detection
		this.load.image('paccHouseCollision', 'assets/images/levels/pacc-house-interior-collision.png');
	}

	create() {
		// Background image
		this.add.image(192, 144, "pacc-house-interior");

		// Create the player physics sprite at center of screen
		this.player = this.physics.add.sprite(192, 144, 'loop-player');
		this.player.play('player-idle-down');

		// Set up player physics body - 12x12 centered horizontally, bottom aligned
		this.player.setSize(12, 12); // Collision box size
		this.player.setOffset(10, 20); // Offset 10 pixels from left to center, 20 from top for bottom 12 pixels
		this.player.setCollideWorldBounds(true);

		// Set up input
		this.cursors = this.input.keyboard!.createCursorKeys();

		// Set world bounds for physics and camera
		this.physics.world.setBounds(0, 0, 384, 288);
		this.cameras.main.setBounds(0, 0, 384, 288);
		this.cameras.main.startFollow(this.player);
		this.cameras.main.setLerp(0.1, 0.1);

		// Create pixel-perfect collision group
		this.collisionGroup = this.physics.add.staticGroup();
		this.setupPixelPerfectCollision();

		// Initialize player controller
		this.playerController = new PlayerController(this.player);

	}

	private setupPixelPerfectCollision() {
		// Create invisible collision sprite with pixel-perfect hit area
		const collisionImg = this.add.image(0, 0, 'paccHouseCollision');
		collisionImg.setOrigin(0, 0);
		collisionImg.setVisible(false);
		
		// Enable input with pixel-perfect detection
		collisionImg.setInteractive(this.input.makePixelPerfect(1));
		
		// Add physics body
		this.physics.add.existing(collisionImg, true);
		this.collisionGroup.add(collisionImg);
		
		// Set up collision between player and collision group
		this.physics.add.collider(this.player, this.collisionGroup);
		
		console.log('✅ Pixel-perfect collision system enabled using Phaser makePixelPerfect()');
	}

	update() {
		// Create input object from cursors
		const input: IPlayerMovementInput = {
			up: this.cursors.up.isDown,
			down: this.cursors.down.isDown,
			left: this.cursors.left.isDown,
			right: this.cursors.right.isDown
		};

		// Update player via controller
		this.playerController.update(input);

		// Debug log when moving (maintain existing debug behavior)
		const playerState = this.playerController.getState();
		if (playerState.currentState === 'walking') {
			const sprite = this.playerController.getSprite();
			console.log(`Moving: ${playerState.lastDirection}, Position: ${sprite.x}, ${sprite.y}`);
		}
	}
}