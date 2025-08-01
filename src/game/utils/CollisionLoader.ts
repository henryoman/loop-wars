import Phaser from 'phaser';

/**
 * Interface for Aseprite slice data structure
 */
interface AsepriteMeta {
    app: string;
    version: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
    frameTags: any[];
    layers: Array<{ name: string; opacity: number; blendMode: string }>;
    slices: Array<{
        name: string;
        color: string;
        keys: Array<{
            frame: number;
            bounds: { x: number; y: number; w: number; h: number };
        }>;
    }>;
}

interface AsepriteSliceData {
    frames: any[];
    meta: AsepriteMeta;
}

/**
 * Utility class for loading and setting up slice-based collision from Aseprite JSON exports
 * Based on 2025 Phaser best practices for performance and maintainability
 */
export class CollisionLoader {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Load slice collision data from JSON file
     * @param key - Cache key for the JSON data
     * @param path - Path to the JSON file
     */
    loadSliceCollision(key: string, path: string): void {
        this.scene.load.json(key, path);
    }

    /**
     * Create static collision bodies from Aseprite slice data
     * @param dataKey - Cache key for the loaded JSON data
     * @param collisionGroup - Phaser static group to add collision bodies to
     * @returns Array of created collision rectangles for debugging/reference
     */
    createSliceCollision(
        dataKey: string, 
        collisionGroup: Phaser.Physics.Arcade.StaticGroup
    ): Phaser.GameObjects.Rectangle[] {
        // Get the slice data from cache
        const sliceData = this.scene.cache.json.get(dataKey) as AsepriteSliceData;
        
        if (!sliceData || !sliceData.meta || !sliceData.meta.slices) {
            console.warn(`No slice data found for key: ${dataKey}`);
            return [];
        }

        const rectangles: Phaser.GameObjects.Rectangle[] = [];

        // Create collision rectangles from slice bounds
        sliceData.meta.slices.forEach((slice, index) => {
            if (slice.keys && slice.keys.length > 0) {
                const bounds = slice.keys[0].bounds;
                
                // Create invisible rectangle at slice position
                // Phaser rectangles are positioned by their center by default
                const rect = this.scene.add.rectangle(
                    bounds.x + bounds.w / 2,  // Center X
                    bounds.y + bounds.h / 2,  // Center Y
                    bounds.w,                 // Width
                    bounds.h                  // Height
                );
                
                // Make invisible (for collision only)
                rect.setVisible(false);
                
                // Add physics body as static (immovable)
                this.scene.physics.add.existing(rect, true);
                
                // Add to collision group
                collisionGroup.add(rect);
                
                rectangles.push(rect);
                
                console.log(`Created collision slice: ${slice.name} at (${bounds.x}, ${bounds.y}) size ${bounds.w}x${bounds.h}`);
            }
        });

        console.log(`✅ Created ${rectangles.length} collision bodies from slice data`);
        return rectangles;
    }

    /**
     * Setup collision between player and slice-based collision group
     * @param player - Player sprite with physics body
     * @param collisionGroup - Static group containing collision rectangles
     */
    setupPlayerCollision(
        player: Phaser.Physics.Arcade.Sprite, 
        collisionGroup: Phaser.Physics.Arcade.StaticGroup
    ): void {
        this.scene.physics.add.collider(player, collisionGroup);
        console.log('✅ Player collision setup with slice-based collision system');
    }

    /**
     * Optional: Enable debug visualization of collision rectangles
     * @param rectangles - Array of collision rectangles to visualize
     * @param color - Debug color (default: red)
     * @param alpha - Debug alpha (default: 0.3)
     */
    enableDebugVisualization(
        rectangles: Phaser.GameObjects.Rectangle[], 
        color: number = 0xff0000, 
        alpha: number = 0.3
    ): void {
        rectangles.forEach(rect => {
            rect.setVisible(true);
            rect.setFillStyle(color, alpha);
            rect.setStrokeStyle(2, color, 1);
        });
        console.log('🔧 Debug visualization enabled for collision rectangles');
    }
}