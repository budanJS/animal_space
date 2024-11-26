import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image('background', 'assets/images/background.webp'); // Фон
    }

    create() {

        const bg = this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);


        // Створюємо стиль тексту
        const textStyle = {
            fontSize: '56px',
            fontFamily: 'Orbitron',
            fontStyle: 'bold',
            color: '#ffffff',
        };

        const hoverStyle = {
            color: '#f5ad75', // Колір при наведенні
        };


        const exitTextStyle = { ...textStyle, color: '#ff0000' };
        const exitHoverStyle = { ...hoverStyle, color: '#ffaaaa' };



        // Створення кнопок із hover
        const createButton = (x, y, text, style, hoverStyle, callback) => {

            const button = this.add.text(x, y, text, style)
                .setOrigin(0.5)
                .setInteractive();

            // Подія наведення
            button.on('pointerover', () => {
                button.setStyle(hoverStyle); // Зміна стилю
                this.input.manager.canvas.style.cursor = 'pointer';
            });

            // Подія виходу з області
            button.on('pointerout', () => {
                button.setStyle(style); // Повернення до початкового стилю
                this.input.manager.canvas.style.cursor = 'default'; // Повернення стандартного курсору
            });

            // Подія кліку
            button.on('pointerdown', callback);

            return button;
        };


        // Додаємо кнопки
        createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'Нова гра',
            textStyle,
            hoverStyle,
            () => this.scene.start('LevelSelect')
        );

        createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            'Продовжити гру',
            textStyle,
            hoverStyle,
            () => console.log('Продовження гри')
        );

        createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 150,
            'Налаштування',
            textStyle,
            hoverStyle,
            () => console.log('Відкрито налаштування')
        );

        createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 250,
            'Вийти з гри',
            exitTextStyle,
            exitHoverStyle,
            () => window.close()
        );

    }

}
