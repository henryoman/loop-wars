import Phaser from 'phaser';
import { PlayerController } from '../player/PlayerController';
import { IPlayerMovementInput } from '../player/types/PlayerTypes';

export default class ApartmentInterior extends Phaser.Scene {

	constructor() {
		super("apartment-interior");
	}

	private player!: Phaser.Physics.Arcade.Sprite;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
	private playerController!: PlayerController;
	private collisionMask?: Phaser.GameObjects.Image;

	preload() {
		// Load the collision PNG for pixel-perfect collision
		this.load.image('apartmentInteriorCollision', 'assets/images/levels/apartment-interior-collision.png');
	}

	create() {
		// Background image
		this.add.image(192, 144, "apartment-interior");

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
		
		// Set up pixel-perfect collision system
		this.setupPixelPerfectCollision();

		// Initialize player controller
		this.playerController = new PlayerController(this.player);

	}

	private setupPixelPerfectCollision() {
		// Load the collision mask image (invisible)
		this.collisionMask = this.add.image(0, 0, 'apartmentInteriorCollision');
		this.collisionMask.setOrigin(0, 0);
		this.collisionMask.setVisible(false);
		
		console.log('Pixel-perfect collision system enabled for ApartmentInterior');
	}

	private checkPixelCollision(x: number, y: number): boolean {
		if (!this.collisionMask) return false;
		
		// Get the texture data
		const texture = this.collisionMask.texture;
		const frame = this.collisionMask.frame;
		
		// Check if coordinates are within bounds
		if (x < 0 || y < 0 || x >= frame.width || y >= frame.height) {
			return false;
		}
		
		// Get pixel data from the collision mask
		const canvas = texture.getSourceImage() as HTMLCanvasElement;
		if (canvas && canvas.getContext) {
			const ctx = canvas.getContext('2d');
			if (ctx) {
				const imageData = ctx.getImageData(x, y, 1, 1);
				const alpha = imageData.data[3]; // Alpha channel
				return alpha > 0; // Collision if not transparent
			}
		}
		
		return false;
	}

	update() {
		// Store player position before movement
		const oldX = this.player.x;
		const oldY = this.player.y;

		// Create input object from cursors
		const input: IPlayerMovementInput = {
			up: this.cursors.up.isDown,
			down: this.cursors.down.isDown,
			left: this.cursors.left.isDown,
			right: this.cursors.right.isDown
		};

		// Update player via controller
		this.playerController.update(input);

		// Check pixel-perfect collision after movement
		if (this.collisionMask) {
			// Check collision at player's collision box corners
			const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
			const left = this.player.x + playerBody.offset.x;
			const right = left + playerBody.width;
			const top = this.player.y + playerBody.offset.y;
			const bottom = top + playerBody.height;

			// Check collision at multiple points around player's collision box
			const hasCollision = 
				this.checkPixelCollision(Math.floor(left), Math.floor(top)) ||
				this.checkPixelCollision(Math.floor(right - 1), Math.floor(top)) ||
				this.checkPixelCollision(Math.floor(left), Math.floor(bottom - 1)) ||
				this.checkPixelCollision(Math.floor(right - 1), Math.floor(bottom - 1)) ||
				this.checkPixelCollision(Math.floor(left + playerBody.width/2), Math.floor(top)) ||
				this.checkPixelCollision(Math.floor(left + playerBody.width/2), Math.floor(bottom - 1));

			// If collision detected, revert to old position
			if (hasCollision) {
				this.player.setPosition(oldX, oldY);
			}
		}

		// Debug log when moving (maintain existing debug behavior)
		const playerState = this.playerController.getState();
		if (playerState.currentState === 'walking') {
			const sprite = this.playerController.getSprite();
			console.log(`Moving: ${playerState.lastDirection}, Position: ${sprite.x}, ${sprite.y}`);
		}
	}
}