# Asset Organization Review

This document summarizes recommendations for cleaning and organizing assets in the project.

## Boot Background
- `boot-asset-pack.json` references `assets/images/bg.png`, which doesn't exist.
- Replace the reference with an existing background, such as `assets/images/screens/startscreen.png`.

## Missing TrapHouse Assets
- `preload-asset-pack.json` expects `assets/images/levels/traphouse/traphousebig.png` but the file is missing.
- Either provide this PNG or remove the entry and related scene until assets exist.

## Unused Tilemap JSON
- `Preloader.ts` loads `assets/tilemaps/player-home-interior.json`, which isn't present.
- Remove the load call or supply the JSON if still needed.

## Source Files in Public Bundle
- `.aseprite` sources and palette PNGs reside in `public/assets/images`.
- Move development-only files to a separate directory (e.g., `public/assets/aseprite`) so they aren't served to players.

## Duplicate and Temporary Files
- Remove unused files such as `loop-player.png`, `main-player.png`, and `apartment2-interior copy.json`.
- Clean out placeholders like `public/publicroot` and drafts like `player-draft*.aseprite`.

## Collision Data Placement
- Collision JSON files are stored with level images.
- Consider moving them to `public/assets/collision/` or `public/assets/tilemaps/` and update load paths accordingly.

These changes keep the public bundle lean and ensure scenes load only the assets they need.
