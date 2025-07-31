import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {

	constructor() {
		super("Preloader");
	}

    init ()
    {
        // Background image
        this.add.image(512, 384, "background");

        // Progress bar background
        const progressBar = this.add.rectangle(512, 384, 468, 32);
        progressBar.isFilled = true;
        progressBar.fillColor = 14737632;
        progressBar.isStroked = true;

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(progressBar.x - progressBar.width / 2 + 4, progressBar.y, 4, 28, 0xffffff)

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        // Use the 'pack' file to load in any assets you need for this scene
        this.load.pack('preload', 'assets/preload-asset-pack.json');
        
        // Player spritesheet is loaded via the asset pack as 'loop-player'
        
        // Load the tilemap JSON for collision data
        this.load.json('homeInteriorMap', 'assets/tilemaps/player-home-interior.json');
        
        // Load the start screen background
        this.load.image('startscreen', 'assets/images/screens/startscreen.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        // Create player animations based on 3x3 sprite sheet
        this.anims.create({
            key: 'player-idle-down',
            frames: [{ key: 'loop-player', frame: 1 }],
            frameRate: 1
        });
        
        this.anims.create({
            key: 'player-walk-down',
            frames: [{ key: 'loop-player', frame: 0 }, { key: 'loop-player', frame: 1 }, { key: 'loop-player', frame: 2 }, { key: 'loop-player', frame: 1 }],
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-idle-side',
            frames: [{ key: 'loop-player', frame: 4 }],
            frameRate: 1
        });
        
        this.anims.create({
            key: 'player-walk-side',
            frames: [{ key: 'loop-player', frame: 3 }, { key: 'loop-player', frame: 4 }, { key: 'loop-player', frame: 5 }, { key: 'loop-player', frame: 4 }],
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-idle-up',
            frames: [{ key: 'loop-player', frame: 7 }],
            frameRate: 1
        });
        
        this.anims.create({
            key: 'player-walk-up',
            frames: [{ key: 'loop-player', frame: 6 }, { key: 'loop-player', frame: 7 }, { key: 'loop-player', frame: 8 }, { key: 'loop-player', frame: 7 }],
            frameRate: 8,
            repeat: -1
        });

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
