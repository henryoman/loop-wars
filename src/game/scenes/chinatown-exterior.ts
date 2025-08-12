import Phaser from 'phaser';
import { CollisionLoader } from '../utils/CollisionLoader';
import { TriggerManager } from '../utils/TriggerManager';
import BaseMapScene from './BaseMapScene';

export default class ChinatownExterior extends BaseMapScene {

        constructor() {
                super("chinatown-exterior");
        }

        private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
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

                super.create(720, 480, 40, 25);
                this.cameras.main.setLerp(1, 1);

                // Create slice-based collision system
                this.collisionGroup = this.physics.add.staticGroup();
                this.setupSliceCollision();

                // Initialize trigger system
                this.triggerManager = new TriggerManager(this);
                this.setupTriggers();
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
}