class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.collected = false;
        this.frameCount = 0;
        this.currentFrame = 0;
        this.animationSpeed = 10;
        this.floatOffset = 0;
        this.floatSpeed = 0.05;
        this.floatAmplitude = 5;
        
        // Define item types
        this.types = {
            'map': {
                width: 24,
                height: 24,
                sprite: 'assets/map.svg',
                frames: 4,
                message: 'You found a map! It shows the location of the three scrolls.'
            },
            'scroll': {
                width: 16,
                height: 24,
                sprite: 'assets/scroll.svg',
                frames: 4,
                message: 'You found a scroll! It contains ancient wisdom.'
            },
            'key': {
                width: 16,
                height: 32,
                sprite: 'assets/key.svg',
                frames: 6,
                message: 'You found the key! Your quest is complete!'
            }
        };
        
        // Set dimensions based on type
        this.width = this.types[type].width;
        this.height = this.types[type].height;
        
        // Load sprite
        this.sprite = new Image();
        this.sprite.src = this.types[type].sprite;
    }
    
    update(engine) {
        if (this.collected) return;
        
        // Floating animation
        this.floatOffset = Math.sin(Date.now() * this.floatSpeed) * this.floatAmplitude;
        
        // Sprite animation
        this.frameCount++;
        if (this.frameCount >= this.animationSpeed) {
            this.frameCount = 0;
            this.currentFrame = (this.currentFrame + 1) % this.types[this.type].frames;
        }
    }
    
    render(ctx, cameraX, cameraY) {
        if (this.collected) return;
        
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY + this.floatOffset;
        
        // Draw item sprite
        ctx.drawImage(
            this.sprite,
            0, 0,
            this.width, this.height,
            screenX, screenY,
            this.width, this.height
        );
        
        // Draw interaction indicator when player is nearby
        const engine = ctx.canvas.engine;
        if (engine && engine.player && engine.player.isNear(this)) {
            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Press E to collect', screenX + this.width / 2, screenY - 10);
        }
    }
    
    collect(player) {
        if (!this.collected) {
            this.collected = true;
            player.collectItem(this);
            
            // Display message
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = this.types[this.type].message;
            document.body.appendChild(messageElement);
            
            // Remove message after a delay
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 3000);
        }
    }
    
    interact(player, engine) {
        this.collect(player);
    }
    
    onCollision(other) {
        // Optional: collect on collision
    }
}