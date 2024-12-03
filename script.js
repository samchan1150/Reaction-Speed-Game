// script.js

// DOM Elements
const startButton = document.getElementById('start-btn');
const modeSelection = document.getElementById('mode-selection');
const durationSelection = document.getElementById('duration-selection');
const clickSelection = document.getElementById('click-selection');
const durationButtons = document.querySelectorAll('.duration-btn');
const clickButtons = document.querySelectorAll('.click-btn');
const customButtons = document.querySelectorAll('.custom-btn');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const target = document.getElementById('target');
const timerDisplay = document.getElementById('time-display');
const clickDisplay = document.getElementById('click-display');
const statusBar = document.getElementById('status-bar');
const stats = document.getElementById('stats');
const scoreText = document.getElementById('score-text');
const scoreValue = document.getElementById('score-value');
const bestScoreDisplay = document.getElementById('best-score');
const restartButton = document.getElementById('restart-btn');
const leaderboardButton = document.getElementById('leaderboard-btn');
const playerNameInput = document.getElementById('player-name');

// Game Variables
let gameMode = 'time'; // Default mode
let gameDuration = 15; // Default duration for Time Mode in seconds
let clickTarget = 10; // Default number of clicks for Click Mode
let countdownInterval;
let gameStartTime;
let clicks = 0;
let playerName = '';

// Best Scores
let bestClicksPerTime = JSON.parse(localStorage.getItem('bestClicksPerTime')) || {
    '15': 0,
    '30': 0,
    '60': 0
};

let bestTimePerClick = JSON.parse(localStorage.getItem('bestTimePerClick')) || {
    '10': Infinity,
    '25': Infinity,
    '50': Infinity
};


/**
 * Generates random positions for the target within the game container.
 * Ensures that the entire target is within the bounds.
 * @returns {Object} An object containing x and y coordinates.
 */
function getRandomPosition() {
    const containerRect = gameContainer.getBoundingClientRect();

    // Retrieve target dimensions from computed styles
    const targetStyles = window.getComputedStyle(target);
    const targetWidth = parseFloat(targetStyles.width);
    const targetHeight = parseFloat(targetStyles.height);

    const maxX = Math.floor(containerRect.width - targetWidth);
    const maxY = Math.floor(containerRect.height - targetHeight);

    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);

    return {
        x,
        y
    };
}

/**
 * Displays the target at a random position immediately.
 */
function showTarget() {
    const { x, y } = getRandomPosition();
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    target.style.display = 'block';
}

/**
 * Starts the countdown timer for Time Mode.
 */
function startCountdown() {
    let timeLeft = gameDuration;
    timerDisplay.textContent = timeLeft;
    timerDisplay.parentElement.classList.remove('hidden');

    countdownInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            endGame();
        }
    }, 1000);
}

/**
 * Starts the game by initializing necessary elements and showing the first target.
 */
function startGame() {
    // Retrieve and validate the player's name
    playerName = playerNameInput.value.trim();
    if (playerName === '') {
        alert('Please enter your name to start the game.');
        return;
    }
    const selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
    gameMode = selectedMode;

    startScreen.classList.add('hidden');
    stats.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    clicks = 0;
    clickDisplay.textContent = clicks;

    if (gameMode === 'time') {
        statusBar.classList.remove('hidden');
        timerDisplay.parentElement.classList.remove('hidden');
        clickDisplay.parentElement.classList.remove('hidden');
        startCountdown();
    } else if (gameMode === 'click') {
        statusBar.classList.remove('hidden');
        timerDisplay.parentElement.classList.add('hidden');
        clickDisplay.parentElement.classList.remove('hidden');
        gameStartTime = Date.now();
    }

    showTarget();
}

/**
 * Ends the game by clearing timers and hiding the game container.
 */
function endGame() {
    clearInterval(countdownInterval);
    target.style.display = 'none';
    gameContainer.classList.add('hidden');
    displayStats();
}

// Leaderboards Initialization
let leaderboardTime = JSON.parse(localStorage.getItem('leaderboardTime')) || [];
let leaderboardClick = JSON.parse(localStorage.getItem('leaderboardClick')) || [];

/**
 * Adds the current score to the appropriate leaderboard and updates localStorage.
 * @param {Object} score - The score to add.
 */
function updateLeaderboard(score) {
    // Attach the player's name to the score object
    score.playerName = playerName;
    
    if (gameMode === 'time') {
        leaderboardTime.push(score);
        leaderboardTime.sort((a, b) => b.clicksPerSecond - a.clicksPerSecond);
        if (leaderboardTime.length > 10) {
            leaderboardTime.pop();
        }
        localStorage.setItem('leaderboardTime', JSON.stringify(leaderboardTime));
    } else if (gameMode === 'click') {
        leaderboardClick.push(score);
        leaderboardClick.sort((a, b) => a.secondsPerClick - b.secondsPerClick);
        if (leaderboardClick.length > 10) {
            leaderboardClick.pop();
        }
        localStorage.setItem('leaderboardClick', JSON.stringify(leaderboardClick));
    }
}

/**
 * Displays the game statistics and updates best scores.
 */
