class NPC {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 48;
        this.type = type;
        this.frameCount = 0;
        this.currentFrame = 0;
        this.animationSpeed = 12;
        
        // Define NPC types
        this.types = {
            'elder': {
                name: 'Elder',
                sprite: 'assets/elder.svg',
                frames: 2,
                dialogue: [
                    { speaker: 'Elder', text: 'Welcome to our village, young adventurer!' },
                    { speaker: 'Elder', text: 'I sense you are seeking the ancient key.' },
                    { speaker: 'Elder', text: 'First, find the map on the platform outside the village.' },
                    { speaker: 'Elder', text: 'Then venture to the east and collect the three sacred scrolls.' },
                    { speaker: 'Elder', text: 'Only with the knowledge from these scrolls will you be able to reach the key.' },
                    { speaker: 'Elder', text: 'Be careful! The path is treacherous and full of obstacles.' },
                    { speaker: 'Elder', text: 'Return to me if you need guidance on your journey.' }
                ]
            },
            'villager': {
                name: 'Villager',
                sprite: 'assets/elder.svg',
                frames: 2,
                dialogue: [
                    { speaker: 'Villager', text: 'Hello there! Lovely day, isn\'t it?' },
                    { speaker: 'Villager', text: 'I\'ve heard stories about a magical key hidden beyond the village.' },
                    { speaker: 'Villager', text: 'You should speak to the Elder if you\'re interested in finding it.' }
                ]
            }
        };
        
        // Load sprite
        this.sprite = new Image();
        this.sprite.src = this.types[type].sprite;
    }
    
    update() {
        // Simple idle animation
        this.frameCount++;
        if (this.frameCount >= this.animationSpeed) {
            this.frameCount = 0;
            this.currentFrame = (this.currentFrame + 1) % this.types[this.type].frames;
        }
    }
    
    render(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        // Draw NPC sprite
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
            ctx.fillText('Press E to talk', screenX + this.width / 2, screenY - 10);
        }
    }
    
    interact(player, engine) {
        if (!engine.dialogueSystem) {
            engine.dialogueSystem = new DialogueSystem(engine);
        }
        
        // Different dialogue based on game progress
        let dialogueId = `${this.type}_default`;
        engine.dialogueSystem.addDialogue(dialogueId, this.types[this.type].dialogue);
        
        // If player has map, update dialogue
        if (player.inventory.hasMap && this.type === 'elder') {
            dialogueId = 'elder_has_map';
            engine.dialogueSystem.addDialogue(dialogueId, [
                { speaker: 'Elder', text: 'Ah, you found the map! Excellent.' },
                { speaker: 'Elder', text: 'Now you must seek out the three scrolls.' },
                { speaker: 'Elder', text: `You've found ${player.inventory.scrollsCollected} out of ${player.inventory.totalScrolls} scrolls so far.` },
                { speaker: 'Elder', text: 'Return to me when you have all three scrolls.' }
            ]);
        }
        
        // If player has all scrolls, update dialogue
        if (player.inventory.scrollsCollected >= player.inventory.totalScrolls && this.type === 'elder') {
            dialogueId = 'elder_has_scrolls';
            engine.dialogueSystem.addDialogue(dialogueId, [
                { speaker: 'Elder', text: 'Impressive! You have collected all the scrolls!' },
                { speaker: 'Elder', text: 'The knowledge within them will guide you to the key.' },
                { speaker: 'Elder', text: 'It lies at the end of a treacherous path to the east.' },
                { speaker: 'Elder', text: 'May fortune favor your journey!' }
            ]);
        }
        
        // If player has key, update dialogue
        if (player.inventory.hasKey && this.type === 'elder') {
            dialogueId = 'elder_has_key';
            engine.dialogueSystem.addDialogue(dialogueId, [
                { speaker: 'Elder', text: 'You found the key! Incredible!' },
                { speaker: 'Elder', text: 'You have completed your quest, brave adventurer.' },
                { speaker: 'Elder', text: 'With this key, many doors will open for you.' },
                { speaker: 'Elder', text: 'Congratulations on your successful journey!' }
            ]);
        }
        
        engine.dialogueSystem.startDialogue(dialogueId);
    }
    
    onCollision(other) {
        // Handle collisions if needed
    }
}