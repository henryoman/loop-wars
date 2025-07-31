# Loop Wars - Collision Export System

Simple, isolated collision export tools for Aseprite to Phaser integration.

## Quick Start

1. **Create level art in Aseprite** with two layers:
   - `Art` - Your beautiful level artwork
   - `Collision` - Solid color areas marking collision zones

2. **Save your .aseprite file** in `public/assets/aseprite/levels/`

3. **Export collision data:**
   ```bash
   # Export specific level
   bun run export:collision traphouse.aseprite
   
   # Export all levels
   bun run export:collision:all
   ```

4. **Use in your game** - collision JSON files are created in `public/assets/collision/`

## Folder Structure

```
public/assets/
├── aseprite/
│   └── levels/           # Your .aseprite source files
├── collision/            # Generated collision JSON files  
└── images/
    └── levels/           # Your exported PNG level art
```

## How It Works

- **Aseprite Script**: `scripts/aseprite/export-collision.lua`
  - Reads collision layer pixels
  - Converts to 16x16 tile coordinates
  - Outputs JSON matching your game's format

- **Export Tool**: `scripts/export-collision.js`
  - Runs Aseprite with collision script
  - Handles file management
  - Provides helpful feedback

## Integration

Your existing game code doesn't change at all! The exported JSON files use the exact same format as your current `player-home-interior.json`.

```typescript
// This code stays exactly the same
const mapData = this.cache.json.get('homeInteriorMap');
```

## Requirements

- Aseprite installed and accessible via command line
- Bun (already installed)

## Notes

- 16x16 tile size (matches your current system)
- Collision layer can be any solid color
- Transparent areas = no collision
- Safe and isolated - won't affect your game code