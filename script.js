document.addEventListener('DOMContentLoaded', () => {
    console.log("PickleClicker initialized");

    const startScreen = document.getElementById('start-screen');
    const game2StartScreen = document.getElementById('game2-start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startBtn = document.getElementById('start-btn');
    const game2StartBtn = document.getElementById('game2-start-btn');

    // Toggle Buttons
    const game2UnlockBtn = document.getElementById('game2-unlock-btn');
    const game1SwitchBtn = document.getElementById('game1-switch-btn');

    // UI Elements for Transition
    const headerEl = document.getElementById('header');
    const catContainerEl = document.getElementById('cat-container');
    const stickersContainerEl = document.getElementById('stickers-container');
    const upgradeListContEl = document.getElementById('upgrade-list');
    const settingsAreaEl = document.getElementById('settings-area');

    // Game 2 UI Elements
    const game2Screen = document.getElementById('game2-screen');
    const game2HeaderEl = document.getElementById('game2-header-wrapper');
    const game2BackgroundContEl = document.getElementById('game2-background-container');
    const game2StoreListContEl = document.getElementById('game2-store-list');
    const game2SettingsAreaEl = document.getElementById('game2-settings-area');
    const game2BiscuitCountEl = document.getElementById('game2-biscuit-count');

    // Initialize Game Screen state
    gameScreen.classList.remove('hidden');

    // Hide upgrades using visibility so they still reserve space for the background layout
    upgradeListContEl.style.visibility = 'hidden';
    upgradeListContEl.style.opacity = '0';
    upgradeListContEl.style.pointerEvents = 'none';

    settingsAreaEl.style.visibility = 'hidden';
    settingsAreaEl.style.opacity = '0';
    settingsAreaEl.style.pointerEvents = 'none';

    // Game 2 initial layout hide
    if (game2StoreListContEl) {
        game2StoreListContEl.style.visibility = 'hidden';
        game2StoreListContEl.style.opacity = '0';
        game2StoreListContEl.style.pointerEvents = 'none';
        game2SettingsAreaEl.style.visibility = 'hidden';
        game2SettingsAreaEl.style.opacity = '0';
        game2SettingsAreaEl.style.pointerEvents = 'none';
    }

    // Check if Game 2 is unlocked
    const savedLeaderboardStr = localStorage.getItem('pickleClickerLeaderboard');
    if (savedLeaderboardStr) {
        try {
            const leaderboard = JSON.parse(savedLeaderboardStr);
            // Only unlock if at least one score has biscuitsLeft (is an object)
            const hasValidScore = leaderboard.some(entry => typeof entry === 'object' && entry !== null && 'biscuitsLeft' in entry);
            if (hasValidScore) {
                game2UnlockBtn.classList.remove('hidden');
            }
        } catch (e) {
            console.error("Failed to parse leaderboard on load");
        }
    }

    game2UnlockBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        game2StartScreen.classList.remove('hidden');
        // Pre-load the Game 2 background so it shows behind the start screen if it ever becomes transparent,
        // or just to have it ready
        bgImage.src = 'assets/bg_game_stonks.png';
    });

    game1SwitchBtn.addEventListener('click', () => {
        game2StartScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        bgImage.src = 'assets/bg_game.png';
    });

    game2StartBtn.addEventListener('click', () => {
        let game2Biscuits = 0;
        const savedLeaderboardStr = localStorage.getItem('pickleClickerLeaderboard');
        if (savedLeaderboardStr) {
            try {
                const leaderboard = JSON.parse(savedLeaderboardStr);
                // Find the best score (lowest) that has biscuitsLeft. Since it's sorted ascending by score,
                // the first one we find that is an object with biscuitsLeft is the correct one.
                const bestValidEntry = leaderboard.find(entry => typeof entry === 'object' && entry !== null && 'biscuitsLeft' in entry);
                if (bestValidEntry) {
                    game2Biscuits = bestValidEntry.biscuitsLeft;
                }
            } catch (e) {
                console.error("Failed to parse leaderboard for starting balance");
            }
        }

        // Slide out start screen components
        game2StartScreen.classList.add('slide-up');
        gameScreen.classList.add('hidden'); // Hide Game 1 container to be safe
        game2Screen.classList.remove('hidden');

        // Init biscuits visual
        if(game2BiscuitCountEl) game2BiscuitCountEl.textContent = Number(game2Biscuits).toLocaleString();

        // Prepare to show game 2 UI
        setTimeout(() => {
            if(game2HeaderEl) game2HeaderEl.classList.remove('ui-offscreen-top');

            // Re-apply visible state to layout elements
            if(game2StoreListContEl) {
                game2StoreListContEl.style.visibility = 'visible';
                game2StoreListContEl.style.opacity = '1';
                game2StoreListContEl.style.pointerEvents = 'auto';
            }

            if(game2SettingsAreaEl) {
                game2SettingsAreaEl.style.visibility = 'visible';
                game2SettingsAreaEl.style.opacity = '1';
                game2SettingsAreaEl.style.pointerEvents = 'auto';
            }

            if (typeof initStonksChart === 'function') initStonksChart();
        }, 100);

        setTimeout(() => {
            game2StartScreen.classList.add('hidden');
        }, 1000);
    });

    startBtn.addEventListener('click', () => {
        // Slide out start screen components
        startScreen.classList.add('slide-up');

        // Prepare to show game UI
        setTimeout(() => {
            headerEl.classList.remove('ui-offscreen-top');
            catContainerEl.classList.remove('ui-offscreen-bottom');
            stickersContainerEl.classList.remove('ui-offscreen-bottom');

            // Restore upgrade list visibility
            upgradeListContEl.style.visibility = 'visible';
            upgradeListContEl.style.opacity = '1';
            upgradeListContEl.style.pointerEvents = 'auto';

            settingsAreaEl.style.visibility = 'visible';
            settingsAreaEl.style.opacity = '1';
            settingsAreaEl.style.pointerEvents = 'auto';
        }, 100); // Slight delay for smoother transition start

        // Fully hide start screen container after transition
        setTimeout(() => {
            startScreen.classList.add('hidden');

            // Show instructions modal after game UI loads if not already seen/game loaded
            if (totalClicks === 0 && biscuits === 0) {
                const instrModal = document.getElementById('instructions-modal');
                if (instrModal) {
                    instrModal.classList.remove('hidden');
                }
            }
        }, 1000);
    });

    // Instructions OK button
    const instrOkBtn = document.getElementById('instructions-ok');
    if (instrOkBtn) {
        instrOkBtn.addEventListener('click', () => {
            document.getElementById('instructions-modal').classList.add('hidden');
        });
    }

    // --- END GAME & LEADERBOARD ---
    function checkEndGame() {
        if (lifetimeBiscuits >= 1000000) {
            const wasEnded = gameEnded;
            gameEnded = true;

            // Calculate final score
            const finalScore = totalClicks + totalBiscuitsSpent;

            // Load leaderboard
            let leaderboard = [];
            const savedLeaderboard = localStorage.getItem('pickleClickerLeaderboard');
            if (savedLeaderboard) {
                try {
                    leaderboard = JSON.parse(savedLeaderboard);
                } catch (e) {
                    console.error("Failed to parse leaderboard");
                }
            }

            // Add new score if it wasn't already ended
            if (!wasEnded) {
                leaderboard.push({ score: finalScore, biscuitsLeft: biscuits });
            }

            // Sort ascending (lower is better)
            leaderboard.sort((a, b) => {
                const scoreA = typeof a === 'object' ? a.score : a;
                const scoreB = typeof b === 'object' ? b.score : b;
                return scoreA - scoreB;
            });

            // Keep top 5
            leaderboard = leaderboard.slice(0, 5);

            // Save leaderboard
            localStorage.setItem('pickleClickerLeaderboard', JSON.stringify(leaderboard));

            // Populate leaderboard UI
            const listEl = document.getElementById('leaderboard-list');
            listEl.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const li = document.createElement('li');
                const scoreEntry = i < leaderboard.length ? leaderboard[i] : null;
                const scoreValue = scoreEntry !== null ? (typeof scoreEntry === 'object' ? scoreEntry.score : scoreEntry) : 0;
                li.textContent = `${i + 1}. ${scoreValue.toLocaleString()}`;

                // Highlight the newly achieved score exactly once
                if (scoreValue === finalScore && i < leaderboard.length) {
                    // Make sure we only highlight it once in case of exact ties
                    if (!listEl.querySelector('.current-score')) {
                        li.classList.add('current-score');
                    }
                }
                listEl.appendChild(li);
            }

            // Show End Game Modal
            document.getElementById('endgame-modal').classList.remove('hidden');
        }
    }

    const endgameResetBtn = document.getElementById('endgame-reset');
    if (endgameResetBtn) {
        endgameResetBtn.addEventListener('click', () => {
            localStorage.removeItem('pickleClickerSave');
            location.reload();
        });
    }

    // --- CUSTOM MODAL ---
    function showConfirmModal(message) {
        return new Promise((resolve) => {
            customModalMessage.textContent = message;
            customModal.classList.remove('hidden');

            const handleYes = () => {
                cleanup();
                resolve(true);
            };

            const handleNo = () => {
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                customModal.classList.add('hidden');
                customModalYes.removeEventListener('click', handleYes);
                customModalNo.removeEventListener('click', handleNo);
            };

            customModalYes.addEventListener('click', handleYes);
            customModalNo.addEventListener('click', handleNo);
        });
    }

    // Game Variables
    let biscuits = 0;
    let tapMultiplier = 1;
    let lifetimeBiscuits = 0;
    let totalClicks = 0;
    let totalBiscuitsSpent = 0;
    let gameEnded = false;

    // Upgrades Data
    const defaultUpgradesData = [
        { id: 'blanket', name: 'Blanket', baseCost: 50, currentCost: 50, count: 0, totalPurchased: 0, multiplier: 2, isSunbeam: false },
        { id: 'pillow', name: 'Pillow', baseCost: 400, currentCost: 400, count: 0, totalPurchased: 0, multiplier: 4, isSunbeam: false },
        { id: 'spring_toy', name: 'Spring Toy', baseCost: 800, currentCost: 800, count: 0, totalPurchased: 0, multiplier: 8, isSunbeam: false },
        { id: 'carboard_box', name: 'Cardboard Box', baseCost: 1600, currentCost: 1600, count: 0, totalPurchased: 0, multiplier: 16, isSunbeam: false },
        { id: 'mouse_toy', name: 'Mouse Toy', baseCost: 3200, currentCost: 3200, count: 0, totalPurchased: 0, multiplier: 32, isSunbeam: false },
        { id: 'sunbeam', name: 'Sunbeam', baseCost: 2000, currentCost: 2000, count: 0, totalPurchased: 0, multiplier: 0, isSunbeam: true }, // Special item
        { id: 'cat_tree', name: 'Cat Tree', baseCost: 6400, currentCost: 6400, count: 0, totalPurchased: 0, multiplier: 64, isSunbeam: false },
        { id: 'motivational_poster', name: 'Motivational Poster', baseCost: 12800, currentCost: 12800, count: 0, totalPurchased: 0, multiplier: 128, isSunbeam: false }
    ];
    let upgradesData = JSON.parse(JSON.stringify(defaultUpgradesData));

    // Sunbeam State
    let sunbeamActive = false;
    let sunbeamInterval = null;
    let sunbeamTimeRemaining = 0; // in milliseconds

    function saveGame() {
        if (gameEnded) return; // Stop saving state once game ends
        const gameState = {
            biscuits,
            lifetimeBiscuits,
            totalClicks,
            totalBiscuitsSpent,
            tapMultiplier,
            upgradesData,
            sunbeamTimeRemaining
        };
        localStorage.setItem('pickleClickerSave', JSON.stringify(gameState));
    }

    function loadGame() {
        const savedData = localStorage.getItem('pickleClickerSave');
        if (savedData) {
            try {
                const gameState = JSON.parse(savedData);
                biscuits = gameState.biscuits || 0;
                lifetimeBiscuits = gameState.lifetimeBiscuits || 0;
                totalClicks = gameState.totalClicks || 0;
                totalBiscuitsSpent = gameState.totalBiscuitsSpent || 0;
                tapMultiplier = gameState.tapMultiplier || 1;
                sunbeamTimeRemaining = gameState.sunbeamTimeRemaining || 0;

                // Check end game on load in case they somehow refreshed while exactly at 1m+
                if (lifetimeBiscuits >= 1000000) {
                    gameEnded = true;
                    setTimeout(checkEndGame, 1500); // Wait for UI to render then show popup
                }

                // Merge loaded upgrades with defaults to prevent issues if game updates
                if (gameState.upgradesData) {
                    upgradesData = gameState.upgradesData;

                    // Add totalPurchased backwards compatibility for older saves
                    upgradesData.forEach(u => {
                        if (u.totalPurchased === undefined) {
                            u.totalPurchased = u.isSunbeam ? 0 : u.count; // Old sunbeam counts weren't tracked for price
                        }
                    });

                    // Trigger global visibility update
                    updateStickerVisibility();
                }

                if (sunbeamTimeRemaining > 0) {
                    resumeSunbeam();
                }
            } catch (e) {
                console.error("Error loading save file", e);
            }
        }
    }

    // DOM Elements
    const biscuitCountEl = document.getElementById('biscuit-count');
    const catImage = document.getElementById('cat-image');
    const upgradeListEl = document.getElementById('upgrade-list');

    // Developer Mode State
    let devModeActive = false;
    let selectedSticker = null;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // Developer Mode Elements
    const devModeBtn = document.getElementById('dev-mode-btn');
    const game2DevModeBtn = document.getElementById('game2-dev-mode-btn');
    const devModePanel = document.getElementById('dev-mode-panel');
    const devBgToggleBtn = document.getElementById('dev-bg-toggle');
    const devCatCycleBtn = document.getElementById('dev-cat-cycle-btn');
    const devSelectedStickerText = document.getElementById('dev-selected-sticker');
    const devScaleInput = document.getElementById('dev-scale');
    const devZIndexInput = document.getElementById('dev-zindex');
    const devFlipInput = document.getElementById('dev-flip');
    const devOutput = document.getElementById('dev-output');

    // Custom Modal Elements
    const customModal = document.getElementById('custom-modal');
    const customModalMessage = document.getElementById('custom-modal-message');
    const customModalYes = document.getElementById('custom-modal-yes');
    const customModalNo = document.getElementById('custom-modal-no');
    const devCloseBtn = document.getElementById('dev-close-btn');
    const stickersContainer = document.getElementById('stickers-container');
    const bgImage = document.getElementById('bg-image');

    // Cat Animation State
    const catImages = [
        'assets/cat_left.png',
        'assets/cat_middle.png',
        'assets/cat_right.png',
        'assets/cat_middle.png'
    ];
    let catAnimIndex = 0;
    let idleTimeout = null;

    // Core Tap Mechanic
    catImage.addEventListener('click', () => {
        if (devModeActive || gameEnded) return; // Prevent tapping in dev mode or end game

        totalClicks++;

        // Increment biscuits
        let gain = 1 * tapMultiplier;
        biscuits += gain;
        lifetimeBiscuits += gain;
        updateBiscuitDisplay();
        checkEndGame();

        // Update Cat Image Sequence
        catImage.src = catImages[catAnimIndex];
        catAnimIndex = (catAnimIndex + 1) % catImages.length;

        // Reset idle timer
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            catImage.src = 'assets/cat_rest.png';
            catAnimIndex = 0;
        }, 5000);

        saveGame();
    });

    function updateStickerVisibility() {
        if (devModeActive) return; // In dev mode we show everything or manage it manually

        upgradesData.forEach(upgrade => {
            if (upgrade.isSunbeam) return;

            const sticker = document.getElementById(`sticker-${upgrade.id}`);
            if (!sticker) return;

            // Logic for "Pillow hides Blanket"
            if (upgrade.id === 'blanket') {
                const pillowUpgrade = upgradesData.find(u => u.id === 'pillow');
                if (pillowUpgrade && pillowUpgrade.count > 0) {
                    sticker.classList.add('hidden');
                    return; // exit early for blanket
                }
            }

            // Default visibility based on count
            if (upgrade.count > 0) {
                sticker.classList.remove('hidden');
            } else {
                sticker.classList.add('hidden');
            }
        });
    }

    function updateBiscuitDisplay() {
        biscuitCountEl.textContent = `${Math.floor(biscuits).toLocaleString()} (x${tapMultiplier})`;
        updateUpgradesUI();
    }

    // Call loadGame after UI is set up
    loadGame();
    updateBiscuitDisplay();

    function renderUpgrades() {
        upgradeListEl.innerHTML = '';
        upgradesData.forEach((upgrade, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'upgrade-item';
            itemEl.id = `upgrade-${upgrade.id}`;
            itemEl.dataset.index = index;

            itemEl.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name} <span style="font-weight: normal; color: #888; font-size: 12px; margin-left: 4px;">${upgrade.isSunbeam ? 'Auto' : 'x' + upgrade.multiplier}</span></div>
                    <div class="upgrade-cost" style="display: none;">Cost: <span class="cost-val" id="cost-${upgrade.id}">${Math.floor(upgrade.currentCost)}</span> biscuits</div>
                </div>
                <div class="upgrade-stats">
                    <span class="upgrade-count" id="count-${upgrade.id}">${upgrade.count}x</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="progress-${upgrade.id}"></div>
                </div>
            `;

            itemEl.addEventListener('click', () => buyUpgrade(index));
            upgradeListEl.appendChild(itemEl);
        });
        updateUpgradesUI();
    }

    function buyUpgrade(index) {
        if (gameEnded) return;
        const upgrade = upgradesData[index];
        if (biscuits >= upgrade.currentCost) {
            totalBiscuitsSpent += upgrade.currentCost;
            // Deduct cost
            biscuits -= upgrade.currentCost;

            // Increment count and total
            upgrade.count += 1;
            upgrade.totalPurchased += 1;

            // Update cost based on totalPurchased
            if (upgrade.totalPurchased === 1) {
                upgrade.currentCost = Math.ceil(upgrade.baseCost * 1.5);
            } else {
                upgrade.currentCost = upgrade.baseCost * upgrade.totalPurchased;
            }
            document.getElementById(`cost-${upgrade.id}`).textContent = Math.floor(upgrade.currentCost);

            // Update UI count
            document.getElementById(`count-${upgrade.id}`).textContent = `${upgrade.count}x`;

            if (upgrade.isSunbeam) {
                // Activate sunbeam logic
                activateSunbeam();
            } else {
                // Increase tap multiplier
                tapMultiplier += upgrade.multiplier;

                // Apply visual updates
                updateStickerVisibility();
            }

            updateBiscuitDisplay();
            saveGame();
        }
    }

    function activateSunbeam() {
        sunbeamTimeRemaining += 20000; // Add 20 seconds

        // Ensure UI is immediately updated with new count
        const sunbeamUpgrade = upgradesData.find(u => u.id === 'sunbeam');
        if (sunbeamUpgrade) {
            sunbeamUpgrade.count = Math.ceil(sunbeamTimeRemaining / 20000);
            const countEl = document.getElementById(`count-sunbeam`);
            if (countEl) countEl.textContent = `${sunbeamUpgrade.count}x`;
        }

        resumeSunbeam();
    }

    function resumeSunbeam() {
        if (sunbeamActive || sunbeamTimeRemaining <= 0) return;
        sunbeamActive = true;
        bgImage.src = 'assets/bg_sunbeam.png';

        // Auto-tap 2 times per second and manage time
        sunbeamInterval = setInterval(() => {
            if (gameEnded) {
                clearInterval(sunbeamInterval);
                return;
            }
            sunbeamTimeRemaining -= 500;

            // Trigger auto tap
            let gain = 1 * tapMultiplier;
            biscuits += gain;
            lifetimeBiscuits += gain;
            updateBiscuitDisplay();
            checkEndGame();

            // Auto update animation sequence
            catImage.src = catImages[catAnimIndex];
            catAnimIndex = (catAnimIndex + 1) % catImages.length;

            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(() => {
                catImage.src = 'assets/cat_rest.png';
                catAnimIndex = 0;
            }, 5000);
            // Update UI count
            const sunbeamUpgrade = upgradesData.find(u => u.id === 'sunbeam');
            if (sunbeamUpgrade) {
                sunbeamUpgrade.count = Math.ceil(sunbeamTimeRemaining / 20000);
                const countEl = document.getElementById(`count-sunbeam`);
                if (countEl) countEl.textContent = `${sunbeamUpgrade.count}x`;
            }

            if (sunbeamTimeRemaining % 5000 === 0) {
                saveGame(); // Save every 5 seconds to persist time
            }

            if (sunbeamTimeRemaining <= 0) {
                endSunbeam();
            }
        }, 500); // 500ms = 2 taps per second
    }

    const resetBtn = document.getElementById('reset-icon');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            const isConfirmed = await showConfirmModal("Are you sure you want to reset your progress? This cannot be undone.");
            if (isConfirmed) {
                localStorage.removeItem('pickleClickerSave');
                location.reload();
            }
        });
    }

    function endSunbeam() {
        sunbeamActive = false;
        sunbeamTimeRemaining = 0;
        clearInterval(sunbeamInterval);

        const sunbeamUpgrade = upgradesData.find(u => u.id === 'sunbeam');
        if (sunbeamUpgrade) {
            sunbeamUpgrade.count = 0;
            const countEl = document.getElementById(`count-sunbeam`);
            if (countEl) countEl.textContent = `0x`;
        }

        bgImage.src = 'assets/bg_game.png';
        catImage.src = 'assets/cat_rest.png';
        catAnimIndex = 0;
        saveGame();
    }

    function updateUpgradesUI() {
        upgradesData.forEach(upgrade => {
            const itemEl = document.getElementById(`upgrade-${upgrade.id}`);
            if (!itemEl) return;

            const progressBar = document.getElementById(`progress-${upgrade.id}`);
            const progress = Math.min(100, (biscuits / upgrade.currentCost) * 100);
            progressBar.style.width = `${progress}%`;

            if (biscuits >= upgrade.currentCost) {
                itemEl.classList.add('affordable');
                progressBar.classList.add('full');
            } else {
                itemEl.classList.remove('affordable');
                progressBar.classList.remove('full');
            }
        });
    }

    // --- GAME 2 SPECIFIC LOGIC ---
    let stonksChartInstance = null;

    window.initStonksChart = function() {
        const ctx = document.getElementById('stonks-chart');
        if (!ctx) return;

        // Prevent re-initialization
        if (stonksChartInstance) return;

        stonksChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                datasets: [
                    { label: 'Tuna Inc', data: [10, 15, 12, 18, 20, 22, 25, 24, 28, 30], borderColor: '#f06292', tension: 0.1, fill: false, pointRadius: 0 },
                    { label: 'Yarn Corp', data: [20, 18, 22, 24, 26, 25, 23, 21, 19, 18], borderColor: '#ba68c8', tension: 0.1, fill: false, pointRadius: 0 },
                    { label: 'Salmon Tech', data: [5, 8, 15, 25, 40, 50, 45, 60, 80, 100], borderColor: '#64b5f6', tension: 0.1, fill: false, pointRadius: 0 },
                    { label: 'Laser Dynamics', data: [50, 40, 60, 30, 80, 20, 90, 10, 100, 5], borderColor: '#4fc3f7', tension: 0.1, fill: false, pointRadius: 0 },
                    { label: 'Cardboard Box LLC', data: [30, 30, 31, 30, 29, 30, 30, 31, 30, 30], borderColor: '#81c784', tension: 0.1, fill: false, pointRadius: 0 },
                    { label: 'Catnip Futures', data: [10, 12, 11, 15, 30, 60, 90, 120, 80, 40], borderColor: '#dce775', tension: 0.1, fill: false, pointRadius: 0 },
                    { label: 'Solar Energy Co', data: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24], borderColor: '#ffd54f', tension: 0.1, fill: false, pointRadius: 0 },
                    { label: 'Spring Toy Co', data: [25, 35, 20, 40, 15, 45, 10, 50, 5, 55], borderColor: '#ff8a65', tension: 0.1, fill: false, pointRadius: 0 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        display: false // Hide legend to save space
                    }
                },
                scales: {
                    x: { display: false }, // Hide x axis labels
                    y: {
                        display: true,
                        ticks: {
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    };

    // --- DEVELOPER MODE ---
    const activateDevMode = (isGame2 = false) => {
        devModeActive = true;
        devModePanel.classList.remove('hidden');

        const currentBackgroundContainer = isGame2 ? document.getElementById('game2-background-container') : document.getElementById('background-container');
        const currentCatImage = isGame2 ? document.getElementById('game2-cat-container') : catImage;
        const currentStickersContainer = isGame2 ? document.getElementById('game2-stickers-container') : stickersContainer;

        if (currentStickersContainer) {
            currentStickersContainer.style.pointerEvents = 'auto'; // allow clicking stickers
        }

        // Prepare cat/container for dragging
        if (currentCatImage) {
            currentCatImage.style.pointerEvents = 'auto'; // ensure it can be clicked
            currentCatImage.style.border = '2px dashed red';
            if (!currentCatImage.dataset.devSetup) {
                currentCatImage.dataset.devSetup = true;

                // Apply absolute positioning if not set
                if (window.getComputedStyle(currentCatImage).position !== 'absolute' && !currentCatImage.style.position) {
                    currentCatImage.style.position = 'absolute';
                    currentCatImage.style.left = '50%';
                    currentCatImage.style.top = '50%';
                    updateStickerTransform(currentCatImage);
                }

                currentCatImage.addEventListener('mousedown', startDrag);
                currentCatImage.addEventListener('touchstart', startDrag, {passive: false});
            }
        }

        // Show all stickers in the current background container
        if (currentBackgroundContainer) {
            currentBackgroundContainer.querySelectorAll('.sticker').forEach(sticker => {
                sticker.classList.remove('hidden');
                sticker.style.pointerEvents = 'auto'; // ensure they can be clicked
                sticker.style.border = '2px dashed red';

                // Add interaction listeners if not already present
                if (!sticker.dataset.devSetup) {
                    sticker.dataset.devSetup = true;
                    sticker.addEventListener('mousedown', startDrag);
                    sticker.addEventListener('touchstart', startDrag, {passive: false});
                }
            });
        }
        updateDevOutput(isGame2);
    };

    if (devModeBtn) devModeBtn.addEventListener('click', () => activateDevMode(false));
    if (game2DevModeBtn) game2DevModeBtn.addEventListener('click', () => activateDevMode(true));

    /* Legacy Game 1 button retained above */

    devCloseBtn.addEventListener('click', () => {
        devModeActive = false;
        devModePanel.classList.add('hidden');
        stickersContainer.style.pointerEvents = 'none';

        const game2StickersContainer = document.getElementById('game2-stickers-container');
        if (game2StickersContainer) game2StickersContainer.style.pointerEvents = 'none';

        // Reset cat states
        catImage.style.border = 'none';
        catImage.style.pointerEvents = '';
        const game2CatContainer = document.getElementById('game2-cat-container');
        if (game2CatContainer) {
            game2CatContainer.style.border = 'none';
            game2CatContainer.style.pointerEvents = 'none'; // Revert back to none
        }
        const game2CrashedCatContainer = document.getElementById('game2-crashedcat-container');
        if (game2CrashedCatContainer) {
            game2CrashedCatContainer.style.border = 'none';
            game2CrashedCatContainer.style.pointerEvents = 'none'; // Revert back to none
        }

        // Clean up sticker borders
        document.querySelectorAll('.sticker').forEach(sticker => {
            sticker.style.border = 'none';
            sticker.style.pointerEvents = ''; // Reset pointer events
        });

        // Enforce actual game visibility rules
        updateStickerVisibility();

        selectedSticker = null;
        devSelectedStickerText.textContent = "None";
    });

    devBgToggleBtn.addEventListener('click', () => {
        if (bgImage.src.includes('bg_game.png')) {
            bgImage.src = 'assets/bg_sunbeam.png';
        } else {
            bgImage.src = 'assets/bg_game.png';
        }
    });

    const businessCatImages = ['assets/business_cat_rest.png', 'assets/business_cat_looking.png', 'assets/business_cat_catnip.png', 'assets/business_cat_crashedout.png'];
    let currentBusinessCatImageIndex = 0;

    if (devCatCycleBtn) {
        devCatCycleBtn.addEventListener('click', () => {
            const isGame2 = !document.getElementById('game2-screen').classList.contains('hidden');
            if (isGame2) {
                const game2CatCont = document.getElementById('game2-cat-container');
                const game2CatImg = document.getElementById('game2-cat-image');
                const game2CrashedCont = document.getElementById('game2-crashedcat-container');

                if (game2CatImg && game2CrashedCont && game2CatCont) {
                    currentBusinessCatImageIndex = (currentBusinessCatImageIndex + 1) % businessCatImages.length;
                    const nextSrc = businessCatImages[currentBusinessCatImageIndex];

                    if (nextSrc.includes('crashedout')) {
                        game2CatCont.classList.add('hidden');
                        game2CrashedCont.classList.remove('hidden');
                    } else {
                        game2CrashedCont.classList.add('hidden');
                        game2CatCont.classList.remove('hidden');
                        game2CatImg.src = nextSrc;
                    }
                }
            } else {
                alert("Cat image cycle is only configured for Game 2 business cat.");
            }
        });
    }

    function startDrag(e) {
        if (!devModeActive) return;

        // Find closest sticker container in case we clicked an inner element like canvas or image
        let target = e.target.closest('.sticker');
        if (!target) target = e.target.closest('#cat-image') || e.target.closest('#game2-cat-container') || e.target.closest('#game2-crashedcat-container') || e.target.closest('#stonks-grid') || e.target;

        selectedSticker = target;
        devSelectedStickerText.textContent = selectedSticker.id;

        const isGame2 = !document.getElementById('game2-screen').classList.contains('hidden');
        const bgContainer = isGame2 ? document.getElementById('game2-background-container') : document.getElementById('background-container');

        // Update UI controls to match selection
        // Convert pixel width back to percentage of background container
        const bgRect = bgContainer.getBoundingClientRect();
        const stickerWidthPx = selectedSticker.getBoundingClientRect().width;
        let currentWidthPercent = Math.round((stickerWidthPx / bgRect.width) * 100);

        // Use a fallback if calculation is weird
        if (!currentWidthPercent || currentWidthPercent <= 0) currentWidthPercent = 20;

        devScaleInput.value = currentWidthPercent;
        devZIndexInput.value = window.getComputedStyle(selectedSticker).zIndex === 'auto' ? '1' : window.getComputedStyle(selectedSticker).zIndex;
        devFlipInput.checked = selectedSticker.dataset.flip === 'true';

        // Visual selection
        bgContainer.querySelectorAll('.sticker').forEach(s => s.style.border = '2px dashed red');
        if (!isGame2) catImage.style.border = '2px dashed red';
        selectedSticker.style.border = '4px solid blue';

        isDragging = true;

        let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        let clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        const rect = selectedSticker.getBoundingClientRect();
        // Calculate offset from top-left of the sticker
        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, {passive: false});
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function drag(e) {
        if (!isDragging || !selectedSticker) return;
        e.preventDefault();

        let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        let clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        const isGame2 = !document.getElementById('game2-screen').classList.contains('hidden');
        const bgContainer = isGame2 ? document.getElementById('game2-background-container') : document.getElementById('background-container');

        // Use background-container as the reference for percentage coordinates
        const containerRect = bgContainer.getBoundingClientRect();

        // Calculate new center position in percentages relative to container
        // We use the scaled bounds (getBoundingClientRect) for the width/height to properly counteract the dragOffsetX/Y
        const stickerRect = selectedSticker.getBoundingClientRect();
        let newLeft = clientX - containerRect.left - dragOffsetX + (stickerRect.width / 2);
        let newTop = clientY - containerRect.top - dragOffsetY + (stickerRect.height / 2);

        let leftPercent = (newLeft / containerRect.width) * 100;
        let topPercent = (newTop / containerRect.height) * 100;

        selectedSticker.style.left = `${leftPercent}%`;
        selectedSticker.style.top = `${topPercent}%`;

        updateDevOutput(isGame2);
    }

    function endDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
    }

    devScaleInput.addEventListener('input', (e) => {
        if (selectedSticker) {
            selectedSticker.style.width = `${e.target.value}%`;
            const isGame2 = !document.getElementById('game2-screen').classList.contains('hidden');
            updateDevOutput(isGame2);
        }
    });

    devZIndexInput.addEventListener('input', (e) => {
        if (selectedSticker) {
            selectedSticker.style.zIndex = e.target.value;
            const isGame2 = !document.getElementById('game2-screen').classList.contains('hidden');
            updateDevOutput(isGame2);
        }
    });

    devFlipInput.addEventListener('change', (e) => {
        if (selectedSticker) {
            selectedSticker.dataset.flip = e.target.checked ? 'true' : 'false';
            updateStickerTransform(selectedSticker);
        }
    });

    function updateStickerTransform(el) {
        const isFlipped = el.dataset.flip === 'true';
        const flipTransform = isFlipped ? 'scaleX(-1)' : '';

        el.style.transform = `translate(-50%, -50%) ${flipTransform}`.trim();
        const isGame2 = !document.getElementById('game2-screen').classList.contains('hidden');
        updateDevOutput(isGame2);
    }

    function updateDevOutput(isGame2 = false) {
        if (!devModeActive) return;

        let outputHTML = '<strong>CSS for standard placements:</strong><br><textarea style="width:100%; height:150px; font-size:10px;">';

        const currentBackgroundContainer = isGame2 ? document.getElementById('game2-background-container') : document.getElementById('background-container');
        if (!currentBackgroundContainer) return;

        // Helper to convert pixel width to percent of container
        function getWidthPercent(el) {
            const bgRect = currentBackgroundContainer.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            return Math.round((elRect.width / bgRect.width) * 100);
        }

        if (!isGame2) {
            // Output for Cat Image (Game 1)
            const catLeft = catImage.style.left || '63.9983%';
            const catTop = catImage.style.top || '69.7604%';
            const catWidth = catImage.style.width || `${getWidthPercent(catImage)}%`;
            const catFlip = catImage.dataset.flip === 'true' ? ' scaleX(-1)' : '';
            const catZIndex = catImage.style.zIndex || window.getComputedStyle(catImage).zIndex;
            outputHTML += `#cat-image {\n  left: ${catLeft};\n  top: ${catTop};\n  width: ${catWidth};\n  transform: translate(-50%, -50%)${catFlip};\n  z-index: ${catZIndex === 'auto' ? '50' : catZIndex};\n}\n\n`;
        }

        // Output for Stickers in current container
        currentBackgroundContainer.querySelectorAll('.sticker').forEach(sticker => {
            const id = sticker.id;

            // Since computed left/top are pixels, and the user provided percentages in CSS,
            // we will only output elements that have been explicitly moved via dragging
            // to avoid overwriting their CSS with incorrect pixel/default values.
            if (sticker.style.left && sticker.style.top) {
                const left = sticker.style.left;
                const top = sticker.style.top;
                const width = sticker.style.width || `${getWidthPercent(sticker)}%`;
                const flip = sticker.dataset.flip === 'true' ? ' scaleX(-1)' : '';
                const zIndex = sticker.style.zIndex || window.getComputedStyle(sticker).zIndex;

                outputHTML += `#${id} {\n  left: ${left};\n  top: ${top};\n  width: ${width};\n  transform: translate(-50%, -50%)${flip};\n  z-index: ${zIndex === 'auto' ? '1' : zIndex};\n}\n\n`;
            }
        });
        outputHTML += '</textarea>';
        devOutput.innerHTML = outputHTML;
    }

    // Initial render
    renderUpgrades();
});