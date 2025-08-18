import Phaser from 'phaser';
import { ActionButton, NavAction, onAction, offAction } from '../input/Keymap';

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
    private active = false;
    private readonly PANEL_HEIGHT = 96;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        // Container positioned off-screen at bottom
        this.container = scene.add.container(0, height);
        this.container.setDepth(10000); // Ensure it's above game elements
        this.container.setScrollFactor(0);

        // Black background covering full width
        const background = scene.add.rectangle(0, 0, width, this.PANEL_HEIGHT, 0x000000, 1);
        background.setOrigin(0, 0);
        background.setScrollFactor(0);
        background.setDepth(10001);

        // Text area with small padding and word wrap
        this.text = scene.add.text(8, 8, '', {
            fontFamily: 'Area51 Pixel',
            fontSize: '12px',
            color: '#ffffff',
            wordWrap: { width: width - 16 }
        });
        this.text.setScrollFactor(0);
        this.text.setScale(1 / scene.cameras.main.zoom);
        this.text.setResolution((window as any).devicePixelRatio || 1);
        this.text.setDepth(10002);

        // Add to container
        this.container.add([background, this.text]);
        // Ensure local coordinates within the sliding container
        background.setY(0);
        this.text.setY(8);
    }

    /**
     * Slide the panel up and display the provided message
     */
    show(message: string): void {
        this.text.setText(message);
        this.active = true;
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
            ease: 'Power2',
            onComplete: () => {
                this.active = false;
            }
        });
    }

    /** Show a confirm with Yes/No, returns a Promise<boolean> */
    confirm(message: string, yesLabel = 'Yes', noLabel = 'No'): Promise<boolean> {
        this.clearOptions();
        this.show(message);

        const { width } = this.scene.cameras.main;
        // Place choices within the panel (local to container)
        const baseY = 56; // 56px from top of the panel height (96)

        const px = Math.round.bind(Math);
        const yes = this.scene.add.text(px(width - 112), px(baseY), yesLabel, { fontFamily: 'Area51 Pixel', fontSize: '12px', color: '#00ffd0' }).setOrigin(0, 0);
        const no  = this.scene.add.text(px(width - 56), px(baseY), noLabel, { fontFamily: 'Area51 Pixel', fontSize: '12px', color: '#ff6666' }).setOrigin(0, 0);
        const selector = this.scene.add.text(0, px(baseY), '▶', { fontFamily: 'Area51 Pixel', fontSize: '12px', color: '#ffffff' }).setOrigin(0, 0);
        const uiScale = 1 / this.scene.cameras.main.zoom;
        yes.setScale(uiScale);
        no.setScale(uiScale);
        selector.setScale(uiScale);
        const dpr = (window as any).devicePixelRatio || 1;
        yes.setResolution(dpr);
        no.setResolution(dpr);
        selector.setResolution(dpr);
        yes.setScrollFactor(0);
        no.setScrollFactor(0);
        selector.setScrollFactor(0);
        yes.setDepth(10002);
        no.setDepth(10002);
        selector.setDepth(10002);
        this.optionTexts.push(yes, no, selector);
        this.container.add([yes, no, selector]);
        // Reposition to be relative to the container (local coords)
        yes.setPosition(px(width - 112), px(baseY));
        no.setPosition(px(width - 56), px(baseY));
        selector.setY(px(baseY));
        // Snap to integers to avoid sub-pixel blur
        yes.x = Math.round(yes.x); yes.y = Math.round(yes.y);
        no.x = Math.round(no.x); no.y = Math.round(no.y);
        selector.x = Math.round(selector.x); selector.y = Math.round(selector.y);

        return new Promise<boolean>((resolve) => {
            this.resolveSelection = resolve;

            let selectedIndex = 0; // 0 = yes, 1 = no

            const updateSelectionVisuals = () => {
                selector.x = px(selectedIndex === 0 ? yes.x - 12 : no.x - 12);
                yes.setStyle({ fontStyle: selectedIndex === 0 ? 'bold' : 'normal' });
                no.setStyle({ fontStyle: selectedIndex === 1 ? 'bold' : 'normal' });
            };
            updateSelectionVisuals();

            const onLeft = () => { selectedIndex = 0; updateSelectionVisuals(); };
            const onRight = () => { selectedIndex = 1; updateSelectionVisuals(); };

            const onAccept = () => done(selectedIndex === 0);
            const onCancel = () => done(false);

            const done = (accepted: boolean) => {
                offAction(this.scene, NavAction.LEFT, onLeft);
                offAction(this.scene, NavAction.RIGHT, onRight);
                offAction(this.scene, ActionButton.A, onAccept);
                offAction(this.scene, ActionButton.B, onCancel);
                this.clearOptions();
                this.hide();
                resolve(accepted);
                this.resolveSelection = undefined;
            };

            onAction(this.scene, NavAction.LEFT, onLeft);
            onAction(this.scene, NavAction.RIGHT, onRight);
            onAction(this.scene, ActionButton.A, onAccept);
            onAction(this.scene, ActionButton.B, onCancel);

            // Pointer interactions for mouse/touch
            yes.setInteractive({ useHandCursor: true })
                .on('pointerover', () => { selectedIndex = 0; updateSelectionVisuals(); })
                .on('pointerdown', () => onAccept());
            no.setInteractive({ useHandCursor: true })
                .on('pointerover', () => { selectedIndex = 1; updateSelectionVisuals(); })
                .on('pointerdown', () => onCancel());
        });
    }

    /** True when the dialogue panel is visible / awaiting input */
    isActive(): boolean {
        return this.active;
    }

    private clearOptions(): void {
        this.optionTexts.forEach(t => t.destroy());
        this.optionTexts.length = 0;
    }
}
