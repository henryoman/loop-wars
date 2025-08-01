import Boot from './scenes/Boot';
import MainMenu from './scenes/MainMenu';
import Phaser from 'phaser';
import Preloader from './scenes/Preloader';
import StudioInterior from './scenes/StudioInterior';
import TrapHouse from './scenes/TrapHouse';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 384,
    height: 288,
    parent: 'game-container',
    backgroundColor: '#028af8',
    pixelArt: true,
    roundPixels: true,
    zoom: 3,
    		physics: {
			default: 'arcade',
			arcade: {
				debug: true
			}
		},
    scene: [
        Boot,
        Preloader,
        MainMenu,
        StudioInterior,
        TrapHouse
    ]
};

const StartGame = (parent: string) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
