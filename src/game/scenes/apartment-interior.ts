import Phaser from 'phaser';
import { CollisionLoader } from '../utils/CollisionLoader';
import { TriggerManager } from '../utils/TriggerManager';
import BaseMapScene from './BaseMapScene';

export default class ApartmentInterior extends BaseMapScene {

        constructor() {
                super("apartment-interior");
        }

        private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
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

                super.create(384, 288, 192, 144);

                // Create slice-based collision system
                this.collisionGroup = this.physics.add.staticGroup();
                this.setupSliceCollision();

                // Initialize trigger system
                this.triggerManager = new TriggerManager(this);
                this.setupTriggers();
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
}