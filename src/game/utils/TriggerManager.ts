import Phaser from 'phaser';

/**
 * Simple tile-based trigger system for scene transitions and interactions
 * Based on 2025 Phaser best practices for performance and simplicity
 */
export class TriggerManager {
    private scene: Phaser.Scene;
    private triggerGroup: Phaser.Physics.Arcade.StaticGroup;
    private triggers: Map<string, Phaser.GameObjects.Rectangle> = new Map();

    // Game dimensions: 384x288 pixels
    // Vertical: 0-17 tiles = 18 tiles total = 288÷18 = 16 pixels per tile
    // Horizontal: 384÷16 = 24 tiles (0-23)
    private readonly TILE_SIZE = 16;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.triggerGroup = scene.physics.add.staticGroup();
    }

    /**
     * Add a scene transition trigger at specific tile coordinates
     * @param tileX - Tile X coordinate (0-based)
     * @param tileY - Tile Y coordinate (0-based) 
     * @param targetScene - Scene key to transition to
     * @param triggerKey - Optional unique key for this trigger
     */
    addSceneTrigger(
        tileX: number, 
        tileY: number, 
        targetScene: string, 
        triggerKey?: string
    ): void {
        const key = triggerKey || `scene_${tileX}_${tileY}`;
        
        // Convert tile coordinates to pixel coordinates (center of tile)
        const pixelX = (tileX * this.TILE_SIZE) + (this.TILE_SIZE / 2);
        const pixelY = (tileY * this.TILE_SIZE) + (this.TILE_SIZE / 2);

        // Create invisible rectangle at tile position
        const trigger = this.scene.add.rectangle(
            pixelX,
            pixelY,
            this.TILE_SIZE,
            this.TILE_SIZE
        );

        // Make invisible (for collision only)
        trigger.setVisible(false);

        // Add physics body as static
        this.scene.physics.add.existing(trigger, true);

        // Store trigger data
        (trigger as any).triggerData = {
            type: 'scene',
            targetScene: targetScene,
            key: key
        };

        // Add to trigger group
        this.triggerGroup.add(trigger);
        this.triggers.set(key, trigger);

        console.log(`✅ Scene trigger added at tile (${tileX}, ${tileY}) -> ${targetScene}`);
    }

    /**
     * Setup collision between player and trigger group
     * @param player - Player sprite with physics body
     */
    setupPlayerTriggers(player: Phaser.Physics.Arcade.Sprite): void {
        // Use overlap instead of collider so player can pass through
        this.scene.physics.add.overlap(player, this.triggerGroup, (player, trigger) => {
            this.handleTriggerActivation(player as Phaser.Physics.Arcade.Sprite, trigger as Phaser.GameObjects.Rectangle);
        });

        console.log('✅ Player trigger system setup complete');
    }

    /**
     * Handle trigger activation
     */
    private handleTriggerActivation(
        player: Phaser.Physics.Arcade.Sprite, 
        trigger: Phaser.GameObjects.Rectangle
    ): void {
        const triggerData = (trigger as any).triggerData;
        
        if (!triggerData) return;

        switch (triggerData.type) {
            case 'scene':
                console.log(`🚪 Scene transition triggered: ${triggerData.targetScene}`);
                // Intercept ChessScene to show confirmation dialogue first, but only in ChinatownExterior
                if (triggerData.targetScene === 'ChessScene' && this.scene.scene.key === 'chinatown-exterior') {
                    const dlg = (this.scene as any).dialogue as import('../ui/DialoguePanel').default | undefined;
                    if (dlg && typeof dlg.confirm === 'function') {
                        // Pause player control while dialogue is active
                        (this.scene as any)._inputPaused = true;
                        dlg.confirm('Play chess?', 'Yes', 'No').then((accept: boolean) => {
                            (this.scene as any)._inputPaused = false;
                            if (accept) this.scene.scene.start('ChessScene');
                        });
                        return;
                    }
                }
                this.scene.scene.start(triggerData.targetScene);
                break;
            
            // Future trigger types can be added here:
            // case 'item': // pickup items
            // case 'npc':  // talk to NPCs
            // case 'door': // locked doors
            default:
                console.log(`Unknown trigger type: ${triggerData.type}`);
        }
    }

    /**
     * Optional: Enable debug visualization of trigger areas
     * @param color - Debug color (default: green)
     * @param alpha - Debug alpha (default: 0.3)
     */
    enableDebugVisualization(color: number = 0x00ff00, alpha: number = 0.3): void {
        this.triggers.forEach(trigger => {
            trigger.setVisible(true);
            trigger.setFillStyle(color, alpha);
            trigger.setStrokeStyle(2, color, 1);
        });
        console.log('🔧 Debug visualization enabled for triggers');
    }

    /**
     * Remove a specific trigger
     * @param key - Trigger key to remove
     */
    removeTrigger(key: string): void {
        const trigger = this.triggers.get(key);
        if (trigger) {
            this.triggerGroup.remove(trigger);
            trigger.destroy();
            this.triggers.delete(key);
            console.log(`🗑️ Trigger removed: ${key}`);
        }
    }

    /**
     * Get tile size for external calculations
     */
    getTileSize(): number {
        return this.TILE_SIZE;
    }
}