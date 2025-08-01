import ApartmentInterior from './scenes/apartment-interior';
import Boot from './scenes/boot';
import MainMenu from './scenes/main-menu';
import PaccHouse from './scenes/pacc-house';
import Phaser from 'phaser';
import Preloader from './scenes/preloader';
import StudioInterior from './scenes/studio-interior';
import TrapHouse from './scenes/trap-house';

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
        ApartmentInterior,
        PaccHouse,
        StudioInterior,
        TrapHouse
    ]
};

const StartGame = (parent: string) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
