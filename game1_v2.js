document.addEventListener('DOMContentLoaded', () => {
    console.log("PickleClicker Game 1 initialized");

    const shared = window.PickleShared;

    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startBtn = document.getElementById('start-btn');

    // Toggle Buttons
    const game2UnlockBtn = document.getElementById('game2-unlock-btn');

    // UI Elements for Transition
    const headerEl = document.getElementById('header');
    const catContainerEl = document.getElementById('cat-container');
    const stickersContainerEl = document.getElementById('stickers-container');
    const upgradeListContEl = document.getElementById('upgrade-list');
    const settingsAreaEl = document.getElementById('settings-area');

    // DOM Elements
    const biscuitCountEl = document.getElementById('biscuit-count');
    const catImage = document.getElementById('cat-image');
    const upgradeListEl = document.getElementById('upgrade-list');
    const resetIcon = document.getElementById('reset-icon');
    const endgameModal = document.getElementById('endgame-modal');
    const endgameResetBtn = document.getElementById('endgame-reset');
    const endgameJumpGame2Btn = document.getElementById('endgame-jump-game2');

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

    // Cat Animation State
    const catImages = [
        'assets/cat_left.png',
        'assets/cat_middle.png',
        'assets/cat_right.png',
        'assets/cat_middle.png'
    ];
    let catAnimIndex = 0;
    let idleTimeout = null;

    // Dev Mode Elements & State
    let devModeActive = false;
    const devModeBtn = document.getElementById('dev-mode-btn');

    // Developer Mode UI toggles
    if (devModeBtn) {
        devModeBtn.addEventListener('click', () => {
             const panel = document.getElementById('dev-mode-panel');
             if(panel) {
                 panel.classList.remove('hidden');
                 devModeActive = true;
             }
        });
    }

    const devCloseBtn = document.getElementById('dev-close-btn');
    if (devCloseBtn) {
        devCloseBtn.addEventListener('click', () => {
             const panel = document.getElementById('dev-mode-panel');
             if(panel) {
                 panel.classList.add('hidden');
                 devModeActive = false;
                 updateStickerVisibility(); // Reset visibility rules
             }
        });
    }

    function isGame1Active() {
        return startScreen && startScreen.classList.contains('slide-up') &&
               gameScreen && !gameScreen.classList.contains('hidden');
    }

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
        shared.setLocalStorage('pickleClickerSave', gameState);
    }

    function loadGame() {
        const gameState = shared.getLocalStorage('pickleClickerSave', null);
        if (gameState) {
            biscuits = gameState.biscuits || 0;
            lifetimeBiscuits = gameState.lifetimeBiscuits || 0;
            totalClicks = gameState.totalClicks || 0;
            totalBiscuitsSpent = gameState.totalBiscuitsSpent || 0;
            tapMultiplier = gameState.tapMultiplier || 1;
            sunbeamTimeRemaining = gameState.sunbeamTimeRemaining || 0;

            if (lifetimeBiscuits >= 1000000) {
                gameEnded = true;
            }

            if (gameState.upgradesData) {
                upgradesData = gameState.upgradesData;
                upgradesData.forEach(u => {
                    if (u.totalPurchased === undefined) {
                        u.totalPurchased = u.isSunbeam ? 0 : u.count;
                    }
                });
                updateStickerVisibility();
            }

            if (sunbeamTimeRemaining > 0) {
                resumeSunbeam();
            }
        }
    }

    function updateStickerVisibility() {
        if (devModeActive) return;

        upgradesData.forEach(upgrade => {
            if (upgrade.isSunbeam) return;

            const sticker = document.getElementById(`sticker-${upgrade.id}`);
            if (!sticker) return;

            if (upgrade.id === 'blanket') {
                const pillowUpgrade = upgradesData.find(u => u.id === 'pillow');
                if (pillowUpgrade && pillowUpgrade.count > 0) {
                    sticker.classList.add('hidden');
                    return;
                }
            }

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

    function renderUpgrades() {
        upgradeListEl.innerHTML = '';
        upgradesData.forEach(upgrade => {
            const upgradeEl = document.createElement('div');
            upgradeEl.className = 'upgrade-item';
            upgradeEl.id = `upgrade-${upgrade.id}`;

            let specialText = '';
            let isAffordable = biscuits >= upgrade.currentCost ? 'affordable' : '';

            if (upgrade.isSunbeam) {
                specialText = `<div class="upgrade-stats" style="font-size:12px;">+1s per tap for 1m</div>`;
                if (sunbeamActive) {
                    upgradeEl.style.opacity = '0.5';
                    upgradeEl.style.pointerEvents = 'none';
                    specialText = `<div class="upgrade-stats" style="font-size:12px;">Active...</div>`;
                }
            } else {
                specialText = `<div class="upgrade-stats">+${upgrade.multiplier}</div>`;
            }

            upgradeEl.innerHTML = `
                <div class="progress-bar-container"><div class="progress-bar" id="progress-${upgrade.id}"></div></div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name} (x${upgrade.count})</div>
                    <div class="upgrade-cost">Cost: ${Math.floor(upgrade.currentCost).toLocaleString()}</div>
                    <div class="upgrade-desc">${upgrade.isSunbeam ? 'Catch a sunbeam!' : 'Increases biscuits per tap.'}</div>
                </div>
                ${specialText}
            `;

            if (isAffordable) upgradeEl.classList.add(isAffordable);

            upgradeEl.addEventListener('click', () => {
                if (devModeActive) return;
                buyUpgrade(upgrade.id);
            });

            upgradeListEl.appendChild(upgradeEl);
        });
    }

    function buyUpgrade(id) {
        if (gameEnded) return;

        const upgrade = upgradesData.find(u => u.id === id);
        if (!upgrade) return;

        if (upgrade.isSunbeam && sunbeamActive) return; // Prevent multiple sunbeams

        if (biscuits >= upgrade.currentCost) {
            biscuits -= upgrade.currentCost;
            totalBiscuitsSpent += upgrade.currentCost;
            upgrade.count++;
            upgrade.totalPurchased++;

            // Increase cost by 15% exponentially
            upgrade.currentCost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.totalPurchased));

            if (upgrade.isSunbeam) {
                activateSunbeam();
            } else {
                recalculateMultiplier();
            }

            updateStickerVisibility();
            updateBiscuitDisplay();
            saveGame();
        }
    }

    function recalculateMultiplier() {
        let multi = 1;
        upgradesData.forEach(upgrade => {
            if (!upgrade.isSunbeam && upgrade.count > 0) {
                multi += (upgrade.count * upgrade.multiplier);
            }
        });
        tapMultiplier = multi;
    }

    function activateSunbeam() {
        sunbeamActive = true;
        sunbeamTimeRemaining = 60000; // 1 minute
        renderUpgrades(); // Update UI to show inactive
        runSunbeamLoop();
    }

    function resumeSunbeam() {
        if (sunbeamTimeRemaining > 0) {
            sunbeamActive = true;
            renderUpgrades();
            runSunbeamLoop();
        }
    }

    function runSunbeamLoop() {
        const intervalTime = 1000; // 1 second
        if (sunbeamInterval) clearInterval(sunbeamInterval);

        sunbeamInterval = setInterval(() => {
            if (!isGame1Active()) return; // Bail out if not actively on screen 1

            if (sunbeamTimeRemaining <= 0) {
                clearInterval(sunbeamInterval);
                sunbeamActive = false;
                renderUpgrades();
                saveGame();
                return;
            }

            // Auto-click logic: give biscuits equivalent to 1 tap per second
            let gain = 1 * tapMultiplier;
            biscuits += gain;
            lifetimeBiscuits += gain;
            updateBiscuitDisplay();
            checkEndGame();

            sunbeamTimeRemaining -= intervalTime;
            saveGame();
        }, intervalTime);
    }

    function updateUpgradesUI() {
        upgradesData.forEach(upgrade => {
            const el = document.getElementById(`upgrade-${upgrade.id}`);
            if (el) {
                if (biscuits >= upgrade.currentCost) {
                    el.classList.add('affordable');
                } else {
                    el.classList.remove('affordable');
                }

                const progressEl = document.getElementById(`progress-${upgrade.id}`);
                if (progressEl) {
                    let progress = (biscuits / upgrade.currentCost) * 100;
                    if (progress > 100) progress = 100;
                    progressEl.style.width = `${progress}%`;

                    if (progress >= 100) {
                        progressEl.classList.add('full');
                    } else {
                        progressEl.classList.remove('full');
                    }
                }
            }
        });
    }

    function checkEndGame() {
        if (lifetimeBiscuits >= 1000000) {
            const wasEnded = gameEnded;
            gameEnded = true;

            const finalScore = totalClicks + totalBiscuitsSpent;

            let leaderboard = shared.getLocalStorage('pickleClickerLeaderboard', []);

            if (!wasEnded) {
                leaderboard.push({ score: finalScore, biscuitsLeft: biscuits });
            }

            // Sort ascending (lower is better)
            leaderboard.sort((a, b) => {
                const scoreA = typeof a === 'object' ? a.score : a;
                const scoreB = typeof b === 'object' ? b.score : b;
                return scoreA - scoreB;
            });

            if (leaderboard.length > 5) {
                leaderboard = leaderboard.slice(0, 5);
            }

            shared.setLocalStorage('pickleClickerLeaderboard', leaderboard);

            const listEl = document.getElementById('leaderboard-list');
            if (listEl) {
                listEl.innerHTML = '';
                for (let i = 0; i < 5; i++) {
                    const li = document.createElement('li');
                    if (i < leaderboard.length) {
                        const entry = leaderboard[i];
                        const scoreVal = typeof entry === 'object' ? entry.score : entry;
                        li.textContent = `${i + 1}. Score: ${scoreVal}`;
                        if (entry.score === finalScore) {
                            li.classList.add('current-score');
                        }
                    } else {
                        li.textContent = `${i + 1}. ---`;
                    }
                    listEl.appendChild(li);
                }
            }

            if (game2UnlockBtn) {
                game2UnlockBtn.classList.remove('hidden');
            }

            // Show End Game Modal only if actively playing
            if (startScreen && startScreen.classList.contains('slide-up') && gameScreen && !gameScreen.classList.contains('hidden')) {
                if (endgameModal) {
                    endgameModal.classList.remove('hidden');
                }
            }
        }
    }

    function performReset() {
        shared.showConfirmModal("Are you sure you want to reset your progress? This will wipe your save!").then(result => {
            if (result) {
                localStorage.removeItem('pickleClickerSave');
                location.reload();
            }
        });
    }

    if (resetIcon) resetIcon.addEventListener('click', performReset);
    if (endgameResetBtn) endgameResetBtn.addEventListener('click', performReset);

    if (endgameJumpGame2Btn) {
        endgameJumpGame2Btn.addEventListener('click', () => {
            if (endgameModal) endgameModal.classList.add('hidden');
            // Transition logic handled in shared/index if they were unified,
            // but for Game 1 strict extraction, we manipulate the UI elements directly here
            if (gameScreen) gameScreen.classList.add('hidden');

            // To unlock Game 2 start screen
            const g2Start = document.getElementById('game2-start-screen');
            if (g2Start) {
                g2Start.classList.remove('hidden');
                g2Start.classList.remove('slide-up');
            }
        });
    }

    // Core Tap Mechanic
    catImage.addEventListener('click', () => {
        if (devModeActive || gameEnded) return;

        totalClicks++;

        let gain = 1 * tapMultiplier;
        biscuits += gain;
        lifetimeBiscuits += gain;
        updateBiscuitDisplay();
        checkEndGame();

        catImage.src = catImages[catAnimIndex];
        catAnimIndex = (catAnimIndex + 1) % catImages.length;

        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            catImage.src = 'assets/cat_rest.png';
            catAnimIndex = 0;
        }, 5000);

        saveGame();
    });

    // Start Sequence
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (startScreen) startScreen.classList.add('slide-up');
            if (gameScreen) gameScreen.classList.remove('hidden');

            // Animate UI elements in
            setTimeout(() => {
                if(headerEl) headerEl.classList.remove('ui-offscreen-top');
                if(catContainerEl) catContainerEl.classList.remove('ui-offscreen-bottom');
                if(stickersContainerEl) stickersContainerEl.classList.remove('ui-offscreen-bottom');
                if(upgradeListContEl) upgradeListContEl.style.height = 'auto'; // Flex layout handles rest
            }, 100);

            // Instructions check
            const hasPlayed = localStorage.getItem('pickleClickerSave');
            if (!hasPlayed) {
                const instructionsModal = document.getElementById('instructions-modal');
                if (instructionsModal) instructionsModal.classList.remove('hidden');
            }
        });
    }

    const instrOkBtn = document.getElementById('instructions-ok');
    if (instrOkBtn) {
        instrOkBtn.addEventListener('click', () => {
            document.getElementById('instructions-modal').classList.add('hidden');
        });
    }

    // Leaderboard Check on load
    const lb = shared.getLocalStorage('pickleClickerLeaderboard', []);
    if (lb && lb.length > 0 && game2UnlockBtn) {
        game2UnlockBtn.classList.remove('hidden');
    }

    // Initialize Game
    loadGame();
    recalculateMultiplier();
    renderUpgrades();
    updateBiscuitDisplay();
    updateStickerVisibility();

});
