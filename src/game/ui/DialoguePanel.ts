import Phaser from 'phaser';

/**
 * Simple dialogue/announcement panel that slides from the bottom.
 * Height: 96px (bottom third of 288px game height)
 * Width: fills entire game width.
 */
export default class DialoguePanel {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private text: Phaser.GameObjects.Text;
    private readonly PANEL_HEIGHT = 96;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        // Container positioned off-screen at bottom
        this.container = scene.add.container(0, height);
        this.container.setDepth(1000); // Ensure it's above game elements

        // Black background covering full width
        const background = scene.add.rectangle(0, 0, width, this.PANEL_HEIGHT, 0x000000, 1);
        background.setOrigin(0, 0);

        // Text area with small padding and word wrap
        this.text = scene.add.text(8, 8, '', {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: width - 16 }
        });

        // Add to container
        this.container.add([background, this.text]);
    }

    /**
     * Slide the panel up and display the provided message
     */
    show(message: string): void {
        this.text.setText(message);
        this.scene.tweens.add({
            targets: this.container,
            y: this.scene.cameras.main.height - this.PANEL_HEIGHT,
            duration: 300,
            ease: 'Power2'
        });
    }

    /**
     * Hide the panel by sliding it down
     */
    hide(): void {
        this.scene.tweens.add({
            targets: this.container,
            y: this.scene.cameras.main.height,
            duration: 300,
            ease: 'Power2'
        });
    }
}
