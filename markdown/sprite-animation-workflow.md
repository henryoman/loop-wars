# Sprite Animation Workflow

This guide outlines how to export and integrate animated sprites and map backgrounds.

## Exporting Animated Sprites in Aseprite
1. **Tag frames** for each action or direction (e.g., `idle-down`, `walk-left`).
2. **File → Export Sprite Sheet…**
   - Choose "By Tag" or "All Frames".
   - Set frame dimensions (e.g., 32×32).
   - Export to `public/assets/images/sprites/<name>.png` and save JSON metadata if needed.
3. **Add to Asset Pack**
   - Register the sheet in `public/assets/preload-asset-pack.json` with type `spritesheet` and the correct `frameWidth` and `frameHeight`.
4. **Define Animations in Phaser**
   ```ts
   this.anims.create({
     key: 'walk-down',
     frames: this.anims.generateFrameNumbers('player', { start: 0, end: n }),
     frameRate: 8,
     repeat: -1,
   });
   ```
5. **Use in Scenes**
   - `this.physics.add.sprite(x, y, 'player').play('walk-down');`

## Exporting Map Backgrounds
1. **Static PNG**
   - Export the full map image to `public/assets/images/levels/<map>.png`.
2. **Collision Data (Optional)**
   - Run the `scripts/export-collision.lua` script to produce a JSON file of slice collisions.
   - Place the JSON in `public/assets/tilemaps/` and load it with `this.load.json()` during preload.

Animated tiles like water should be exported as separate sprite sheets and layered over the static map in Phaser.
