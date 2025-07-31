// You can write more code here

/* START OF COMPILED CODE */

import Phaser from "phaser";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class MainMenu extends Phaser.Scene {

	constructor() {
		super("MainMenu");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// startscreen background - centered for 384x288 resolution
		this.add.image(192, 144, "startscreen");

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

    create ()
    {
        this.editorCreate();

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
    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here