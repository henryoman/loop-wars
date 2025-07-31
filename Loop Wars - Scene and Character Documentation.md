# Loop Wars - Scene and Character Documentation

## Game Overview
Loop Wars is a pixel art game with a 384x288 resolution that renders at 3x zoom (1152x864 on screen) for crisp pixel perfect scaling.

## Technical Specifications

### Resolution & Scaling
- **Native Resolution**: 384x288 pixels
- **Display Scale**: 3x zoom (fixed integer scaling)
- **Pixel Perfect**: All sprites and movement snap to pixel grid
- **No Sub-pixel Rendering**: Everything positioned on integer coordinates

### Art Style
- **Pixel Art**: Crisp, retro-style graphics
- **Tile Size**: 16x16 pixel tiles recommended for future tilemap implementation
- **Current Assets**: Single room-sized background images (384x288)

## Character System

### Player Sprite
- **File**: `loop-player.png`
- **Sprite Sheet**: 3x3 grid layout (9 frames total)
- **Frame Size**: 32x32 pixels per frame
- **Animation Structure**:
  - **Row 1 (Frames 0-2)**: Downward movement
  - **Row 2 (Frames 3-5)**: Side movement (mirrored for left/right)
  - **Row 3 (Frames 6-8)**: Upward movement

### Animation System
Each row contains 3 frames:
- **Frame 1**: Walk cycle frame 1
- **Frame 2**: Idle stance (center frame)
- **Frame 3**: Walk cycle frame 2

**Animation Types**:
- `player-idle-down`: Frame 1 (static)
- `player-walk-down`: Frames 0, 2 (8 FPS loop)
- `player-idle-side`: Frame 4 (static)
- `player-walk-side`: Frames 3, 5 (8 FPS loop)
- `player-idle-up`: Frame 7 (static)
- `player-walk-up`: Frames 6, 8 (8 FPS loop)

### Movement System
- **Speed**: 80 pixels per second
- **Controls**: Arrow keys or WASD
- **Direction Handling**: 
  - Left/Right: Uses side animations with sprite flipping
  - Up/Down: Uses dedicated up/down animations
- **Idle Behavior**: Maintains last movement direction for idle animation

### Physics Body (for collision systems)
- **Collision Box**: 32x16 pixels (bottom half of sprite)
- **Offset**: (0, 16) - positioned at bottom half of 32x32 sprite
- **Purpose**: Allows top half of sprite to overlap objects for depth effect

## Scene System

### Current Scene: TrapHouse
- **Background**: `traphousebig.png` (384x288 pixels)
- **Scene Type**: Single room, no camera movement
- **Player Start Position**: Center of room (192, 144)
- **Boundaries**: Player contained within screen bounds

### Scene Architecture
- **Room-based Design**: Each room is a separate scene
- **Scene Transitions**: Player moves between rooms via scene changes
- **Asset Loading**: Backgrounds loaded as static images
- **Room Size**: Fixed to screen resolution (384x288)

## Current Asset Files

### Images
- `loop-player.png` - Player character sprite sheet (3x3 grid)
- `traphousebig.png` - First room background (384x288)
- `bg.png` - Generic background (legacy)
- `logo.png` - Game logo

### Scene Files
- `TrapHouse.ts` - Main room scene with player movement
- `MainMenu.ts` - Start screen (press Enter to play)
- `Preloader.ts` - Asset loading and animation setup
- `Boot.ts` - Initial boot sequence

## Game Flow
1. **Boot** → **Preloader** (loads assets, creates animations)
2. **MainMenu** → Press ENTER → **TrapHouse** (main gameplay)
3. **TrapHouse**: Player can move around room with WASD/arrows

## Future Expansion Plans
- **Multiple Rooms**: Additional scene files for different areas
- **Tilemap System**: Replace large background images with efficient tilesets
- **Collision System**: Add invisible collision rectangles for walls/objects
- **Room Transitions**: Door/exit triggers to move between scenes
- **Object Interaction**: NPCs, items, furniture interaction system

## Implementation Notes
- **Engine**: Currently built in Phaser 3 with TypeScript
- **Physics**: Arcade Physics system for movement and collisions
- **Scaling**: Uses integer zoom for pixel perfect rendering
- **Asset Format**: PNG files, sprite sheets for animations
- **Code Structure**: Scene-based architecture with separate files per room

## Godot Migration Considerations
- Sprite sheet animations should translate directly
- Physics body setup (32x16 collision box at bottom of sprite)
- Room-based scene system maps well to Godot scenes
- Pixel perfect scaling settings crucial for art style
- 3x zoom display scaling for readability