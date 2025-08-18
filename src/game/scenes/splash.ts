import Phaser from 'phaser';

export default class Splash extends Phaser.Scene {

	constructor() {
		super('Splash');
	}

	create(): void {
		const cam = this.cameras.main;
		cam.setBackgroundColor('#000000');
		
		// Create and scale the logo to fit while preserving aspect
		const centerX = cam.width / 2;
		const centerY = cam.height / 2;
		const logo = this.add.image(centerX, centerY, 'westsidelabs');
		logo.setOrigin(0.5, 0.5);

		const src = this.textures.get('westsidelabs').getSourceImage() as HTMLImageElement;
		if (src && src.width && src.height) {
			const scale = Math.min(cam.width / src.width, cam.height / src.height);
			logo.setScale(scale);
		} else {
			logo.setDisplaySize(cam.width, cam.height);
		}

		// Fade in → hold → fade out → MainMenu
		cam.fadeIn(800, 0, 0, 0);
		this.time.delayedCall(1800, () => {
			cam.fadeOut(600, 0, 0, 0);
			cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
				this.scene.start('MainMenu');
			});
		});
	}
}

 