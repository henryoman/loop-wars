import Phaser from 'phaser';
import { PlayerController } from '../player/PlayerController';
import { IPlayerMovementInput } from '../player/types/PlayerTypes';
import { CollisionLoader } from '../utils/CollisionLoader';
import { TriggerManager } from '../utils/TriggerManager';
import { getMovementInput } from '../input/Keymap';

export default class ApartmentInterior extends Phaser.Scene {

	constructor() {
		super("apartment-interior");
	}

	private player!: Phaser.Physics.Arcade.Sprite;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; // legacy; will be removed
	private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
	private playerController!: PlayerController;
	private collisionLoader!: CollisionLoader;
	private triggerManager!: TriggerManager;
	private collisionRects: Phaser.GameObjects.Rectangle[] = [];

	preload() {
		// Initialize collision loader
		this.collisionLoader = new CollisionLoader(this);
		
		// Load slice collision data from apartment-interior.json (without the "2")
		this.collisionLoader.loadSliceCollision('apartmentCollision', 'assets/images/levels/apartment-interior.json');
		
		// Handle load errors gracefully
		this.load.on('loaderror', (file: any) => {
			if (file.key === 'apartmentCollision') {
				console.warn('Collision data not found for ApartmentInterior - no collision will be active');
			}
		});
	}

	create() {
		// Background image - using apartment-interior.png (without the "2")
		this.add.image(192, 144, "apartment-interior");

		// Create the player physics sprite at center of screen
		this.player = this.physics.add.sprite(192, 144, 'loop-player');
		this.player.play('player-idle-down');

		// Set up player physics body - 12x12 centered horizontally, bottom aligned
		this.player.setSize(12, 12); // Collision box size
		this.player.setOffset(11, 20); // Offset 11 pixels from left to center, 20 from top for bottom 12 pixels
		this.player.setCollideWorldBounds(true);

		// Input now centralized via Keymap.getMovementInput

		// Set world bounds for physics and camera
		this.physics.world.setBounds(0, 0, 384, 288);
		this.cameras.main.setBounds(0, 0, 384, 288);
		this.cameras.main.startFollow(this.player);
		this.cameras.main.setLerp(0.1, 0.1);

		// Create slice-based collision system
		this.collisionGroup = this.physics.add.staticGroup();
		this.setupSliceCollision();

		// Initialize trigger system
		this.triggerManager = new TriggerManager(this);
		this.setupTriggers();

		// Initialize player controller
		this.playerController = new PlayerController(this.player);
	}

	private setupSliceCollision() {
		// Create collision bodies from Aseprite slice data
		this.collisionRects = this.collisionLoader.createSliceCollision('apartmentCollision', this.collisionGroup);
		
		// Setup player collision with the collision group
		this.collisionLoader.setupPlayerCollision(this.player, this.collisionGroup);
		
		// Uncomment below to enable debug visualization (red rectangles)
		// this.collisionLoader.enableDebugVisualization(this.collisionRects);
		
		console.log('✅ Slice-based collision system enabled for ApartmentInterior');
	}

	private setupTriggers() {
		// Add scene transition triggers at tiles 11,15 and 12,15 -> pacc-house
		// Grid: 24x18 tiles (0-23 horizontal, 0-17 vertical)
		// Tile 15 = row 15 out of 18 = near bottom of room
		this.triggerManager.addSceneTrigger(11, 15, 'pacc-house', 'door_left');
		this.triggerManager.addSceneTrigger(12, 15, 'pacc-house', 'door_right');
		
		// Setup player trigger collision
		this.triggerManager.setupPlayerTriggers(this.player);
		
		// Uncomment below to enable debug visualization (green rectangles)
		// this.triggerManager.enableDebugVisualization();
		
		console.log('✅ Scene triggers setup: tiles (11,15) and (12,15) -> pacc-house');
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