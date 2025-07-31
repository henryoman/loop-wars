-- Simple collision export script for Aseprite
-- Exports collision layer as tile coordinate data

local sprite = app.activeSprite
if not sprite then
    print("No active sprite")
    return
end

local TILE_SIZE = 16

-- Find collision layer (case insensitive)
local collisionLayer = nil
for i, layer in ipairs(sprite.layers) do
    local layerName = string.lower(layer.name)
    if string.find(layerName, "collision") then
        collisionLayer = layer
        break
    end
end

if not collisionLayer then
    print("No collision layer found. Please name a layer 'Collision' or similar.")
    return
end

-- Get the collision cel (assuming frame 1)
local cel = collisionLayer:cel(1)
if not cel then
    print("No collision data found in layer")
    return
end

-- Calculate map dimensions
local mapWidth = math.ceil(sprite.width / TILE_SIZE)
local mapHeight = math.ceil(sprite.height / TILE_SIZE)

-- Extract collision tiles
local collisionTiles = {}
local image = cel.image

-- Check each tile for collision pixels
for tileY = 0, mapHeight - 1 do
    for tileX = 0, mapWidth - 1 do
        local hasCollision = false
        
        -- Check pixels in this tile
        for pixelY = 0, TILE_SIZE - 1 do
            for pixelX = 0, TILE_SIZE - 1 do
                local worldX = tileX * TILE_SIZE + pixelX
                local worldY = tileY * TILE_SIZE + pixelY
                
                -- Check if pixel exists and is not transparent
                if worldX < image.width and worldY < image.height then
                    local pixelValue = image:getPixel(worldX, worldY)
                    local alpha = app.pixelColor.rgbaA(pixelValue)
                    
                    if alpha > 0 then
                        hasCollision = true
                        break
                    end
                end
            end
            if hasCollision then break end
        end
        
        -- Add tile if collision found
        if hasCollision then
            table.insert(collisionTiles, {
                id = "0",
                x = tileX,
                y = tileY
            })
        end
    end
end

-- Create output structure matching your current format
local output = {
    tileSize = TILE_SIZE,
    mapWidth = mapWidth,
    mapHeight = mapHeight,
    layers = {
        {
            name = "Layer_1",
            tiles = collisionTiles,
            collider = true
        }
    }
}

-- Create output filename
local baseName = sprite.filename
if baseName then
    baseName = string.gsub(baseName, "%.aseprite$", "")
    baseName = string.gsub(baseName, ".*[/\\]", "") -- Remove path
else
    baseName = "collision"
end

-- Output path
local outputPath = "public/assets/collision/" .. baseName .. ".json"

-- Convert to JSON manually (simple approach)
local function tableToJson(t, indent)
    indent = indent or 0
    local spaces = string.rep("  ", indent)
    
    if type(t) ~= "table" then
        if type(t) == "string" then
            return '"' .. t .. '"'
        else
            return tostring(t)
        end
    end
    
    local isArray = true
    local maxIndex = 0
    for k, v in pairs(t) do
        if type(k) ~= "number" then
            isArray = false
            break
        end
        maxIndex = math.max(maxIndex, k)
    end
    
    if isArray then
        local result = "[\n"
        for i = 1, maxIndex do
            result = result .. string.rep("  ", indent + 1)
            if t[i] then
                result = result .. tableToJson(t[i], indent + 1)
            else
                result = result .. "null"
            end
            if i < maxIndex then
                result = result .. ","
            end
            result = result .. "\n"
        end
        result = result .. spaces .. "]"
        return result
    else
        local result = "{\n"
        local keys = {}
        for k in pairs(t) do
            table.insert(keys, k)
        end
        table.sort(keys)
        
        for i, k in ipairs(keys) do
            result = result .. string.rep("  ", indent + 1) .. '"' .. k .. '": '
            result = result .. tableToJson(t[k], indent + 1)
            if i < #keys then
                result = result .. ","
            end
            result = result .. "\n"
        end
        result = result .. spaces .. "}"
        return result
    end
end

-- Write JSON to file
local jsonString = tableToJson(output)
local file = io.open(outputPath, "w")
if file then
    file:write(jsonString)
    file:close()
    print("Collision data exported to: " .. outputPath)
    print("Found " .. #collisionTiles .. " collision tiles")
else
    print("Error: Could not write to " .. outputPath)
end