import Phaser from 'phaser';
import { CollisionLoader } from '../utils/CollisionLoader';
import { TriggerManager } from '../utils/TriggerManager';

export interface TriggerConfig {
    tileX: number;
    tileY: number;
    targetScene: string;
    key?: string;
}

export interface MapSceneConfig {
    collision?: {
        key: string;
        path: string;
        debug?: boolean;
    };
    triggers?: {
        entries: TriggerConfig[];
        debug?: boolean;
    };
}

export default class BaseMapScene extends Phaser.Scene {
    protected player!: Phaser.Physics.Arcade.Sprite;

    private collisionLoader?: CollisionLoader;
    private triggerManager?: TriggerManager;
    private collisionGroup?: Phaser.Physics.Arcade.StaticGroup;
    private collisionRects: Phaser.GameObjects.Rectangle[] = [];

    preload(config?: MapSceneConfig): void {
        if (config?.collision) {
            this.collisionLoader = new CollisionLoader(this);
            this.loadCollision(config.collision);
        }
    }

    create(config?: MapSceneConfig): void {
        if (config?.collision) {
            this.loadCollision(config.collision);
        }
        if (config?.triggers) {
            this.loadTriggers(config.triggers.entries, config.triggers.debug);
        }
    }

    protected loadCollision(config: { key: string; path: string; debug?: boolean }): void {
        if (!this.collisionLoader) {
            this.collisionLoader = new CollisionLoader(this);
        }

        const data = this.cache.json.get(config.key);
        if (!data) {
            this.collisionLoader.loadSliceCollision(config.key, config.path);
            this.load.on('loaderror', (file: any) => {
                if (file.key === config.key) {
                    console.warn(`Collision data not found for key ${config.key} - no collision will be active`);
                }
            });
            return;
        }

        this.collisionGroup = this.physics.add.staticGroup();
        this.collisionRects = this.collisionLoader.createSliceCollision(config.key, this.collisionGroup);
        if (this.player) {
            this.collisionLoader.setupPlayerCollision(this.player, this.collisionGroup);
        }
        if (config.debug) {
            this.collisionLoader.enableDebugVisualization(this.collisionRects);
        }
    }

    protected loadTriggers(entries: TriggerConfig[], debug?: boolean): void {
        this.triggerManager = new TriggerManager(this);
        entries.forEach(t => this.triggerManager!.addSceneTrigger(t.tileX, t.tileY, t.targetScene, t.key));
        if (this.player) {
            this.triggerManager.setupPlayerTriggers(this.player);
        }
        if (debug) {
            this.triggerManager.enableDebugVisualization();
        }
    }
}
