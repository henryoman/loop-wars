import { PlayerDirection, PlayerState as State, IPlayerStateData } from './types/PlayerTypes';

export class PlayerState {
    private lastDirection: PlayerDirection = PlayerDirection.DOWN;
    private currentState: State = State.IDLE;
    private isFlippedX: boolean = false;

    public updateDirection(direction: PlayerDirection): void {
        this.lastDirection = direction;
    }

    public updateState(state: State): void {
        this.currentState = state;
    }

    public updateFlip(isFlipped: boolean): void {
        this.isFlippedX = isFlipped;
    }

    public getLastDirection(): PlayerDirection {
        return this.lastDirection;
    }

    public getCurrentState(): State {
        return this.currentState;
    }

    public shouldFlipSprite(): boolean {
        return this.isFlippedX;
    }

    public getStateData(): IPlayerStateData {
        return {
            lastDirection: this.lastDirection,
            currentState: this.currentState,
            isFlippedX: this.isFlippedX
        };
    }
}