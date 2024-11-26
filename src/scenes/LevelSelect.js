import Phaser from 'phaser';

export default class LevelSelect extends Phaser.Scene {
    constructor() {
        super('LevelSelect');
    }

    preload() {
        // Завантаження фонового зображення та планет
        this.load.image('background3', 'assets/images/level_select_background.jpg');
        this.load.image('planet1', 'assets/images/planet_1.png');
        this.load.image('planet2', 'assets/images/planet_2.png');
        this.load.image('planet3', 'assets/images/planet_3.png');
        this.load.image('planet4', 'assets/images/planet_4.png');
        this.load.image('planet5', 'assets/images/planet_5.png');
        this.load.image('planet6', 'assets/images/planet_6.png');
        this.load.image('planet7', 'assets/images/planet_7.png');
        this.load.image('planet8', 'assets/images/planet_8.png');
        this.load.image('lock', 'assets/images/lock.png'); // Замок для заблокованих рівнів
    }

    create() {
        // Фон
        this.add.image(0, 0, 'background3').setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Заголовок
        this.add.text(this.cameras.main.width / 2, 50, 'Виберіть рівень', {
            fontSize: '48px',
            fontFamily: 'Orbitron',
            color: '#ffffff',
        }).setOrigin(0.5);

        // Кількість колонок і рядків
        const columns = 4; // Кількість планет у рядку
        const rows = 2; // Кількість рядків
        const planetSpacingX = this.cameras.main.width / (columns + 1);
        const planetSpacingY = this.cameras.main.height / (rows + 1);

        const planetKeys = [
            'planet1',
            'planet2',
            'planet3',
            'planet4',
            'planet5',
            'planet6',
            'planet7',
            'planet8',
        ];

        // Масштаб планет і замків
        const planetScale = 0.35; // Менший масштаб планет
        const lockScale = 0.1; // Масштаб замків

        // Додавання планет у сітку
        planetKeys.forEach((key, index) => {

            const column = index % columns; // Позиція у колонці
            const row = Math.floor(index / columns); // Позиція у рядку

            const x = planetSpacingX * (column + 1);
            const y = planetSpacingY * (row + 1) + 80;

            // Планета
            const planetImage = this.add.image(x, y, key).setScale(planetScale);

            // Відкриті планети
            if (index < 2) {

                planetImage.setInteractive();

                // Ефект наведення
                planetImage.on('pointerover', () => {
                    this.tweens.add({
                        targets: planetImage,
                        scale: planetScale * 1.3, // Збільшення до 110%
                        duration: 200, // Тривалість анімації
                        ease: 'Power1',
                    });

                });

                planetImage.on('pointerout', () => {
                    this.tweens.add({
                        targets: planetImage,
                        scale: planetScale, // Повернення до початкового масштабу
                        duration: 200,
                        ease: 'Power1',
                    });
                });

                planetImage.on('pointerdown', () => {
                    console.log(`Планета ${key} вибрана`);
                    this.scene.start('GameScene');
                });

                // Показуємо бали
                this.add.text(x, y + 70, `Бали: ${index * 50}`, {
                    fontSize: '24px',
                    fontFamily: 'Orbitron',
                    color: '#ffffff',
                }).setOrigin(0.5);


            } else {

                // Заблоковані планети: додаємо замок
                this.add.image(x, y, 'lock').setOrigin(0.5).setScale(lockScale);

                // Відображення заблокованих планет
                planetImage.setAlpha(0.7); // Робимо напівпрозорими заблоковані планети
            }

        });

        // Кнопка "Назад"
        const backButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Назад', {
            fontSize: '36px',
            fontFamily: 'Orbitron',
            color: '#00ff00',
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu'); // Повернення до головного меню
        });


    }

}
