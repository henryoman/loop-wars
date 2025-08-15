# Dialogue Box UI Fixes

## Why dialogue boxes acted like world objects
Phaser game objects live in the world by default. When the camera scrolls, objects with the default scroll factor (`1`) move with the world, so dialogue panels behaved like normal sprites instead of overlay UI.

## Required fixes
1. **Detach from the camera** – set `scrollFactor` to `0` on the dialogue container *and* each child so they ignore camera movement.
2. **Render above the world** – give the container and its elements a high depth (e.g. `1000`) so gameplay sprites do not cover the dialogue.
3. **Use camera dimensions** – position UI elements with `scene.cameras.main.width`/`height` rather than world coordinates.
4. **Group UI elements** – create a container for the panel, background and text; animate the container to show or hide the panel.
5. *(Optional)* **Dedicated UI scene** – for large projects, using a separate scene or `camera.ignore` call keeps UI completely independent from the world scene.

## Example
`DialoguePanel` implements these fixes:
- Container fixed to the camera and layered above game objects [`setScrollFactor(0)` and `setDepth(1000)`][1].
- Background and text elements also ignore camera scroll [`setScrollFactor(0)`][1].

[1]: src/game/ui/DialoguePanel.ts
