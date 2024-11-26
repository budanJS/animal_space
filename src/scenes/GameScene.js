import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.heroHealth = 3; // Життя героя

        this.isCarriedByBird = false; // Вказує, чи прикріплений герой до пташки
        this.birdCarryTimer = null; // Таймер для відпускання героя
    }

    preload() {
        // Завантаження ресурсів
        this.load.image('background4', 'assets/images/planet_1_1_bg.webp'); // Фон
        this.load.image('platform_bottom', 'assets/images/platform_bottom.jpg'); // Платформа
        this.load.image('platform', 'assets/images/platform.png'); // Платформа
        this.load.image('tiger', 'assets/images/tiger.png'); // Герой
        this.load.image('tiger_crouch', 'assets/images/tiger_crouch.png'); // Спрайт присівшого тигра
        this.load.image('tiger_jump', 'assets/images/tiger_jump.png'); // Спрайт присівшого тигра

        this.load.image('tiger_walk_1', 'assets/images/tiger_walk_1.png'); // Крок 1
        this.load.image('tiger_walk_2', 'assets/images/tiger_walk_2.png'); // Крок 2


        this.load.image('catapult', 'assets/images/catapult.png');

        this.load.image('enemy', 'assets/images/enemy.png'); // Basic Enemy
        this.load.image('jumper', 'assets/images/jumper.png'); // Jumper
        this.load.image('climber', 'assets/images/climber.png'); // Climber

        this.load.image('bullet', 'assets/images/bullet.png'); // Спрайт кулі
        this.load.image('bouncing_bullet', 'assets/images/bouncing_bullet.png'); // Спрайт кулі, що пригає

        this.load.image('bird', 'assets/images/bird.png'); // Спрайт птаха

        this.load.image('coin', 'assets/images/coin.png'); // Спрайт монети

    }

    create() {
        // Фон

        this.backgrounds = [];
        const bgWidth = this.textures.get('background4').getSourceImage().width; // Ширина одного бекграунда

        // Додаємо кілька бекграундів
        for (let i = 0; i < 5; i++) { // Наприклад, 5 бекграундів
            const bg = this.add.tileSprite(i * bgWidth, 0, bgWidth, this.cameras.main.height, 'background4')
                .setOrigin(0, 0);
            this.backgrounds.push(bg);
        }


        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background4')
            .setOrigin(0, 0)
            .setScrollFactor(0); // Не залежить від скролу камери


        // Платформи
        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(100, 568, 'platform'); // Нижня платформа
        this.platforms.create(320, 450, 'platform');
        this.platforms.create(900, 450, 'platform');
        this.platforms.create(1200, 400, 'platform');
        this.platforms.create(1500, 400, 'platform');
        this.platforms.create(1800, 410, 'platform');
        this.platforms.create(2200, 450, 'platform');
        this.platforms.create(2600, 420, 'platform');
        this.platforms.create(3000, 400, 'platform');


        // Герой (Тигр)
        this.tiger = this.physics.add.sprite(100, 450, 'tiger').setScale(0.5);
        this.tiger.setBounce(0);
        this.tiger.setCollideWorldBounds(true);

        this.physics.add.collider(this.tiger, this.platforms);

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
        this.physics.add.collider(this.enemies, this.platforms);

        // Взаємодія ворогів із героєм
        this.physics.add.overlap(this.tiger, this.enemies, this.hitEnemy, null, this);

        // Камера
        this.cameras.main.setBounds(0, 0, 4000, this.cameras.main.height); // Розширюємо світ
        this.physics.world.setBounds(0, 0, 4000, this.cameras.main.height + 200); // Розширення фізичного світу


        this.cameras.main.startFollow(this.tiger, true, 0.05, 0.05);

        // Відображення життя героя
        this.healthText = this.add.text(16, 16, `Життя: ${this.heroHealth}`, {
            fontSize: '32px',
            fill: '#ffffff',
        }).setScrollFactor(0);

        this.cursors = this.input.keyboard.createCursorKeys();



        const ground = this.physics.add.staticGroup();
        this.ground = ground;

        this.physics.add.collider(this.tiger, ground); // Герой взаємодіє із ґрунтом
        this.physics.add.collider(this.enemies, ground); // Вороги взаємодіють із ґрунтом

        this.ground.create(1000, this.cameras.main.height + 120, 'platform_bottom').setScale(8).refreshBody(); // Додаємо ґрунт


       // Додаємо перевірку, щоб не можна було пройти через ґрунт
        this.physics.add.collider(this.tiger, ground, () => {
            if (this.cursors.down.isDown) {
                this.tiger.body.checkCollision.down = true; // Забороняємо просідання через ґрунт
            }
        });


        // стрільба

        this.bullets = this.physics.add.group(); // Група для куль

        // Додавання клавіші для стрільби
        this.input.keyboard.on('keydown-F', () => {
            if (this.bullets.getChildren().length < 5) { // Перевірка на кількість куль
                this.shootBullet();
            }
        });

        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemyWithBullet, null, this);


        this.input.keyboard.on('keydown-V', () => {
            if (this.bullets.getChildren().length < 5) { // Обмеження на кількість куль
                this.shootBouncingBullet();
            }
        });


        this.physics.add.collider(this.bullets, this.platforms);

        this.physics.add.overlap(this.bullets, this.platforms, (bullet) => {
            if (bullet.active) bullet.destroy(); // Знищуємо кулю при перетині з платформою
        });

        this.walkFrame = 0; // Лічильник для кадрів ходьби
        this.walkTimer = 0; // Таймер для анімації ходьби


        // Створюємо катапульту
        const catapult = this.physics.add.sprite(550, 900, 'catapult').setScale(1.0);


        catapult.body.allowGravity = false; // Катапульта не падає

       // Додаємо колізію з тигром
        this.physics.add.overlap(this.tiger, catapult, () => {
            this.tiger.setVelocityY(-700); // Катапульта штовхає гравця вгору
        }, null, this);



        this.birds = this.physics.add.group({
            allowGravity: false, // Вимкнути гравітацію для птахів
        });

        // Додаємо таймер для генерації птахів
        this.time.addEvent({
            delay: 3000, // Кожні 3 секунди генеруємо птаха
            callback: this.addBird,
            callbackScope: this,
            loop: true,
        });


        // Група для монет
        this.coins = this.physics.add.staticGroup();

        // Розташування монет
        const coinPositions = [
            { x: 330, y: 400 },
            { x: 850, y: 400 },
            { x: 1200, y: 400 },
            { x: 1600, y: 350 },
            { x: 2000, y: 300 }
        ];

        coinPositions.forEach(pos => {
            this.coins.create(pos.x, pos.y, 'coin').setScale(0.5).refreshBody();
        });

        // Колізія монет із героєм
        this.physics.add.overlap(this.tiger, this.coins, this.collectCoin, null, this);

        // Лічильник очок
        this.score = 0;

        // Текст для відображення очок
        this.scoreText = this.add.text(16, 50, 'Очки: 0', {
            fontSize: '32px',
            fill: '#ffffff',
        }).setScrollFactor(0);


        this.input.keyboard.on('keydown-A', () => {
            if (this.isCarriedByBird || this.tiger.body.blocked.down) return; // Вже прикріплений або на землі

            const overlappingBird = this.physics.overlapRect(
                this.tiger.x - 10,
                this.tiger.y - 10,
                this.tiger.width + 20,
                this.tiger.height + 20
            ).find(body => body.gameObject && body.gameObject.texture.key === 'bird');

            if (overlappingBird) {
                this.attachToBird(overlappingBird.gameObject);
            }
        });


    }


    update(time, delta) {
        const maxSpeed = 200;
        const acceleration = 800;
        const deceleration = 500;

        // Логіка ходьби
        if (this.cursors.left.isDown) {
            this.tiger.setAccelerationX(-acceleration);
            this.tiger.flipX = true; // Повертаємо вліво
            this.animateWalk(delta); // Викликаємо функцію анімації ходьби
        } else if (this.cursors.right.isDown) {
            this.tiger.setAccelerationX(acceleration);
            this.tiger.flipX = false; // Повертаємо вправо
            this.animateWalk(delta); // Викликаємо функцію анімації ходьби
        } else {
            this.tiger.setAccelerationX(0);
            this.tiger.setDragX(deceleration);

            // Якщо не рухається, повертаємо стандартну текстуру
            if (this.tiger.texture.key !== 'tiger') {
                this.tiger.setTexture('tiger');
            }
        }

        if (Math.abs(this.tiger.body.velocity.x) > maxSpeed) {
            this.tiger.setVelocityX(Phaser.Math.Clamp(this.tiger.body.velocity.x, -maxSpeed, maxSpeed));
        }

        // Стрибок
        if (this.cursors.up.isDown && this.tiger.body.blocked.down) {
            this.tiger.setVelocityY(-300);
        }

        // Зміна текстури для стрибка
        if (!this.tiger.body.blocked.down) {
            if (this.tiger.texture.key !== 'tiger_jump') {
                this.tiger.setTexture('tiger_jump');
            }
        }


        // Присідання
        if (this.cursors.down.isDown) {
            if (this.tiger.texture.key !== 'tiger_crouch') {
                this.tiger.setTexture('tiger_crouch');
            }
        } else if (this.tiger.body.blocked.down) {
            if (this.tiger.texture.key === 'tiger_crouch') {
                this.tiger.setTexture('tiger');
            }
        }

        //////===============

        // const scrollX = this.cameras.main.scrollX;
        //
        // // Оновлюємо бекграунди
        // this.backgrounds.forEach((bg, index) => {
        //     bg.setTilePosition(scrollX, 0); // Прокручуємо бекграунди
        // });

        this.background.tilePositionX = this.cameras.main.scrollX; // Оновлення бекграунду



        //////===============

        if (this.isCarriedByBird) {
            // Синхронізуємо героя з пташкою
            const overlappingBird = this.physics.overlapRect(
                this.tiger.x - 10,
                this.tiger.y - 10,
                this.tiger.width + 20,
                this.tiger.height + 20
            ).find(body => body.gameObject && body.gameObject.texture.key === 'bird');

            if (overlappingBird) {
                const bird = overlappingBird.gameObject;
                this.tiger.x = bird.x;
                this.tiger.y = bird.y;
            }
        }

    }



    attachToBird(bird) {
        this.isCarriedByBird = true;

        // Відключаємо гравітацію і колізії для героя
        this.tiger.body.allowGravity = false;
        this.tiger.body.checkCollision.none = true;

        // Синхронізуємо позицію героя з пташкою
        this.tiger.x = bird.x;
        this.tiger.y = bird.y;

        // Додаємо таймер для відпускання
        this.birdCarryTimer = this.time.delayedCall(1000, () => {
            this.releaseFromBird(bird);
        });

        // Додаємо плавне зниження пташки
        bird.setVelocityY(20); // Невелике зниження
    }

    releaseFromBird(bird) {
        this.isCarriedByBird = false;

        // Відновлюємо гравітацію і колізії для героя
        this.tiger.body.allowGravity = true;
        this.tiger.body.checkCollision.none = false;

        // Герой падає вниз після відпускання
        this.tiger.setVelocityY(200);

        // Пташка повертається до прямого польоту
        bird.setVelocityY(0);

        // Скидаємо таймер
        if (this.birdCarryTimer) {
            this.birdCarryTimer.remove(false);
            this.birdCarryTimer = null;
        }
    }




    animateWalk(delta) {
        this.walkTimer += delta;

        if (this.walkTimer > 200) { // Змінюємо кадр кожні 200 мс
            this.walkTimer = 0;
            this.walkFrame = (this.walkFrame + 1) % 2; // Чередуємо між 0 і 1
            const walkTextures = ['tiger_walk_1', 'tiger_walk_2'];
            this.tiger.setTexture(walkTextures[this.walkFrame]);
        }
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
                if (enemy && enemy.body && (enemy.body.blocked.right || enemy.body.blocked.left)) {
                    enemy.setVelocityX(-enemy.body.velocity.x); // Змінює напрямок
                } else if (enemy && enemy.body && enemy.body.velocity.x === 0) {
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
        const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
        jumper.setVelocityX(100 * direction);
        jumper.setBounce(1);
        jumper.setCollideWorldBounds(true);
        jumper.setVelocityY(-200);

        jumper.jumpTimer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (jumper && jumper.active && jumper.body) {
                    jumper.setVelocityY(-200);
                    jumper.setVelocityX(Phaser.Math.Between(-100, 100));
                }
            },
            loop: true,
        });
    }

    // Climber: Лізе та стрибає
    addClimber(x, y) {
        const climber = this.enemies.create(x, y, 'climber').setScale(0.5);
        climber.setVelocityY(-50);
        climber.setCollideWorldBounds(true);

        climber.climbTimer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (climber && climber.active && climber.body) {
                    climber.setVelocityY(-200);
                    climber.setVelocityX(Phaser.Math.Between(-100, 100));
                }
            },
            loop: true,
        });

    }

    // Взаємодія героя з ворогом
    // Взаємодія героя з ворогом

    // Взаємодія героя з ворогом
    hitEnemy(tiger, enemy) {
        if (!enemy || !enemy.body) return;

        const isJumper = enemy.texture.key === 'jumper';
        const isClimber = enemy.texture.key === 'climber';
        const isAbove = tiger.body.velocity.y > 0 && tiger.body.bottom <= enemy.body.top + 10;

        if (isAbove) {
            this.handleEnemyStomp(tiger, enemy); // Герой стрибає зверху на ворога
        } else if (isJumper || isClimber) {
            // Якщо це джампер чи павук (клімбер) і не зверху, герой отримує урон
            this.takeDamage(tiger);
        } else if (enemy.texture.key === 'enemy') {
            // Якщо це звичайний ворог (колючий), герой отримує урон
            this.takeDamage(tiger);
        }
    }

