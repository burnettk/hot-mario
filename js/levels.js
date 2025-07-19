class Level {
    constructor(name, width, height, tileSize = 32) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = new Array(height).fill(null).map(() => new Array(width).fill(0));
        this.entities = [];
        
        // Tile definitions
        this.tileTypes = {
            0: { solid: false, image: null }, // Empty/air
            1: { solid: true, image: 'brick' }, // Brick
            2: { solid: true, image: 'grass' }, // Grass
            3: { solid: false, image: 'background' }, // Background
            4: { solid: true, image: 'house' } // House
        };
        
        // Load tile images
        this.tileImages = {};
        for (const type in this.tileTypes) {
            if (this.tileTypes[type].image) {
                this.tileImages[type] = new Image();
                this.tileImages[type].src = `assets/${this.tileTypes[type].image}.svg`;
            }
        }
        
        // Background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'assets/background.svg';
    }
    
    setTile(x, y, type) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.tiles[y][x] = type;
        }
    }
    
    getTile(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.tiles[y][x];
        }
        return 1; // Default to solid tile for out of bounds
    }
    
    isSolidTile(x, y) {
        const tileType = this.getTile(x, y);
        return this.tileTypes[tileType] && this.tileTypes[tileType].solid;
    }
    
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    load(engine) {
        // Add all level entities to the game engine
        for (const entity of this.entities) {
            engine.addEntity(entity);
        }
    }
    
    render(ctx, cameraX, cameraY) {
        // Draw background
        ctx.drawImage(this.backgroundImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Calculate visible tile range
        const startX = Math.floor(cameraX / this.tileSize);
        const startY = Math.floor(cameraY / this.tileSize);
        const endX = Math.ceil((cameraX + ctx.canvas.width) / this.tileSize);
        const endY = Math.ceil((cameraY + ctx.canvas.height) / this.tileSize);
        
        // Draw visible tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tileType = this.getTile(x, y);
                if (tileType !== 0 && this.tileImages[tileType]) {
                    ctx.drawImage(
                        this.tileImages[tileType],
                        (x * this.tileSize) - cameraX,
                        (y * this.tileSize) - cameraY,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }
    }
}

class VillageLevel extends Level {
    constructor() {
        super('village', 50, 20);
        this.createVillage();
    }
    
    createVillage() {
        // Create ground
        for (let x = 0; x < this.width; x++) {
            // Main ground level
            this.setTile(x, 15, 1); // Brick base
            this.setTile(x, 14, 2); // Grass top
            
            // Fill in underground
            for (let y = 16; y < this.height; y++) {
                this.setTile(x, y, 1);
            }
        }
        
        // Create a house for the elderly advisor
        for (let x = 10; x <= 15; x++) {
            for (let y = 9; y <= 13; y++) {
                this.setTile(x, y, 4); // House tiles
            }
        }
        
        // Door
        this.setTile(12, 13, 0); // Remove brick for door
        this.setTile(13, 13, 0); // Remove brick for door
        
        // Add some platforms
        for (let x = 20; x <= 25; x++) {
            this.setTile(x, 12, 1);
            this.setTile(x, 11, 2);
        }
        
        for (let x = 30; x <= 35; x++) {
            this.setTile(x, 10, 1);
            this.setTile(x, 9, 2);
        }
        
        // Add elderly advisor NPC
        const advisor = new NPC(12 * this.tileSize, 12 * this.tileSize, 'elder');
        this.addEntity(advisor);
        
        // Add map collectible
        const map = new Collectible(22 * this.tileSize, 10 * this.tileSize, 'map');
        this.addEntity(map);
    }
}

class AdventureLevel extends Level {
    constructor() {
        super('adventure', 100, 20);
        this.createObstacleCourse();
    }
    
    createObstacleCourse() {
        // Create ground with gaps
        for (let x = 0; x < this.width; x++) {
            // Create gaps
            if ((x >= 15 && x <= 17) || 
                (x >= 30 && x <= 33) || 
                (x >= 50 && x <= 54) ||
                (x >= 70 && x <= 75)) {
                continue;
            }
            
            // Main ground level
            this.setTile(x, 15, 1); // Brick base
            this.setTile(x, 14, 2); // Grass top
            
            // Fill in underground
            for (let y = 16; y < this.height; y++) {
                this.setTile(x, y, 1);
            }
        }
        
        // Create platforms
        // Platform 1
        for (let x = 20; x <= 25; x++) {
            this.setTile(x, 12, 1);
            this.setTile(x, 11, 2);
        }
        
        // Platform 2
        for (let x = 35; x <= 40; x++) {
            this.setTile(x, 10, 1);
            this.setTile(x, 9, 2);
        }
        
        // Platform 3
        for (let x = 58; x <= 63; x++) {
            this.setTile(x, 8, 1);
            this.setTile(x, 7, 2);
        }
        
        // Platform 4 - Final platform with key
        for (let x = 85; x <= 95; x++) {
            this.setTile(x, 10, 1);
            this.setTile(x, 9, 2);
        }
        
        // Add scrolls
        const scroll1 = new Collectible(22 * this.tileSize, 10 * this.tileSize, 'scroll');
        const scroll2 = new Collectible(38 * this.tileSize, 8 * this.tileSize, 'scroll');
        const scroll3 = new Collectible(60 * this.tileSize, 6 * this.tileSize, 'scroll');
        
        this.addEntity(scroll1);
        this.addEntity(scroll2);
        this.addEntity(scroll3);
        
        // Add key at the end
        const key = new Collectible(90 * this.tileSize, 8 * this.tileSize, 'key');
        this.addEntity(key);
    }
}