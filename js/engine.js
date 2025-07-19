class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.entities = [];
        this.player = null;
        this.currentLevel = null;
        this.levels = {};
        this.gameWidth = 800;
        this.gameHeight = 600;
        this.gravity = 0.5;
        this.cameraX = 0;
        this.cameraY = 0;
        this.tileSize = 32;
        this.dialogueSystem = null;
        this.collectibles = {};
        
        this.keys = {
            right: false,
            left: false,
            up: false,
            down: false,
            action: false
        };
        
        this.setupEventListeners();
        this.resize();
    }
    
    resize() {
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        window.addEventListener('resize', () => this.resize());
    }
    
    handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowRight':
            case 'd':
                this.keys.right = true;
                break;
            case 'ArrowLeft':
            case 'a':
                this.keys.left = true;
                break;
            case 'ArrowUp':
            case 'w':
            case ' ':
                this.keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
                this.keys.down = true;
                break;
            case 'Enter':
            case 'e':
                this.keys.action = true;
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowRight':
            case 'd':
                this.keys.right = false;
                break;
            case 'ArrowLeft':
            case 'a':
                this.keys.left = false;
                break;
            case 'ArrowUp':
            case 'w':
            case ' ':
                this.keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
                this.keys.down = false;
                break;
            case 'Enter':
            case 'e':
                this.keys.action = false;
                break;
        }
    }
    
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }
    
    setPlayer(player) {
        this.player = player;
        this.addEntity(player);
    }
    
    addLevel(name, level) {
        this.levels[name] = level;
    }
    
    loadLevel(levelName) {
        this.entities = [];
        this.currentLevel = this.levels[levelName];
        this.currentLevel.load(this);
        
        if (this.player) {
            this.addEntity(this.player);
        }
    }
    
    updateCamera() {
        // Center camera on player
        if (this.player) {
            this.cameraX = this.player.x - this.gameWidth / 2;
            this.cameraY = this.player.y - this.gameHeight / 2;
            
            // Clamp camera to level bounds
            if (this.currentLevel) {
                const levelWidth = this.currentLevel.width * this.tileSize;
                const levelHeight = this.currentLevel.height * this.tileSize;
                
                this.cameraX = Math.max(0, Math.min(this.cameraX, levelWidth - this.gameWidth));
                this.cameraY = Math.max(0, Math.min(this.cameraY, levelHeight - this.gameHeight));
            }
        }
    }
    
    update() {
        // Update entities
        for (const entity of this.entities) {
            entity.update(this);
        }
        
        // Update camera
        this.updateCamera();
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Render current level
        if (this.currentLevel) {
            this.currentLevel.render(this.ctx, this.cameraX, this.cameraY);
        }
        
        // Render entities
        for (const entity of this.entities) {
            entity.render(this.ctx, this.cameraX, this.cameraY);
        }
        
        // Render dialogue
        if (this.dialogueSystem && this.dialogueSystem.active) {
            this.dialogueSystem.render(this.ctx);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    start() {
        this.gameLoop();
    }
    
    checkCollision(entity, direction) {
        if (!this.currentLevel) return false;
        
        // Get the tiles that the entity is overlapping
        const tileSize = this.tileSize;
        const left = Math.floor(entity.x / tileSize);
        const right = Math.floor((entity.x + entity.width) / tileSize);
        const top = Math.floor(entity.y / tileSize);
        const bottom = Math.floor((entity.y + entity.height) / tileSize);
        
        if (direction === 'horizontal') {
            // Check horizontal collision
            for (let y = top; y <= bottom; y++) {
                if (entity.velX > 0) {
                    // Moving right
                    if (this.currentLevel.isSolidTile(right, y)) {
                        return { collision: true, tileX: right, tileY: y };
                    }
                } else if (entity.velX < 0) {
                    // Moving left
                    if (this.currentLevel.isSolidTile(left, y)) {
                        return { collision: true, tileX: left, tileY: y };
                    }
                }
            }
        } else if (direction === 'vertical') {
            // Check vertical collision
            for (let x = left; x <= right; x++) {
                if (entity.velY > 0) {
                    // Moving down
                    if (this.currentLevel.isSolidTile(x, bottom)) {
                        return { collision: true, tileX: x, tileY: bottom };
                    }
                } else if (entity.velY < 0) {
                    // Moving up
                    if (this.currentLevel.isSolidTile(x, top)) {
                        return { collision: true, tileX: x, tileY: top };
                    }
                }
            }
        }
        
        return { collision: false };
    }
    
    checkEntityCollision(entity) {
        for (const other of this.entities) {
            if (entity !== other && this.isColliding(entity, other)) {
                entity.onCollision(other);
                other.onCollision(entity);
            }
        }
    }
    
    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
}

class DialogueSystem {
    constructor(engine) {
        this.engine = engine;
        this.dialogues = {};
        this.currentDialogue = null;
        this.currentLine = 0;
        this.active = false;
    }
    
    addDialogue(id, lines) {
        this.dialogues[id] = lines;
    }
    
    startDialogue(id) {
        if (this.dialogues[id]) {
            this.currentDialogue = this.dialogues[id];
            this.currentLine = 0;
            this.active = true;
        }
    }
    
    nextLine() {
        if (this.active) {
            this.currentLine++;
            if (this.currentLine >= this.currentDialogue.length) {
                this.endDialogue();
            }
        }
    }
    
    endDialogue() {
        this.active = false;
        this.currentDialogue = null;
        this.currentLine = 0;
    }
    
    render(ctx) {
        if (!this.active || !this.currentDialogue) return;
        
        const line = this.currentDialogue[this.currentLine];
        
        // Draw dialogue box
        const boxWidth = this.engine.gameWidth * 0.8;
        const boxHeight = 150;
        const boxX = (this.engine.gameWidth - boxWidth) / 2;
        const boxY = this.engine.gameHeight - boxHeight - 20;
        
        // Box background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Box border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Dialogue text
        ctx.fillStyle = 'white';
        ctx.font = '16px monospace';
        const textX = boxX + 20;
        const textY = boxY + 30;
        
        // Handle word wrapping
        const maxWidth = boxWidth - 40;
        const words = line.text.split(' ');
        let currentLine = '';
        let y = textY;
        
        // Draw speaker name if provided
        if (line.speaker) {
            ctx.fillStyle = '#ffcc00';
            ctx.fillText(line.speaker + ':', textX, y);
            y += 25;
        }
        
        ctx.fillStyle = 'white';
        for (const word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine !== '') {
                ctx.fillText(currentLine, textX, y);
                currentLine = word + ' ';
                y += 25;
            } else {
                currentLine = testLine;
            }
        }
        ctx.fillText(currentLine, textX, y);
        
        // Prompt for next line
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('Press E to continue', boxX + boxWidth - 200, boxY + boxHeight - 20);
    }
    
    update() {
        if (this.active && this.engine.keys.action) {
            this.engine.keys.action = false;
            this.nextLine();
        }
    }
}