// Логіка для стрибка на ворога
    handleEnemyStomp(tiger, enemy) {
        tiger.setVelocityY(-200); // Відскок героя при стрибку на ворога
        enemy.setFlipY(true); // Перевертаємо ворога
        enemy.setVelocityY(200); // Ворог падає вниз
        enemy.body.checkCollision.none = true; // Вимикаємо колізію ворога

        // Видаляємо ворога через деякий час
        this.time.delayedCall(1000, () => {
            if (enemy && enemy.active) {
                enemy.destroy();
                this.checkVictory(); // Перевіряємо, чи всі вороги знищені
            }
        });
    }

// Логіка нанесення урону герою
    takeDamage(tiger) {
        if (this.invulnerable) return; // Якщо герой тимчасово невразливий, ігнорувати

        this.heroHealth -= 1;
        this.healthText.setText(`Життя: ${this.heroHealth}`);

        if (this.heroHealth <= 0) {
            this.showGameOverScreen(); // Гравець програв
        } else {
            this.invulnerable = true; // Герой стає тимчасово невразливим
            tiger.setTint(0xff0000); // Підсвічуємо червоним для індикації
            this.time.delayedCall(1000, () => {
                this.invulnerable = false; // Знімаємо невразливість
                tiger.clearTint();
            });
        }
    }

    // Логіка Game Over
    showGameOverScreen() {
        this.physics.pause(); // Зупиняємо гру
        this.tiger.setTint(0xff0000); // Позначаємо героя червоним кольором

        const { width, height } = this.scale;

        // Текст Game Over
        const gameOverText = this.add.text(width / 2, height / 2 - 50, 'Game Over', {
            fontSize: '48px',
            color: '#ff0000',
        })
            .setOrigin(0.5)
            .setScrollFactor(0); // Фіксуємо текст на екрані

        // Кнопка "Почати заново"
        const restartButton = this.add.text(width / 2, height / 2 + 20, 'Почати заново', {
            fontSize: '36px',
            color: '#00ff00',
        })
            .setOrigin(0.5)
            .setScrollFactor(0) // Фіксуємо кнопку на екрані
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
            .setScrollFactor(0) // Фіксуємо кнопку на екрані
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('MainMenu'); // Повернутися до головного меню
            });
    }

    showVictoryScreen() {
        this.physics.pause(); // Зупиняємо гру

        const { width, height } = this.scale;

        // Текст "Congratulations!"
        const victoryText = this.add.text(width / 2, height / 2 - 50, 'Congratulations!', {
            fontSize: '48px',
            color: '#00ff00',
        })
            .setOrigin(0.5)
            .setScrollFactor(0); // Фіксуємо текст на екрані

        // Кнопка для переходу до наступного рівня
        const nextButton = this.add.text(width / 2, height / 2 + 20, 'Наступний рівень', {
            fontSize: '36px',
            color: '#ffffff',
        })
            .setOrigin(0.5)
            .setScrollFactor(0) // Фіксуємо кнопку на екрані
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('NextLevel'); // Замініть 'NextLevel' на назву сцени наступного рівня
            });

        // Кнопка для повернення в головне меню
        const menuButton = this.add.text(width / 2, height / 2 + 80, 'Меню', {
            fontSize: '36px',
            color: '#ffffff',
        })
            .setOrigin(0.5)
            .setScrollFactor(0) // Фіксуємо кнопку на екрані
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('MainMenu'); // Повернення до головного меню
            });
    }

    shootBullet() {
        const bullet = this.bullets.create(this.tiger.x, this.tiger.y + 10, 'bullet');
        bullet.setScale(0.5);
        bullet.body.allowGravity = false; // Вимкнути гравітацію для кулі

        const speed = 400;
        if (this.tiger.flipX) {
            bullet.setVelocityX(-speed); // Стрільба вліво
        } else {
            bullet.setVelocityX(speed); // Стрільба вправо
        }

        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        bullet.body.world.on('worldbounds', (body) => {
            if (body.gameObject === bullet) {
                if (bullet.active) bullet.destroy();
            }
        });

        // Колізія кулі з платформами (перевірка через overlap)
        this.physics.add.overlap(bullet, this.platforms, () => {
            if (bullet.active) bullet.destroy(); // Знищуємо кулю при зіткненні з платформою
        });

        // Видаляємо кулю через 5 секунд
        this.time.delayedCall(5000, () => {
            if (bullet.active) bullet.destroy();
        });

    }

    shootBouncingBullet() {
        const bullet = this.bullets.create(this.tiger.x, this.tiger.y + 10, 'bouncing_bullet');
        bullet.setScale(0.5);
        bullet.setBounce(1); // Відскоки
        bullet.setCollideWorldBounds(true);

        const speed = 200;
        if (this.tiger.flipX) {
            bullet.setVelocityX(-speed);
        } else {
            bullet.setVelocityX(speed);
        }

        bullet.setVelocityY(-100); // Початковий стрибок

        // Видалення кулі через 5 секунд
        this.time.delayedCall(5000, () => {
            if (bullet.active) bullet.destroy();
        });

        // Колізія кулі з платформами
        this.physics.add.collider(bullet, this.platforms);

        // Колізія кулі з ґрунтом
        this.physics.add.collider(bullet, this.ground); // ground — це група підлоги
    }

    hitEnemyWithBullet(bullet, enemy) {
        bullet.destroy(); // Знищуємо кулю

        if (!enemy || !enemy.body) return; // Перевірка існування ворога

        // Перевертаємо ворога
        enemy.setFlipY(true);
        enemy.setVelocityY(200);
        enemy.body.checkCollision.none = true;

        // Скасовуємо таймери
        if (enemy.jumpTimer) enemy.jumpTimer.remove();
        if (enemy.climbTimer) enemy.climbTimer.remove();

        this.time.delayedCall(1000, () => {
            if (enemy && enemy.active) {
                enemy.destroy(); // Видаляємо ворога
                this.checkVictory(); // Перевіряємо, чи всі вороги знищені
            }
        });
    }

    checkVictory() {
        if (this.enemies.countActive(true) === 0) { // Якщо активних ворогів більше немає
            this.showVictoryScreen();
        }
    }

    addBird() {
        // Випадкове розташування птаха
        const y = Phaser.Math.Between(100, 400); // Висота, на якій з’являється птах
        const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // Напрямок польоту (вліво чи вправо)
        const x = direction === 1 ? -50 : this.cameras.main.worldView.width + 50; // Залежить від напрямку

        // Створюємо птаха
        const bird = this.birds.create(x, y, 'bird').setScale(0.5);
        bird.setVelocityX(direction * Phaser.Math.Between(100, 200)); // Випадкова швидкість
        bird.flipX = direction === -1; // Перевертаємо, якщо летить вліво

        // Видалення птаха після виходу за межі
        bird.checkWorldBounds = true;
        bird.outOfBoundsKill = true;
    }

    collectCoin(tiger, coin) {
        // Додавання анімації польоту монети
        const targetX = 50; // Позиція тексту очок по X
        const targetY = 50; // Позиція тексту очок по Y

        const coinFly = this.add.image(coin.x, coin.y, 'coin').setScale(0.5);

        this.tweens.add({
            targets: coinFly,
            x: targetX,
            y: targetY,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 900,
            onComplete: () => {
                coinFly.destroy(); // Видаляємо копію монети після завершення анімації
                this.score += 10; // Додаємо очки
                this.scoreText.setText(`Очки: ${this.score}`); // Оновлюємо текст очок
            },
        });

        coin.destroy(); // Видаляємо монету з фізичного світу
    }

}