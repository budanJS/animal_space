import Phaser from 'phaser';
import MainMenu from './scenes/MainMenu';
import LevelSelect from './scenes/LevelSelect';
import GameScene from './scenes/GameScene';


const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [MainMenu, LevelSelect, GameScene], // Додали нову сцену
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 350 }, // Гравітація
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);
