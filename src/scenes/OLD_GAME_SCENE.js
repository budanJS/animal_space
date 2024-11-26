import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.heroHealth = 3; // Життя героя
        this.ground = null; // Додаємо змінну для збереження ґрунту
        this.onGround = false; // Додаємо змінну для перевірки, чи герой на ґрунті
    }

    preload() {
        // Завантаження ресурсів
        this.load.image('background4', 'assets/images/planet_1_1_bg.webp'); // Фон
        this.load.image('platform_bottom', 'assets/images/platform_bottom.jpg'); // Платформа
        this.load.image('tiger', 'assets/images/persons/tiger_commander_small.png'); // Герой
        this.load.image('tiger_crouch', 'assets/images/persons/tiger_crouch.png'); // Спрайт присівшого тигра
        this.load.image('enemy', 'assets/images/enemy.png'); // Basic Enemy
        this.load.image('jumper', 'assets/images/jumper.png'); // Jumper
        this.load.image('climber', 'assets/images/climber.png'); // Climber
    }

    create() {
        // Фон
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background4')
            .setOrigin(0, 0);

        // Платформи
        const platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'platform_bottom').setScale(2).refreshBody(); // Нижня платформа
        platforms.create(300, 450, 'platform');
        platforms.create(900, 450, 'platform');
        platforms.create(1200, 300, 'platform');
        platforms.create(1500, 200, 'platform');

        // Герой (Тигр)
        this.tiger = this.physics.add.sprite(100, 450, 'tiger').setScale(0.5);
        this.tiger.setBounce(0.2);
        this.tiger.setCollideWorldBounds(true);
        this.physics.add.collider(this.tiger, platforms);

        // Вороги
        this.enemies = this.physics.add.group();


        // Додаємо ворогів
        // Додаємо 5 базових ворогів
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(400, 1800); // Випадкові координати X
            const y = 460; // Координата Y на рівні землі
            this.addBasicEnemy(x, y);
        }

        // Додаємо 5 джамперів
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(400, 1800); // Випадкові координати X
            const y = Phaser.Math.Between(300, 460); // Випадкові координати Y на платформах
            this.addJumper(x, y);
        }

        // Додаємо 5 клімберів
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(400, 1800); // Випадкові координати X
            const y = Phaser.Math.Between(300, 460); // Випадкові координати Y
            this.addClimber(x, y);
        }



        // Колізії ворогів із платформами
        this.physics.add.collider(this.enemies, platforms);

        // Взаємодія ворогів із героєм
        this.physics.add.overlap(this.tiger, this.enemies, this.hitEnemy, null, this);

        // Камера
        this.cameras.main.setBounds(0, 0, 2000, this.cameras.main.height);
        this.physics.world.setBounds(0, 0, 2000, this.cameras.main.height + 200); // Розширення меж світу
        this.cameras.main.startFollow(this.tiger, true, 0.05, 0.05);

        // Відображення життя героя
        this.healthText = this.add.text(16, 16, `Життя: ${this.heroHealth}`, {
            fontSize: '32px',
            fill: '#ffffff',
        }).setScrollFactor(0);

        this.cursors = this.input.keyboard.createCursorKeys();



        const ground = this.physics.add.staticGroup();
        this.physics.add.collider(this.tiger, ground); // Герой взаємодіє із ґрунтом
        this.physics.add.collider(this.enemies, ground); // Вороги взаємодіють із ґрунтом
        ground.create(1000, this.cameras.main.height + 50, 'platform_bottom').setScale(4).refreshBody(); // Додаємо ґрунт



