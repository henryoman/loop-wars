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

        // ────── Chess assets ──────
        this.load.image('chessBoard', 'assets/images/chess/board.png');
        this.load.spritesheet('chessPieces', 'assets/images/chess/chess-pieces.png', { frameWidth: 32, frameHeight: 32 });

		// ────── Intro cutscene (Aseprite sheet + JSON) ──────
		// Uses Aseprite export at public/assets/images/cutscenes
		this.load.atlas('lacutscene2', 'assets/images/cutscenes/lacutscene2.png', 'assets/images/cutscenes/lacutscene2.json');
		this.load.json('lacutscene2Data', 'assets/images/cutscenes/lacutscene2.json');

		// ────── Splash image ──────
		this.load.image('westsidelabs', 'assets/images/cutscenes/westsidelabs.png');
    }

    async create ()
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

        // Ensure custom webfont is loaded before showing menu/UI to avoid FOUT
        try {
            const fontsAny = (document as any).fonts;
            if (fontsAny && typeof fontsAny.load === 'function') {
                await Promise.all([
                    fontsAny.load("12px 'Area51 Serif'"),
                    fontsAny.load("8px 'Area51 Serif'")
                ]);
                if (typeof fontsAny.ready?.then === 'function') {
                    await fontsAny.ready;
                }
            }
        } catch {}

		// Build animation from the atlas frames with per-frame durations from JSON
		const json = this.cache.json.get('lacutscene2Data');
		if (json && json.frames) {
			const frameKeys = Object.keys(json.frames);
			const frames: Phaser.Types.Animations.AnimationFrame[] = frameKeys.map((key: string) => {
				const f = json.frames[key];
				return { key: 'lacutscene2', frame: key, duration: f.duration ?? 100 } as Phaser.Types.Animations.AnimationFrame;
			});
			this.anims.create({ key: 'intro-lacutscene2', frames, repeat: 0 });
		}

		// Proceed to splash screen first
		this.scene.start('Splash');
    }
}
