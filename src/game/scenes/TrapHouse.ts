import Phaser from 'phaser';
import { PlayerController } from '../player/PlayerController';
import { IPlayerMovementInput } from '../player/types/PlayerTypes';

export default class TrapHouse extends Phaser.Scene {

	constructor() {
		super("TrapHouse");
	}

	private player!: Phaser.Physics.Arcade.Sprite;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
	private playerController!: PlayerController;

	create() {
		// Background image
		this.add.image(192, 144, "traphouse");

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

		// Create collision group for walls and obstacles
		this.collisionGroup = this.physics.add.staticGroup();
		
		// Load tilemap data and create collision rectangles
		this.createCollisionFromTilemap();

		// Set up collision between player and collision group
		this.physics.add.collider(this.player, this.collisionGroup);

		// Initialize player controller
		this.playerController = new PlayerController(this.player);

	}

	private createCollisionFromTilemap() {
		// Get the tilemap data
		const mapData = this.cache.json.get('homeInteriorMap');
		const tileSize = mapData.tileSize; // 16 pixels
		
		// Find the collision layer (Layer_1 with collider: true)
		const collisionLayer = mapData.layers.find((layer: any) => layer.collider === true);
		
		if (collisionLayer) {
			// Create invisible collision rectangles for each collision tile
			collisionLayer.tiles.forEach((tile: any) => {
				// Ensure pixel-perfect positioning - use Math.floor for exact integers
				const x = Math.floor(tile.x * tileSize + (tileSize / 2)); // Center position
				const y = Math.floor(tile.y * tileSize + (tileSize / 2)); // Center position
				
				// Create invisible collision rectangle
				const collisionRect = this.add.rectangle(x, y, tileSize, tileSize, 0xff0000, 0);
				collisionRect.setVisible(false); // Make invisible
				
				// Add physics body to the rectangle and ensure pixel alignment
				this.physics.add.existing(collisionRect, true); // true = static body
				if (collisionRect.body) {
					// Ensure the physics body is also pixel-aligned
					(collisionRect.body as Phaser.Physics.Arcade.StaticBody).setSize(tileSize, tileSize);
				}
				this.collisionGroup.add(collisionRect);
			});
		}
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