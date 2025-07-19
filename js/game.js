document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const playerNameInput = document.getElementById('player-name');
    const startButton = document.getElementById('start-button');
    const gameCanvas = document.getElementById('game-canvas');
    
    // Initialize game
    const engine = new GameEngine('game-canvas');
    
    // Add game canvas reference to engine
    gameCanvas.engine = engine;
    
    // Create levels
    const villageLevel = new VillageLevel();
    const adventureLevel = new AdventureLevel();
    
    // Add levels to game engine
    engine.addLevel('village', villageLevel);
    engine.addLevel('adventure', adventureLevel);
    
    // Add additional CSS for messages
    const style = document.createElement('style');
    style.textContent = `
        .message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            border: 2px solid #ffcc00;
            font-family: monospace;
            font-size: 16px;
            z-index: 100;
        }
    `;
    document.head.appendChild(style);
    
    // Start game when player submits name
    startButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim() || 'Player';
        startGame(playerName);
    });
    
    // Also allow Enter key to start game
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const playerName = playerNameInput.value.trim() || 'Player';
            startGame(playerName);
        }
    });
    
    function startGame(playerName) {
        // Hide start screen, show game screen
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Create player with initial position in village
        const player = new Player(100, 400);
        player.name = playerName;
        
        // Add player to game engine
        engine.setPlayer(player);
        
        // Create dialogue system
        engine.dialogueSystem = new DialogueSystem(engine);
        
        // Load village level to start
        engine.loadLevel('village');
        
        // Start game loop
        engine.start();
        
        // Show welcome message
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'message';
        welcomeMsg.textContent = `Welcome, ${playerName}! Talk to the Elder in the village to begin your quest.`;
        document.body.appendChild(welcomeMsg);
        setTimeout(() => document.body.removeChild(welcomeMsg), 5000);
    }
    
    // Level transition function
    window.transitionToLevel = (levelName) => {
        const fadeEffect = document.createElement('div');
        fadeEffect.style.position = 'fixed';
        fadeEffect.style.top = '0';
        fadeEffect.style.left = '0';
        fadeEffect.style.width = '100%';
        fadeEffect.style.height = '100%';
        fadeEffect.style.backgroundColor = 'black';
        fadeEffect.style.opacity = '0';
        fadeEffect.style.transition = 'opacity 1s ease';
        fadeEffect.style.zIndex = '999';
        document.body.appendChild(fadeEffect);
        
        // Fade out
        setTimeout(() => {
            fadeEffect.style.opacity = '1';
        }, 10);
        
        // Change level and fade in
        setTimeout(() => {
            engine.loadLevel(levelName);
            fadeEffect.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(fadeEffect);
            }, 1000);
        }, 1000);
    };
    
    // Handle level transitions when player reaches edge
    function checkLevelTransition() {
        if (!engine.player) return;
        
        if (engine.currentLevel === villageLevel && engine.player.x > villageLevel.width * villageLevel.tileSize - 100) {
            // Transition from village to adventure level
            engine.player.x = 50;
            transitionToLevel('adventure');
        } else if (engine.currentLevel === adventureLevel && engine.player.x < 0) {
            // Transition from adventure back to village
            engine.player.x = villageLevel.width * villageLevel.tileSize - 150;
            transitionToLevel('village');
        }
    }
    
    // Add level transition check to game loop
    const originalUpdate = engine.update;
    engine.update = function() {
        originalUpdate.call(this);
        checkLevelTransition();
    };
});