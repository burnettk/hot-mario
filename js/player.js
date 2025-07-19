class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 48;
        this.velX = 0;
        this.velY = 0;
        this.speed = 5;
        this.jumpStrength = -12;
        this.maxVelY = 15;
        this.grounded = false;
        this.direction = 'right';
        this.state = 'idle';
        this.frameCount = 0;
        this.currentFrame = 0;
        this.animationSpeed = 6;
        this.animations = {
            idle: { frames: 2, frameWidth: 32, frameHeight: 48 },
            run: { frames: 4, frameWidth: 32, frameHeight: 48 },
            jump: { frames: 1, frameWidth: 32, frameHeight: 48 },
            fall: { frames: 1, frameWidth: 32, frameHeight: 48 }
        };
        this.sprite = new Image();
        this.sprite.src = 'assets/player.svg';
        
        this.inventory = {
            hasMap: false,
            scrollsCollected: 0,
            totalScrolls: 3,
            hasKey: false
        };
        
        this.interactionRadius = 50;
    }
    
    update(engine) {
        // Update player state
        if (this.grounded) {
            if (Math.abs(this.velX) > 0.5) {
                this.state = 'run';
            } else {
                this.state = 'idle';
            }
        } else {
            if (this.velY < 0) {
                this.state = 'jump';
            } else {
                this.state = 'fall';
            }
        }
        
        // Handle horizontal movement
        if (engine.keys.right) {
            this.velX = this.speed;
            this.direction = 'right';
        } else if (engine.keys.left) {
            this.velX = -this.speed;
            this.direction = 'left';
        } else {
            // Apply friction
            if (this.velX > 0) {
                this.velX = Math.max(0, this.velX - 0.5);
            } else if (this.velX < 0) {
                this.velX = Math.min(0, this.velX + 0.5);
            }
        }
        
        // Handle jumping
        if (engine.keys.up && this.grounded) {
            this.velY = this.jumpStrength;
            this.grounded = false;
        }
        
        // Apply gravity
        this.velY += engine.gravity;
        if (this.velY > this.maxVelY) {
            this.velY = this.maxVelY;
        }
        
        // Update position and handle collisions
        this.x += this.velX;
        
        // Check horizontal collision
        const horizontalCollision = engine.checkCollision(this, 'horizontal');
        if (horizontalCollision.collision) {
            if (this.velX > 0) {
                // Moving right, collided with a tile on the right
                this.x = horizontalCollision.tileX * engine.tileSize - this.width;
            } else if (this.velX < 0) {
                // Moving left, collided with a tile on the left
                this.x = (horizontalCollision.tileX + 1) * engine.tileSize;
            }
            this.velX = 0;
        }
        
        this.y += this.velY;
        
        // Check vertical collision
        const verticalCollision = engine.checkCollision(this, 'vertical');
        if (verticalCollision.collision) {
            if (this.velY > 0) {
                // Moving down, collided with ground
                this.y = verticalCollision.tileY * engine.tileSize - this.height;
                this.grounded = true;
            } else if (this.velY < 0) {
                // Moving up, collided with ceiling
                this.y = (verticalCollision.tileY + 1) * engine.tileSize;
            }
            this.velY = 0;
        } else {
            this.grounded = false;
        }
        
        // Check for entity collisions
        engine.checkEntityCollision(this);
        
        // Handle interaction with NPCs and items
        if (engine.keys.action) {
            this.interact(engine);
        }
        
        // Update animation
        this.frameCount++;
        if (this.frameCount >= this.animationSpeed) {
            this.frameCount = 0;
            this.currentFrame = (this.currentFrame + 1) % this.animations[this.state].frames;
        }
    }
    
    render(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        // Draw player sprite
        ctx.drawImage(
            this.sprite,
            0, 0,
            32, 48,
            screenX, screenY,
            this.width, this.height
        );
        
        // Flip horizontally if facing left
        if (this.direction === 'left') {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.sprite,
                0, 0,
                32, 48,
                -screenX - this.width, screenY,
                this.width, this.height
            );
            ctx.restore();
        }
    }
    
    interact(engine) {
        // Check for nearby NPCs or items to interact with
        for (const entity of engine.entities) {
            if ((entity instanceof NPC || entity instanceof Collectible) && this.isNear(entity)) {
                entity.interact(this, engine);
                return;
            }
        }
    }
    
    isNear(entity) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const entityCenterX = entity.x + entity.width / 2;
        const entityCenterY = entity.y + entity.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(centerX - entityCenterX, 2) + 
            Math.pow(centerY - entityCenterY, 2)
        );
        
        return distance < this.interactionRadius;
    }
    
    onCollision(other) {
        // Handle collision with other entities
        if (other instanceof Collectible) {
            other.collect(this);
        }
    }
    
    collectItem(item) {
        switch(item.type) {
            case 'map':
                this.inventory.hasMap = true;
                break;
            case 'scroll':
                this.inventory.scrollsCollected++;
                break;
            case 'key':
                this.inventory.hasKey = true;
                break;
        }
    }
}