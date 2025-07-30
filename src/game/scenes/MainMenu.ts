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

		// background - adjusted for 384x288 resolution
		this.add.image(192, 144, "background");

		// text - adjusted position for smaller screen
		const text = this.add.text(192, 144, "", {});
		text.setOrigin(0.5, 0.5);
		text.text = "LOOP WARS\n\nPress ENTER to Play";
		text.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "24px", "stroke": "#000000", "strokeThickness":4});

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

    create ()
    {
        this.editorCreate();

        // Add Enter key to start the game
        const enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enterKey.on('down', () => {
            this.scene.start('TrapHouse');
        });
    }
    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here