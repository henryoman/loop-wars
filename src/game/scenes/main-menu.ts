import Phaser from "phaser";
import MoneyText from "../ui/MoneyText";

export default class MainMenu extends Phaser.Scene {

	constructor() {
		super("MainMenu");
	}

    create ()
    {
        // Fade in from black when arriving at the start screen
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(700, 0, 0, 0);
        // startscreen background - centered for 384x288 resolution
        this.add.image(192, 144, "startscreen");

        // Ensure any future UI text uses pixel-perfect scaling if added later
        const uiScale = 1 / this.cameras.main.zoom;

        // Add Enter and Space keys to start the game
        const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        enterKey.on('down', () => {
            console.log('Enter key pressed - starting intro cutscene');
            this.scene.start('IntroCutscene');
        });
        
        spaceKey.on('down', () => {
            console.log('Space key pressed - starting intro cutscene');
            this.scene.start('IntroCutscene');
        });

        // Money UI should not appear on the start screen
    }
}