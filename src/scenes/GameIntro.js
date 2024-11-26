import Phaser from 'phaser';

export default class GameIntro extends Phaser.Scene {
    constructor() {
        super('GameIntro');
    }

    preload() {
        this.load.image('introBackground', 'assets/images/introBackground.webp'); // Фон заставки
    }

    create() {
        const bg = this.add.image(0, 0, 'introBackground')
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        window.addEventListener('resize', () => {
            this.scale.resize(window.innerWidth, window.innerHeight);
            bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        });

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Починаємо пригоду!', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        // this.time.delayedCall(3000, () => {
        //     this.scene.start('GameScene');
        // });
    }
}
