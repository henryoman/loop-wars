import Phaser from 'phaser';
import { PlayerController } from '../player/PlayerController';
import { getMovementInput } from '../input/Keymap';
import { IPlayerMovementInput } from '../player/types/PlayerTypes';
import { CollisionLoader } from '../utils/CollisionLoader';

export default class PaccHouse extends Phaser.Scene {

	constructor() {
		super("pacc-house");
	}

	private player!: Phaser.Physics.Arcade.Sprite;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; // legacy
	private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
	private playerController!: PlayerController;
	private collisionLoader!: CollisionLoader;
	private collisionRects: Phaser.GameObjects.Rectangle[] = [];

	preload() {
		// Initialize collision loader
		this.collisionLoader = new CollisionLoader(this);
		
		// Load slice collision data from pacc-house-interior.json
		this.collisionLoader.loadSliceCollision('paccHouseCollision', 'assets/images/levels/pacc-house-interior.json');
		
		// Handle load errors gracefully
		this.load.on('loaderror', (file: any) => {
			if (file.key === 'paccHouseCollision') {
				console.warn('Collision data not found for PaccHouse - no collision will be active');
			}
		});
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

		// Input centralized via Keymap

		// Set world bounds for physics and camera
		this.physics.world.setBounds(0, 0, 384, 288);
		this.cameras.main.setBounds(0, 0, 384, 288);
		this.cameras.main.startFollow(this.player);
		this.cameras.main.setLerp(0.1, 0.1);

		// Create slice-based collision system
		this.collisionGroup = this.physics.add.staticGroup();
		this.setupSliceCollision();

		// Initialize player controller
		this.playerController = new PlayerController(this.player);
	}

	private setupSliceCollision() {
		// Create collision bodies from Aseprite slice data
		this.collisionRects = this.collisionLoader.createSliceCollision('paccHouseCollision', this.collisionGroup);
		
		// Setup player collision with the collision group
		this.collisionLoader.setupPlayerCollision(this.player, this.collisionGroup);
		
		// Uncomment below to enable debug visualization (red rectangles)
		// this.collisionLoader.enableDebugVisualization(this.collisionRects);
		
		console.log('✅ Slice-based collision system enabled for PaccHouse');
	}

	update() {
		// Create input object from centralized keymap
		const input = getMovementInput(this);

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