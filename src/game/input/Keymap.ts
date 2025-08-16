import Phaser from 'phaser';

export enum ActionButton {
    A = 'A',
    B = 'B'
}

export enum NavAction {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    UP = 'UP',
    DOWN = 'DOWN'
}

// Configure default physical key bindings for each abstract action
const DEFAULT_KEYMAP: Record<ActionButton | NavAction, string[]> = {
    [ActionButton.A]: ['Z', 'J', 'ENTER'],
    [ActionButton.B]: ['X', 'K', 'ESC'],
    [NavAction.LEFT]: ['LEFT', 'A'],
    [NavAction.RIGHT]: ['RIGHT', 'D'],
    [NavAction.UP]: ['UP', 'W'],
    [NavAction.DOWN]: ['DOWN', 'S']
};

/** Attach keydown listeners for all physical keys mapped to an abstract action. */
export function onAction(scene: Phaser.Scene, action: ActionButton | NavAction, handler: () => void): void {
    const keyboard = scene.input.keyboard!;
    const keys = DEFAULT_KEYMAP[action];
    keys.forEach(code => keyboard.on(`keydown-${code}`, handler));
}

/** Remove keydown listeners for all physical keys mapped to an abstract action. */
export function offAction(scene: Phaser.Scene, action: ActionButton | NavAction, handler: () => void): void {
    const keyboard = scene.input.keyboard!;
    const keys = DEFAULT_KEYMAP[action];
    keys.forEach(code => keyboard.off(`keydown-${code}`, handler));
}

/** Returns true if any key mapped to the action is currently down. */
export function isActionDown(scene: Phaser.Scene, action: ActionButton | NavAction): boolean {
    const keyboard = scene.input.keyboard!;
    const keys = DEFAULT_KEYMAP[action];
    return keys.some(code => keyboard.checkDown(new Phaser.Input.Keyboard.Key(keyboard, (Phaser.Input.Keyboard.KeyCodes as any)[code]), 0));
}

/** Returns true once when an action has just been pressed this frame. */
export function justPressed(scene: Phaser.Scene, action: ActionButton | NavAction): boolean {
    const keyboard = scene.input.keyboard!;
    const keys = DEFAULT_KEYMAP[action];
    return keys.some(code => {
        const keyObj = keyboard.addKey((Phaser.Input.Keyboard.KeyCodes as any)[code]);
        return Phaser.Input.Keyboard.JustDown(keyObj);
    });
}


