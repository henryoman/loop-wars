-- Simple collision export script for Aseprite
-- Exports collision layer as tile coordinate data

-- Try to get active sprite, or use the first available sprite
local sprite = app.activeSprite
if not sprite and #app.sprites > 0 then
    sprite = app.sprites[1]
end

if not sprite then
    print("No sprite found")
    return
end

local TILE_SIZE = 16

-- Find collision layer - try multiple approaches
print("Scanning layers:")
local collisionLayer = nil

-- First try: look for collision in name (case insensitive)
for i, layer in ipairs(sprite.layers) do
    print("  Layer " .. i .. ": '" .. layer.name .. "' (visible: " .. tostring(layer.isVisible) .. ")")
    local layerName = string.lower(layer.name)
    if string.find(layerName, "collision") then
        print("  ✓ Found collision layer by name: '" .. layer.name .. "'")
        collisionLayer = layer
        break
    end
end

-- Second try: if no collision layer found by name, find layer with actual collision data
if not collisionLayer and #sprite.layers > 0 then
    for i, layer in ipairs(sprite.layers) do
        local cel = layer:cel(1)
        if cel and cel.image then
            -- Check if this layer has any non-transparent pixels
            local hasPixels = false
            for y = 0, cel.image.height - 1 do
                for x = 0, cel.image.width - 1 do
                    local pixelValue = cel.image:getPixel(x, y)
                    local alpha = app.pixelColor.rgbaA(pixelValue)
                    if alpha > 0 then
                        hasPixels = true
                        break
                    end
                end
                if hasPixels then break end
            end
            
            if hasPixels then
                collisionLayer = layer
                print("  ✓ Found layer with collision data: '" .. layer.name .. "'")
                break
            else
                print("  - Layer '" .. layer.name .. "' has no collision data")
            end
        else
            print("  - Layer '" .. layer.name .. "' has no cel/image")
        end
    end
end

if not collisionLayer then
    print("❌ No usable layer found at all")
    return
end

-- Temporarily show the layer if it's hidden
local wasVisible = collisionLayer.isVisible
if not wasVisible then
    collisionLayer.isVisible = true
end

-- Get the collision cel (assuming frame 1)
local cel = collisionLayer:cel(1)
if not cel then
    print("No collision data found in layer")
    -- Restore original visibility
    collisionLayer.isVisible = wasVisible
    return
end

-- Calculate map dimensions
local mapWidth = math.ceil(sprite.width / TILE_SIZE)
local mapHeight = math.ceil(sprite.height / TILE_SIZE)

-- Extract collision shapes (pixel-perfect)
local collisionShapes = {}
local image = cel.image
local visited = {}

-- Initialize visited array
for y = 0, image.height - 1 do
    visited[y] = {}
    for x = 0, image.width - 1 do
        visited[y][x] = false
    end
end

-- Find connected collision regions
for y = 0, image.height - 1 do
    for x = 0, image.width - 1 do
        if not visited[y][x] then
            local pixelValue = image:getPixel(x, y)
            local alpha = app.pixelColor.rgbaA(pixelValue)
            
            if alpha > 0 then
                -- Found collision pixel, trace the connected region
                local minX, maxX = x, x
                local minY, maxY = y, y
                local pixels = {}
                local queue = {{x, y}}
                
                -- Flood fill to find connected region
                while #queue > 0 do
                    local current = table.remove(queue, 1)
                    local cx, cy = current[1], current[2]
                    
                    if cx >= 0 and cx < image.width and cy >= 0 and cy < image.height and not visited[cy][cx] then
                        local pValue = image:getPixel(cx, cy)
                        local pAlpha = app.pixelColor.rgbaA(pValue)
                        
                        if pAlpha > 0 then
                            visited[cy][cx] = true
                            table.insert(pixels, {cx, cy})
                            
                            -- Update bounds
                            minX = math.min(minX, cx)
                            maxX = math.max(maxX, cx)
                            minY = math.min(minY, cy)
                            maxY = math.max(maxY, cy)
                            
                            -- Add neighbors to queue
                            table.insert(queue, {cx + 1, cy})
                            table.insert(queue, {cx - 1, cy})
                            table.insert(queue, {cx, cy + 1})
                            table.insert(queue, {cx, cy - 1})
                        end
                    end
                end
                
                -- Create collision shape from bounds
                if #pixels > 0 then
                    table.insert(collisionShapes, {
                        id = "0",
                        x = minX,
                        y = minY,
                        width = maxX - minX + 1,
                        height = maxY - minY + 1
                    })
                end
            end
        end
    end
end

-- Create output structure with pixel-perfect shapes
local output = {
    tileSize = 1, -- Now using pixel precision
    mapWidth = sprite.width,
    mapHeight = sprite.height,
    layers = {
        {
            name = "Layer_1",
            shapes = collisionShapes,
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

-- Export collision layer as PNG
local pngPath = "public/assets/collision/" .. baseName .. ".png"
collisionLayer:cel(1).image:saveAs(pngPath)

-- Also create a simple JSON with metadata
local simpleOutput = {
    width = sprite.width,
    height = sprite.height,
    collisionImage = baseName .. ".png"
}

local jsonString = tableToJson(simpleOutput)
local file = io.open(outputPath, "w")
if file then
    file:write(jsonString)
    file:close()
    print("Collision PNG exported to: " .. pngPath)
    print("Collision JSON exported to: " .. outputPath)
    print("Pixel-perfect collision ready!")
else
    print("Error: Could not write to " .. outputPath)
end

-- Restore original layer visibility
collisionLayer.isVisible = wasVisible