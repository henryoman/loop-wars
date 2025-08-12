import Phaser from 'phaser';
import BaseMapScene from './BaseMapScene';

export default class StudioInterior extends BaseMapScene {

        constructor() {
                super("studio-interior");
        }

        private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
        private collisionMask?: Phaser.GameObjects.Image;

	preload() {
		// Load the collision PNG for pixel-perfect collision
		this.load.image('studioInteriorCollision', 'assets/images/levels/studio-interior-collision.png');
	}

        create() {
                // Background image
                this.add.image(192, 144, "studio-interior");

                super.create(384, 288, 192, 144);

                // Create collision group for walls and obstacles
                this.collisionGroup = this.physics.add.staticGroup();

                // Set up pixel-perfect collision system
                this.setupPixelPerfectCollision();

        }

	private setupPixelPerfectCollision() {
		// Load the collision mask image (invisible)
		this.collisionMask = this.add.image(0, 0, 'studioInteriorCollision');
		this.collisionMask.setOrigin(0, 0);
		this.collisionMask.setVisible(false);
		
		console.log('Pixel-perfect collision system enabled for StudioInterior');
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

        protected handlePlayerUpdate(): void {
                const oldX = this.player.x;
                const oldY = this.player.y;

                super.handlePlayerUpdate();

                if (this.collisionMask) {
                        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
                        const left = this.player.x + playerBody.offset.x;
                        const right = left + playerBody.width;
                        const top = this.player.y + playerBody.offset.y;
                        const bottom = top + playerBody.height;

                        const hasCollision =
                                this.checkPixelCollision(Math.floor(left), Math.floor(top)) ||
                                this.checkPixelCollision(Math.floor(right - 1), Math.floor(top)) ||
                                this.checkPixelCollision(Math.floor(left), Math.floor(bottom - 1)) ||
                                this.checkPixelCollision(Math.floor(right - 1), Math.floor(bottom - 1)) ||
                                this.checkPixelCollision(Math.floor(left + playerBody.width/2), Math.floor(top)) ||
                                this.checkPixelCollision(Math.floor(left + playerBody.width/2), Math.floor(bottom - 1));

                        if (hasCollision) {
                                this.player.setPosition(oldX, oldY);
                        }
                }
        }
}