function displayStats() {
    if (gameMode === 'time') {
        // Primary Score: Total Clicks
        const totalClicks = clicks;
        // Performance Metric: Clicks per Second (CPS)
        const clicksPerSecond = (totalClicks / gameDuration).toFixed(2);
        scoreText.textContent = `Your score: ${totalClicks} clicks (${clicksPerSecond} clicks/sec)`;

        // Check and update highscore for predefined durations
        if (['15', '30', '60'].includes(gameDuration.toString())) {
            const currentBest = bestClicksPerTime[gameDuration];
            if (parseFloat(clicksPerSecond) > parseFloat(currentBest)) {
                bestClicksPerTime[gameDuration] = clicksPerSecond;
                localStorage.setItem('bestClicksPerTime', JSON.stringify(bestClicksPerTime));
                alert(`New best score for ${gameDuration} seconds: ${clicksPerSecond} clicks/sec!`);
            }
        }

        const newScore = {
            date: new Date().toLocaleString(),
            clicksPerSecond: parseFloat(clicksPerSecond)
        };
        updateLeaderboard(newScore);

    } else if (gameMode === 'click') {
        // Primary Score: Total Time in Seconds
        const totalTime = (Date.now() - gameStartTime) / 1000; // in seconds
        const formattedTime = totalTime.toFixed(2);
        // Performance Metric: Seconds per Click (SPC)
        const secondsPerClick = (totalTime / clicks).toFixed(2);
        scoreText.textContent = `Your score: ${formattedTime} seconds (${secondsPerClick} sec/click)`;

        // Check and update highscore for predefined click targets
        if (['10', '25', '50'].includes(clickTarget.toString())) {
            const currentBest = bestTimePerClick[clickTarget];
            if (parseFloat(secondsPerClick) < parseFloat(currentBest)) {
                bestTimePerClick[clickTarget] = secondsPerClick;
                localStorage.setItem('bestTimePerClick', JSON.stringify(bestTimePerClick));
                alert(`New best score for ${clickTarget} clicks: ${secondsPerClick} sec/click!`);
            }
        }

        const newScore = {
            date: new Date().toLocaleString(),
            secondsPerClick: parseFloat(secondsPerClick)
        };
        updateLeaderboard(newScore);
    }

    // Update the score value display for end-of-game screen
    scoreValue.textContent = scoreText.textContent;

    // Update the best score display
    updateBestScoreDisplay();

    stats.classList.remove('hidden');
}

/**
 * Updates the best score display based on the current game mode and predefined values.
 */
function updateBestScoreDisplay() {
    if (gameMode === 'time') {
        if (['15', '30', '60'].includes(gameDuration.toString())) {
            bestScoreDisplay.textContent = `${bestClicksPerTime[gameDuration]} clicks/sec`;
        } else {
            bestScoreDisplay.textContent = '-';
        }
    } else if (gameMode === 'click') {
        if (['10', '25', '50'].includes(clickTarget.toString())) {
            bestScoreDisplay.textContent = `${bestTimePerClick[clickTarget]} sec/click`;
        } else {
            bestScoreDisplay.textContent = '-';
        }
    }
}

/**
 * Handles target click events based on the current game mode.
 */
target.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event from bubbling up to gameContainer

    if (target.style.display === 'block') {
        target.style.display = 'none';

        if (gameMode === 'time') {
            clicks++;
            clickDisplay.textContent = clicks;
            showTarget();
        } else if (gameMode === 'click') {
            clicks++;
            clickDisplay.textContent = clicks;
            if (clicks >= clickTarget) {
                endGame();
            } else {
                showTarget();
            }
        }
    }
});

/**
 * Prevents clicks on the game container from affecting the game in Click Mode.
 */
gameContainer.addEventListener('click', (e) => {
    // Do nothing if click is outside the target in Click Mode
    if (gameMode === 'click') {
        return;
    }

    if (e.target === gameContainer && target.style.display === 'block') {
        if (gameMode === 'time') {
            // In Time Mode, clicks outside the target are ignored
            // Optionally, you can track missed clicks here
        }
    }
});

/**
 * Initializes the game mode selection and hides relevant elements.
 */
startButton.addEventListener('click', startGame);

/**
 * Event listeners for predefined duration buttons in Time Mode.
 */
durationButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedDuration = button.getAttribute('data-duration');
        if (['15', '30', '60'].includes(selectedDuration)) {
            gameDuration = parseInt(selectedDuration);
            durationSelection.classList.add('hidden');
            startGame();
        } else {
            // Handle unexpected durations if necessary
            alert('Selected duration is not supported.');
        }
    });
});

/**
 * Event listeners for predefined click buttons in Click Mode.
 */
clickButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedClicks = button.getAttribute('data-clicks');
        if (['10', '25', '50'].includes(selectedClicks)) {
            clickTarget = parseInt(selectedClicks);
            clickSelection.classList.add('hidden');
            startGame();
        } else {
            // Handle unexpected click targets if necessary
            alert('Selected number of clicks is not supported.');
        }
    });
});

/**
 * Event listeners for custom input buttons in both modes.
 */
customButtons.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.getAttribute('data-type');
        const input = prompt(type === 'time' ? 'Enter custom time in seconds:' : 'Enter custom number of clicks:');
        if (input !== null) {
            if (type === 'time') {
                const customTime = parseInt(input);
                if (!isNaN(customTime) && customTime > 0) {
                    gameDuration = customTime;
                } else {
                    alert('Invalid time entered. Please enter a positive number.');
                    return;
                }
            } else if (type === 'click') {
                const customClicks = parseInt(input);
                if (!isNaN(customClicks) && customClicks > 0) {
                    clickTarget = customClicks;
                } else {
                    alert('Invalid number of clicks entered. Please enter a positive number.');
                    return;
                }
            }
            button.parentElement.classList.add('hidden');
            startGame();
        }
    });
});

/**
 * Event listener for the Restart button to reset the game state.
 */
restartButton.addEventListener('click', () => {
    stats.classList.add('hidden');
    startScreen.classList.remove('hidden');
    startButton.classList.remove('hidden');

    // Show the mode selection again when restarting
    modeSelection.classList.remove('hidden');
});

/**
 * Event listener for the Leaderboard button to navigate to the leaderboard page.
 */
leaderboardButton.addEventListener('click', () => {
    window.location.href = 'leaderboard.html';
});