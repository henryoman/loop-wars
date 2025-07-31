import { PlayerDirection } from './types/PlayerTypes';

export class PlayerAnimator {
    
    public playIdleAnimation(direction: PlayerDirection, sprite: Phaser.Physics.Arcade.Sprite): void {
        const animationKey = `player-idle-${direction}`;
        sprite.play(animationKey, true);
    }

    public playWalkAnimation(direction: PlayerDirection, sprite: Phaser.Physics.Arcade.Sprite): void {
        const animationKey = `player-walk-${direction}`;
        sprite.play(animationKey, true);
    }

    public updateSpriteFlip(sprite: Phaser.Physics.Arcade.Sprite, shouldFlip: boolean): void {
        sprite.setFlipX(shouldFlip);
    }
}