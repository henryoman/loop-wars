#!/usr/bin/env bun

/**
 * Collision Export Script for Loop Wars
 * 
 * This script exports collision data from Aseprite files
 * Completely isolated from game logic - safe to run
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';

const ASEPRITE_LEVELS_PATH = 'public/assets/aseprite/levels';
const COLLISION_OUTPUT_PATH = 'public/assets/collision';
const SCRIPT_PATH = 'scripts/aseprite/export-collision.lua';

// Ensure output directory exists
if (!existsSync(COLLISION_OUTPUT_PATH)) {
    mkdirSync(COLLISION_OUTPUT_PATH, { recursive: true });
    console.log(`✅ Created collision output directory: ${COLLISION_OUTPUT_PATH}`);
}

function exportCollisionFromAseprite(asepriteFile) {
    const fileName = path.basename(asepriteFile, '.aseprite');
    
    try {
        console.log(`🎨 Exporting collision from: ${fileName}.aseprite`);
        
        // Run Aseprite with our collision export script (macOS path)
        const asepriteCommand = '/Applications/Aseprite.app/Contents/MacOS/aseprite';
        // Use array format to avoid shell interpretation issues with $ in filenames
        const args = ['-b', asepriteFile, '--script', SCRIPT_PATH];
        
        const result = spawnSync(asepriteCommand, args, { 
            cwd: process.cwd(),
            encoding: 'utf8'
        });
        
        // Log any output from Aseprite/Lua script
        if (result.stdout && result.stdout.trim()) {
            console.log(`   ${result.stdout.trim()}`);
        }
        if (result.stderr && result.stderr.trim()) {
            console.error(`   stderr: ${result.stderr.trim()}`);
        }
        
        // Check for spawn errors
        if (result.error) {
            console.error(`❌ Error running Aseprite: ${result.error.message}`);
            return false;
        }
        
        // Check if output file was created
        const outputFile = path.join(COLLISION_OUTPUT_PATH, `${fileName}.json`);
        if (existsSync(outputFile)) {
            console.log(`✅ Successfully exported: ${fileName}.json`);
            return true;
        } else {
            console.log(`❌ Export failed for: ${fileName}.aseprite`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error exporting ${fileName}:`, error.message);
        return false;
    }
}

function main() {
    console.log('🚀 Loop Wars Collision Export Tool');
    console.log('=====================================');
    
    // Check if Aseprite is available
    const asepriteCommand = '/Applications/Aseprite.app/Contents/MacOS/aseprite';
    try {
        execSync(`"${asepriteCommand}" --version`, { stdio: 'pipe' });
    } catch (error) {
        console.error('❌ Aseprite not found at expected macOS location');
        console.error('Please ensure Aseprite is installed at /Applications/Aseprite.app/');
        process.exit(1);
    }
    
    // Check if levels directory exists
    if (!existsSync(ASEPRITE_LEVELS_PATH)) {
        console.log(`📁 Creating levels directory: ${ASEPRITE_LEVELS_PATH}`);
        mkdirSync(ASEPRITE_LEVELS_PATH, { recursive: true });
        console.log('ℹ️  Place your .aseprite level files in this directory');
        return;
    }
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('📖 Usage:');
        console.log('  bun run scripts/export-collision.js <filename.aseprite>');
        console.log('  bun run scripts/export-collision.js all');
        console.log('');
        console.log('💡 Examples:');
        console.log('  bun run scripts/export-collision.js traphouse.aseprite');
        console.log('  bun run scripts/export-collision.js all');
        return;
    }
    
    if (args[0] === 'all') {
        // Export all .aseprite files in levels directory        
        console.log(`🔍 Scanning ${ASEPRITE_LEVELS_PATH} for .aseprite files...`);
        
        const files = readdirSync(ASEPRITE_LEVELS_PATH)
            .filter(file => file.endsWith('.aseprite'));
        
        if (files.length === 0) {
            console.log('📂 No .aseprite files found in levels directory');
            return;
        }
        
        console.log(`📋 Found ${files.length} file(s): ${files.join(', ')}`);
        
        let successCount = 0;
        files.forEach(file => {
            const fullPath = path.join(ASEPRITE_LEVELS_PATH, file);
            if (exportCollisionFromAseprite(fullPath)) {
                successCount++;
            }
        });
        
        console.log('');
        console.log(`🎯 Export complete: ${successCount}/${files.length} successful`);
        
    } else {
        // Export specific file
        const fileName = args[0];
        const fullPath = path.join(ASEPRITE_LEVELS_PATH, fileName);
        
        if (!existsSync(fullPath)) {
            console.error(`❌ File not found: ${fullPath}`);
            console.log(`💡 Make sure the file is in: ${ASEPRITE_LEVELS_PATH}`);
            process.exit(1);
        }
        
        if (exportCollisionFromAseprite(fullPath)) {
            console.log('');
            console.log('🎉 Export successful!');
        } else {
            console.log('');
            console.log('💥 Export failed - check error messages above');
            process.exit(1);
        }
    }
}

// Run the main function
main();