// Додаємо перевірку, щоб не можна було пройти через ґрунт
        this.physics.add.collider(this.tiger, ground, () => {
            if (this.cursors.down.isDown) {
                this.tiger.body.checkCollision.down = true; // Забороняємо просідання через ґрунт
            }
        });

    }

    update() {
        const maxSpeed = 200;
        const acceleration = 800;
        const deceleration = 500;

        // Рух героя
        if (this.cursors.left.isDown) {
            this.tiger.setAccelerationX(-acceleration);
            this.tiger.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.tiger.setAccelerationX(acceleration);
            this.tiger.flipX = false;
        } else {
            this.tiger.setAccelerationX(0);
            this.tiger.setDragX(deceleration);
        }

        if (Math.abs(this.tiger.body.velocity.x) > maxSpeed) {
            this.tiger.setVelocityX(Phaser.Math.Clamp(this.tiger.body.velocity.x, -maxSpeed, maxSpeed));
        }

        if (this.cursors.up.isDown && this.tiger.body.blocked.down) {
            this.tiger.setVelocityY(-300);
        }


        this.physics.add.collider(this.tiger, ground, () => {
            this.onGround = true; // Герой стоїть на ґрунті
        });

        this.physics.add.collider(this.tiger, platforms, () => {
            this.onGround = false; // Герой на платформі
        });


        if (this.cursors.down.isDown) {
            if (this.tiger.texture.key !== 'tiger_crouch') {
                this.tiger.setTexture('tiger_crouch'); // Міняємо спрайт на присівшого тигра
            }
            if (!this.onGround) {
                this.tiger.body.checkCollision.down = false; // Дозволяємо просідання через платформу
            }
        } else {
            if (this.tiger.texture.key !== 'tiger') {
                this.tiger.setTexture('tiger'); // Повертаємо звичайний спрайт
            }
            this.tiger.body.checkCollision.down = true; // Відновлюємо колізії з усіма платформами
        }


        // // Перевірка падіння героя
        // if (this.tiger.y > this.physics.world.bounds.height) {
        //     this.showGameOverScreen();
        // }
    }

    // Basic Enemy: Рухається тільки ліворуч/праворуч
    addBasicEnemy(x, y) {
        const enemy = this.enemies.create(x, y, 'enemy').setScale(0.5);
        const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // Випадковий початковий напрямок
        enemy.setVelocityX(100 * direction); // Початковий рух
        enemy.setBounce(0); // Вимкнення відскоку
        enemy.setCollideWorldBounds(true); // Залишатися в межах світу
        enemy.body.setGravityY(300); // Притягується до землі

        // Встановлення перевірки руху
        this.time.addEvent({
            delay: 1000, // Кожну секунду перевіряти
            callback: () => {
                if (enemy.body.blocked.right || enemy.body.blocked.left) {
                    // Якщо ворог уперся в стіну або платформу, змінює напрямок
                    enemy.setVelocityX(-enemy.body.velocity.x);
                } else if (enemy.body.velocity.x === 0) {
                    // Якщо ворог зупинився, дати йому новий напрямок
                    const newDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
                    enemy.setVelocityX(100 * newDirection);
                }
            },
            loop: true,
        });
    }



    // Jumper: Стрибає в випадкову сторону
    addJumper(x, y) {
        const jumper = this.enemies.create(x, y, 'jumper').setScale(0.5);
        const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // Випадковий напрямок
        jumper.setVelocityX(100 * direction);
        jumper.setBounce(1);
        jumper.setCollideWorldBounds(true);
        jumper.setVelocityY(-200); // Початковий стрибок
    }

    // Climber: Лізе та стрибає
    addClimber(x, y) {
        const climber = this.enemies.create(x, y, 'climber').setScale(0.5);
        climber.setVelocityY(-50); // Лізе вгору
        this.time.addEvent({
            delay: 2000, // Кожні 2 секунди
            callback: () => {
                climber.setVelocityY(-50);
                climber.setVelocityX(Phaser.Math.Between(-100, 100)); // Випадковий рух після стрибка
                climber.setVelocityY(-200); // Стрибок
            },
            loop: true,
        });
        climber.setCollideWorldBounds(true);
    }

    // Взаємодія героя з ворогом
    // Взаємодія героя з ворогом
    hitEnemy(tiger, enemy) {
        if (this.invulnerable) return; // Якщо герой тимчасово невразливий, ігнорувати

        this.heroHealth -= 1;
        this.healthText.setText(`Життя: ${this.heroHealth}`);

        if (this.heroHealth <= 0) {
            this.showGameOverScreen();
        } else {
            this.invulnerable = true; // Зробити героя невразливим
            this.tiger.setTint(0xff0000); // Підсвітити червоним
            this.time.delayedCall(1000, () => {
                this.invulnerable = false; // Вимкнути невразливість через 1 секунду
                this.tiger.clearTint();
            });
        }
    }



    // Логіка Game Over
    showGameOverScreen() {
        this.physics.pause(); // Зупиняємо гру
        this.tiger.setTint(0xff0000); // Позначаємо героя червоним кольором

        const { width, height } = this.scale;

        // Текст Game Over
        this.add.text(width / 2, height / 2 - 50, 'Game Over', {
            fontSize: '48px',
            color: '#ff0000',
        }).setOrigin(0.5);

        // Кнопка "Почати заново"
        const restartButton = this.add.text(width / 2, height / 2 + 20, 'Почати заново', {
            fontSize: '36px',
            color: '#00ff00',
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.heroHealth = 3;
                this.scene.restart(); // Перезапустити гру
            });

        // Кнопка "Вийти"
        const exitButton = this.add.text(width / 2, height / 2 + 80, 'Вийти', {
            fontSize: '36px',
            color: '#00ff00',
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('MainMenu'); // Повернутися до головного меню
            });
    }
}