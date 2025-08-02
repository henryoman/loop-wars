import Phaser from 'phaser';
import { PlayerController } from '../player/PlayerController';
import { IPlayerMovementInput } from '../player/types/PlayerTypes';
import { CollisionLoader } from '../utils/CollisionLoader';
import { TriggerManager } from '../utils/TriggerManager';

export default class ChinatownExterior extends Phaser.Scene {

	constructor() {
		super("chinatown-exterior");
	}

	private player!: Phaser.Physics.Arcade.Sprite;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
	private playerController!: PlayerController;
	private collisionLoader!: CollisionLoader;
	private triggerManager!: TriggerManager;
	private collisionRects: Phaser.GameObjects.Rectangle[] = [];

	preload() {
		// Initialize collision loader
		this.collisionLoader = new CollisionLoader(this);
		
		// Load slice collision data from chinatown-exterior.json
		this.collisionLoader.loadSliceCollision('chinatownCollision', 'assets/images/levels/chinatown-exterior.json');
		
		// Handle load errors gracefully
		this.load.on('loaderror', (file: any) => {
			if (file.key === 'chinatownCollision') {
				console.warn('Collision data not found for ChinatownExterior - no collision will be active');
			}
		});
	}

	create() {
		// Background image - position at top-left of world (0,0) 
		const bg = this.add.image(0, 0, "chinatown-exterior");
		bg.setOrigin(0, 0); // Set origin to top-left so image starts at (0,0)

		// Create the player physics sprite at position 40,25
		this.player = this.physics.add.sprite(40, 25, 'loop-player');
		this.player.play('player-idle-down');

		// Set up player physics body - 12x12 centered horizontally, bottom aligned
		this.player.setSize(12, 12); // Collision box size
		this.player.setOffset(11, 20); // Offset 11 pixels from left to center, 20 from top for bottom 12 pixels
		this.player.setCollideWorldBounds(true);

		// Set up input
		this.cursors = this.input.keyboard!.createCursorKeys();

		// Set world bounds for physics and camera to match actual map size
		this.physics.world.setBounds(0, 0, 720, 480);
		this.cameras.main.setBounds(0, 0, 720, 480);
		
		// Enable pixel-perfect camera for pixel art (no sub-pixel rendering)
		this.cameras.main.roundPixels = true;
		
		// Camera follows player with no smoothing for pixel art
		this.cameras.main.startFollow(this.player, true); // true = roundPixels enabled

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
		this.collisionRects = this.collisionLoader.createSliceCollision('chinatownCollision', this.collisionGroup);
		
		// Setup player collision with the collision group
		this.collisionLoader.setupPlayerCollision(this.player, this.collisionGroup);
		
		// Uncomment below to enable debug visualization (red rectangles)
		// this.collisionLoader.enableDebugVisualization(this.collisionRects);
		
		console.log('✅ Slice-based collision system enabled for ChinatownExterior');
	}

	private setupTriggers() {
		// Add scene transition triggers at tiles 10,20 and 11,20 -> apartment-interior
		this.triggerManager.addSceneTrigger(10, 20, 'apartment-interior', 'door_left');
		this.triggerManager.addSceneTrigger(11, 20, 'apartment-interior', 'door_right');
		
		        // Add chess scene triggers at tiles 16,7 and 17,7
        this.triggerManager.addSceneTrigger(16, 7, 'ChessScene', 'chess_left');
        this.triggerManager.addSceneTrigger(17, 7, 'ChessScene', 'chess_right');

        // Setup player trigger collision
		this.triggerManager.setupPlayerTriggers(this.player);
		
		// Uncomment below to enable debug visualization (green rectangles)
		// this.triggerManager.enableDebugVisualization();
		
		console.log('✅ Scene triggers setup: tiles (10,20) and (11,20) -> apartment-interior');
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