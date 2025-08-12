import Phaser from 'phaser';
import { CollisionLoader } from '../utils/CollisionLoader';
import BaseMapScene from './BaseMapScene';

export default class PaccHouse extends BaseMapScene {

        constructor() {
                super("pacc-house");
        }

        private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
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

                super.create(384, 288, 192, 144);

                // Create slice-based collision system
                this.collisionGroup = this.physics.add.staticGroup();
                this.setupSliceCollision();
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
}