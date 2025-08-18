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

// Cache physical key objects per scene so polling works reliably
const KEY_CACHE: WeakMap<Phaser.Scene, Map<string, Phaser.Input.Keyboard.Key>> = new WeakMap();

function getKey(scene: Phaser.Scene, code: string): Phaser.Input.Keyboard.Key {
    let map = KEY_CACHE.get(scene);
    if (!map) { map = new Map(); KEY_CACHE.set(scene, map); }
    let key = map.get(code);
    if (!key) {
        const keyCode = (Phaser.Input.Keyboard.KeyCodes as any)[code];
        key = scene.input.keyboard!.addKey(keyCode, true, false);
        map.set(code, key);
    }
    return key;
}

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
    const keys = DEFAULT_KEYMAP[action];
    return keys.some(code => getKey(scene, code).isDown);
}

/** Returns true once when an action has just been pressed this frame. */
export function justPressed(scene: Phaser.Scene, action: ActionButton | NavAction): boolean {
    const keys = DEFAULT_KEYMAP[action];
    return keys.some(code => Phaser.Input.Keyboard.JustDown(getKey(scene, code)));
}

// Centralized movement polling used by all scenes (WASD or Arrows)
export type MovementInput = { up: boolean; down: boolean; left: boolean; right: boolean };
export function getMovementInput(scene: Phaser.Scene): MovementInput {
    return {
        up: isActionDown(scene, NavAction.UP),
        down: isActionDown(scene, NavAction.DOWN),
        left: isActionDown(scene, NavAction.LEFT),
        right: isActionDown(scene, NavAction.RIGHT)
    };
}


