export enum PlayerDirection {
    UP = 'up',
    DOWN = 'down',
    SIDE = 'side'
}

export enum PlayerState {
    IDLE = 'idle',
    WALKING = 'walking'
}

export interface IPlayerMovementInput {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
}

export interface IPlayerStateData {
    lastDirection: PlayerDirection;
    currentState: PlayerState;
    isFlippedX: boolean;
}

export interface IPlayerController {
    update(input: IPlayerMovementInput): void;
    getState(): IPlayerStateData;
    getSprite(): Phaser.Physics.Arcade.Sprite;
}

export interface IMovementResult {
    direction: PlayerDirection;
    moving: boolean;
    velocityX: number;
    velocityY: number;
    shouldFlip: boolean;
}