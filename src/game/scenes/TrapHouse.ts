
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class TrapHouse extends Phaser.Scene {

	constructor() {
		super("TrapHouse");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// background
		this.add.image(192, 144, "traphouse");

		// collider
		this.physics.add.collider();

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here
	private player!: Phaser.Physics.Arcade.Sprite;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private wasd!: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };

	create() {

		this.editorCreate();

		// Create the player physics sprite at center of screen
		this.player = this.physics.add.sprite(192, 144, 'player');
		this.player.play('player-idle-down');

		// Set up player physics body - bottom half of sprite (32x16)
		this.player.setSize(32, 16); // Collision box size
		this.player.setOffset(0, 16); // Offset to bottom half of 32x32 sprite
		this.player.setCollideWorldBounds(true);

		// Set up input
		this.cursors = this.input.keyboard!.createCursorKeys();
		this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };

		// Set world bounds for physics and camera
		this.physics.world.setBounds(0, 0, 384, 288);
		this.cameras.main.setBounds(0, 0, 384, 288);
		this.cameras.main.startFollow(this.player);
		this.cameras.main.setLerp(0.1, 0.1);

	}

	update() {
		const speed = 80; // pixels per second
		let moving = false;
		let direction = 'down';
		let velocityX = 0;
		let velocityY = 0;

		// Handle movement input
		if (this.cursors.left.isDown || this.wasd.A.isDown) {
			velocityX = -speed;
			this.player.setFlipX(false);
			direction = 'side';
			moving = true;
		} else if (this.cursors.right.isDown || this.wasd.D.isDown) {
			velocityX = speed;
			this.player.setFlipX(true);
			direction = 'side';
			moving = true;
		}

		if (this.cursors.up.isDown || this.wasd.W.isDown) {
			velocityY = -speed;
			direction = 'up';
			moving = true;
		} else if (this.cursors.down.isDown || this.wasd.S.isDown) {
			velocityY = speed;
			direction = 'down';
			moving = true;
		}

		// Set velocity for physics movement
		this.player.setVelocity(velocityX, velocityY);

		// Play appropriate animation
		if (moving) {
			this.player.play(`player-walk-${direction}`, true);
		} else {
			this.player.play(`player-idle-${direction}`, true);
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here