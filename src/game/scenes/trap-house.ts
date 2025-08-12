import Phaser from 'phaser';
import BaseMapScene from './BaseMapScene';

export default class TrapHouse extends BaseMapScene {

        constructor() {
                super("TrapHouse");
        }

        private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;

        create() {
                // Background image
                this.add.image(192, 144, "traphouse");

                super.create(384, 288, 192, 144);

                // Create collision group for walls and obstacles
                this.collisionGroup = this.physics.add.staticGroup();

                // Load tilemap data and create collision rectangles
                this.createCollisionFromTilemap();

                // Set up collision between player and collision group
                this.physics.add.collider(this.player, this.collisionGroup);

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

}