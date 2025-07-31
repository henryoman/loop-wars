import { PlayerDirection, PlayerState as State, IPlayerMovementInput, IPlayerController, IPlayerStateData, IMovementResult } from './types/PlayerTypes';
import { PlayerState } from './PlayerState';
import { PlayerAnimator } from './PlayerAnimator';

export class PlayerController implements IPlayerController {
    private sprite: Phaser.Physics.Arcade.Sprite;
    private playerState: PlayerState;
    private animator: PlayerAnimator;
    private readonly speed: number = 80; // pixels per second

    constructor(sprite: Phaser.Physics.Arcade.Sprite) {
        this.sprite = sprite;
        this.playerState = new PlayerState();
        this.animator = new PlayerAnimator();
    }

    public update(input: IPlayerMovementInput): void {
        const movementResult = this.processMovement(input);
        this.updatePlayerState(movementResult);
        this.updateAnimations();
        this.updatePhysics(movementResult);
    }

    public getState(): IPlayerStateData {
        return this.playerState.getStateData();
    }

    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    private processMovement(input: IPlayerMovementInput): IMovementResult {
        let moving = false;
        let direction = this.playerState.getLastDirection(); // Use last direction as default
        let velocityX = 0;
        let velocityY = 0;
        let shouldFlip = this.playerState.shouldFlipSprite();

        // Handle movement input - exact same logic as original
        if (input.left) {
            velocityX = -this.speed;
            shouldFlip = false;
            direction = PlayerDirection.SIDE;
            moving = true;
        } else if (input.right) {
            velocityX = this.speed;
            shouldFlip = true;
            direction = PlayerDirection.SIDE;
            moving = true;
        }

        if (input.up) {
            velocityY = -this.speed;
            direction = PlayerDirection.UP;
            moving = true;
        } else if (input.down) {
            velocityY = this.speed;
            direction = PlayerDirection.DOWN;
            moving = true;
        }

        return {
            direction,
            moving,
            velocityX,
            velocityY,
            shouldFlip
        };
    }

    private updatePlayerState(movementResult: IMovementResult): void {
        // Update direction only when moving (this preserves last direction when idle)
        if (movementResult.moving) {
            this.playerState.updateDirection(movementResult.direction);
            this.playerState.updateFlip(movementResult.shouldFlip);
            this.playerState.updateState(State.WALKING);
        } else {
            this.playerState.updateState(State.IDLE);
        }
    }

    private updateAnimations(): void {
        const currentDirection = this.playerState.getLastDirection();
        const currentState = this.playerState.getCurrentState();
        
        // Update sprite flip
        this.animator.updateSpriteFlip(this.sprite, this.playerState.shouldFlipSprite());
        
        // Play appropriate animation
        if (currentState === State.WALKING) {
            this.animator.playWalkAnimation(currentDirection, this.sprite);
        } else {
            this.animator.playIdleAnimation(currentDirection, this.sprite);
        }
    }

    private updatePhysics(movementResult: IMovementResult): void {
        this.sprite.setVelocity(movementResult.velocityX, movementResult.velocityY);
    }
}