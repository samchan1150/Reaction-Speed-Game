// leaderboard.js

// DOM Elements
const leaderboardBody = document.getElementById('leaderboard-body');
const backButton = document.getElementById('back-btn');
const timeModeBtn = document.getElementById('time-mode-btn');
const clickModeBtn = document.getElementById('click-mode-btn');
const scoreHeader = document.getElementById('score-header');

/**
 * Retrieves and parses leaderboard data from localStorage.
 * @param {string} key - The key for the leaderboard in localStorage.
 * @returns {Array} An array of leaderboard entries.
 */
function getLeaderboardData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

/**
 * Renders the leaderboard table rows in the DOM.
 * @param {Array} data - The leaderboard data.
 * @param {string} mode - The game mode ('time' or 'click').
 */
function renderLeaderboard(data, mode) {
    leaderboardBody.innerHTML = '';

    if (data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = 'No scores yet.';
        tr.appendChild(td);
        leaderboardBody.appendChild(tr);
        return;
    }

    data.forEach((entry, index) => {
        const tr = document.createElement('tr');

        // Rank
        const rankTd = document.createElement('td');
        rankTd.textContent = index + 1;
        tr.appendChild(rankTd);

        // Player
        const playerTd = document.createElement('td');
        playerTd.textContent = entry.playerName; // Ensure 'playerName' exists
        tr.appendChild(playerTd);

        // Score
        const scoreTd = document.createElement('td');
        if (mode === 'time') {
            scoreTd.textContent = `${entry.clicksPerSecond} clicks/sec`;
        } else if (mode === 'click') {
            scoreTd.textContent = `${entry.secondsPerClick} sec/click`;
        }
        tr.appendChild(scoreTd);

        // Date
        const dateTd = document.createElement('td');
        dateTd.textContent = entry.date;
        tr.appendChild(dateTd);

        leaderboardBody.appendChild(tr);
    });
}

/**
 * Initializes the leaderboard display.
 */
function initializeLeaderboard() {
    showTimeMode(); // Default mode
}

/**
 * Shows Time Mode leaderboard.
 */
function showTimeMode() {
    const leaderboardTime = getLeaderboardData('leaderboardTime');
    renderLeaderboard(leaderboardTime, 'time');

    // Update active button
    timeModeBtn.classList.add('active');
    clickModeBtn.classList.remove('active');

    // Update score header
    scoreHeader.textContent = 'Clicks/sec';
}

/**
 * Shows Click Mode leaderboard.
 */
function showClickMode() {
    const leaderboardClick = getLeaderboardData('leaderboardClick');
    renderLeaderboard(leaderboardClick, 'click');

    // Update active button
    clickModeBtn.classList.add('active');
    timeModeBtn.classList.remove('active');

    // Update score header
    scoreHeader.textContent = 'Sec/Click';
}

// Event Listeners
timeModeBtn.addEventListener('click', showTimeMode);
clickModeBtn.addEventListener('click', showClickMode);

// Event listener for the Back button
backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initialize leaderboard on page load
document.addEventListener('DOMContentLoaded', initializeLeaderboard);