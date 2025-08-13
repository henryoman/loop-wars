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
    private optionTexts: Phaser.GameObjects.Text[] = [];
    private resolveSelection?: (accepted: boolean) => void;
    private readonly PANEL_HEIGHT = 96;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        // Container positioned off-screen at bottom
        this.container = scene.add.container(0, height);
        this.container.setDepth(1000); // Ensure it's above game elements
        this.container.setScrollFactor(0);

        // Black background covering full width
        const background = scene.add.rectangle(0, 0, width, this.PANEL_HEIGHT, 0x000000, 1);
        background.setOrigin(0, 0);
        background.setScrollFactor(0);

        // Text area with small padding and word wrap
        this.text = scene.add.text(8, 8, '', {
            fontSize: '12px',
            color: '#ffffff',
            wordWrap: { width: width - 16 }
        });
        this.text.setScrollFactor(0);

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

    /** Show a confirm with Yes/No, returns a Promise<boolean> */
    confirm(message: string, yesLabel = 'Yes', noLabel = 'No'): Promise<boolean> {
        this.clearOptions();
        this.show(message);

        const { width } = this.scene.cameras.main;
        const baseY = this.scene.cameras.main.height - this.PANEL_HEIGHT + 56;

        const yes = this.scene.add.text(width - 96, baseY, yesLabel, { fontSize: '12px', color: '#00ffcc' }).setOrigin(0, 0);
        const no  = this.scene.add.text(width - 48, baseY, noLabel, { fontSize: '12px', color: '#ff6666' }).setOrigin(0, 0);
        yes.setScrollFactor(0);
        no.setScrollFactor(0);
        this.optionTexts.push(yes, no);
        this.container.add([yes, no]);

        return new Promise<boolean>((resolve) => {
            this.resolveSelection = resolve;

            const k = this.scene.input.keyboard!;
            const acceptKeys = [k.addKey('J'), k.addKey('Z'), k.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)];
            const cancelKeys = [k.addKey('K'), k.addKey('X'), k.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)];

            const onDown = (e: KeyboardEvent) => {
                if (acceptKeys.some(key => Phaser.Input.Keyboard.JustDown(key))) done(true);
                if (cancelKeys.some(key => Phaser.Input.Keyboard.JustDown(key))) done(false);
            };

            const done = (accepted: boolean) => {
                acceptKeys.forEach(key => key.destroy());
                cancelKeys.forEach(key => key.destroy());
                this.clearOptions();
                this.hide();
                resolve(accepted);
                this.resolveSelection = undefined;
                this.scene.input.keyboard!.off('keydown', onDown);
            };

            this.scene.input.keyboard!.on('keydown', onDown);
        });
    }

    private clearOptions(): void {
        this.optionTexts.forEach(t => t.destroy());
        this.optionTexts.length = 0;
    }
}
