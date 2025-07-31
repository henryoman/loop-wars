import Phaser from "phaser";

export default class MainMenu extends Phaser.Scene {

	constructor() {
		super("MainMenu");
	}

    create ()
    {
        // startscreen background - centered for 384x288 resolution
        this.add.image(192, 144, "startscreen");

        // Add Enter and Space keys to start the game
        const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        enterKey.on('down', () => {
            console.log('Enter key pressed - starting TrapHouse scene');
            this.scene.start('TrapHouse');
        });
        
        spaceKey.on('down', () => {
            console.log('Space key pressed - starting TrapHouse scene');
            this.scene.start('TrapHouse');
        });
    }
}