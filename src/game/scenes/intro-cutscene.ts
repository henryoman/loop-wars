import Phaser from 'phaser';

export default class IntroCutscene extends Phaser.Scene {

	constructor() {
		super('IntroCutscene');
	}

	create(): void {
		// Camera starts black and fades in
		this.cameras.main.setBackgroundColor('#000000');
		this.cameras.main.fadeIn(1000, 0, 0, 0);

		// Center of our fixed 384x288 game
		const centerX = this.cameras.main.width / 2;
		const centerY = this.cameras.main.height / 2;

		// Create sprite from the loaded atlas, first frame as placeholder
		const sprite = this.add.sprite(centerX, centerY, 'lacutscene2', 'lacutscene 0.aseprite');
		sprite.setOrigin(0.5, 0.5);

		// Play the prebuilt animation created in the Preloader
		sprite.play('intro-lacutscene2');

		// When the animation completes, fade to black and go to the game world
		sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
			this.cameras.main.fadeOut(500, 0, 0, 0);
			this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
				this.scene.start('chinatown-exterior');
			});
		});
	}
}


