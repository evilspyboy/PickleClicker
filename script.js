document.addEventListener('DOMContentLoaded', () => {
    console.log("PickleClicker initialized");

    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startBtn = document.getElementById('start-btn');

    // UI Elements for Transition
    const headerEl = document.getElementById('header');
    const catContainerEl = document.getElementById('cat-container');
    const stickersContainerEl = document.getElementById('stickers-container');
    const upgradeListContEl = document.getElementById('upgrade-list');
    const settingsAreaEl = document.getElementById('settings-area');

    // Initialize Game Screen state - move UI elements out of frame, but keep background
    gameScreen.classList.remove('hidden');
    headerEl.classList.add('ui-offscreen-top');
    catContainerEl.classList.add('ui-offscreen-bottom');
    stickersContainerEl.classList.add('ui-offscreen-bottom');

    // Hide upgrades entirely via display property initially
    upgradeListContEl.style.display = 'none';
    settingsAreaEl.style.display = 'none';

    startBtn.addEventListener('click', () => {
        // Slide out start screen components
        startScreen.classList.add('slide-up');

        // Prepare to show game UI
        setTimeout(() => {
            headerEl.classList.remove('ui-offscreen-top');
            catContainerEl.classList.remove('ui-offscreen-bottom');
            stickersContainerEl.classList.remove('ui-offscreen-bottom');

            // Restore upgrade list display
            upgradeListContEl.style.display = 'grid'; // Originally defined as grid in CSS
            settingsAreaEl.style.display = 'flex';
        }, 100); // Slight delay for smoother transition start

        // Fully hide start screen container after transition
        setTimeout(() => {
            startScreen.classList.add('hidden');
        }, 1000);
    });

    // Game Variables
    let biscuits = 0;
    let tapMultiplier = 1;

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
        const gameState = {
            biscuits,
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
                tapMultiplier = gameState.tapMultiplier || 1;
                sunbeamTimeRemaining = gameState.sunbeamTimeRemaining || 0;

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
    const devModePanel = document.getElementById('dev-mode-panel');
    const devBgToggleBtn = document.getElementById('dev-bg-toggle');
    const devSelectedStickerText = document.getElementById('dev-selected-sticker');
    const devScaleInput = document.getElementById('dev-scale');
    const devZIndexInput = document.getElementById('dev-zindex');
    const devFlipInput = document.getElementById('dev-flip');
    const devOutput = document.getElementById('dev-output');
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
        if (devModeActive) return; // Prevent tapping in dev mode

        // Increment biscuits
        biscuits += 1 * tapMultiplier;
        updateBiscuitDisplay();

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
        const upgrade = upgradesData[index];
        if (biscuits >= upgrade.currentCost) {
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
            sunbeamTimeRemaining -= 500;

            // Trigger auto tap
            biscuits += 1 * tapMultiplier;
            updateBiscuitDisplay();

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
        resetBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
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

    // --- DEVELOPER MODE ---
    devModeBtn.addEventListener('click', () => {
        devModeActive = true;
        devModePanel.classList.remove('hidden');
        stickersContainer.style.pointerEvents = 'auto'; // allow clicking stickers

        // Prepare cat for dragging
        catImage.style.border = '2px dashed red';
        if (!catImage.dataset.devSetup) {
            catImage.dataset.devSetup = true;

            // Apply absolute positioning if not set
            if (window.getComputedStyle(catImage).position !== 'absolute' && !catImage.style.position) {
                catImage.style.position = 'absolute';
                catImage.style.left = '50%';
                catImage.style.top = '50%';
                updateStickerTransform(catImage);
            }

            catImage.addEventListener('mousedown', startDrag);
            catImage.addEventListener('touchstart', startDrag, {passive: false});
        }

        // Show all stickers
        document.querySelectorAll('.sticker').forEach(sticker => {
            sticker.classList.remove('hidden');
            sticker.style.border = '2px dashed red';

            // Add interaction listeners if not already present
            if (!sticker.dataset.devSetup) {
                sticker.dataset.devSetup = true;
                sticker.addEventListener('mousedown', startDrag);
                sticker.addEventListener('touchstart', startDrag, {passive: false});
            }
        });
        updateDevOutput();
    });

    devCloseBtn.addEventListener('click', () => {
        devModeActive = false;
        devModePanel.classList.add('hidden');
        stickersContainer.style.pointerEvents = 'none';

        // Reset cat border
        catImage.style.border = 'none';

        // Clean up sticker borders
        document.querySelectorAll('.sticker').forEach(sticker => {
            sticker.style.border = 'none';
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

    function startDrag(e) {
        if (!devModeActive) return;
        e.preventDefault();

        selectedSticker = e.target;
        devSelectedStickerText.textContent = selectedSticker.id;

        // Update UI controls to match selection
        devScaleInput.value = selectedSticker.dataset.scale || 1;
        devZIndexInput.value = window.getComputedStyle(selectedSticker).zIndex === 'auto' ? '1' : window.getComputedStyle(selectedSticker).zIndex;
        devFlipInput.checked = selectedSticker.dataset.flip === 'true';

        // Visual selection
        document.querySelectorAll('.sticker').forEach(s => s.style.border = '2px dashed red');
        catImage.style.border = '2px dashed red';
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

        // Use background-container as the reference for percentage coordinates
        const containerRect = document.getElementById('background-container').getBoundingClientRect();

        // Calculate new center position in percentages relative to container
        // We use the scaled bounds (getBoundingClientRect) for the width/height to properly counteract the dragOffsetX/Y
        const stickerRect = selectedSticker.getBoundingClientRect();
        let newLeft = clientX - containerRect.left - dragOffsetX + (stickerRect.width / 2);
        let newTop = clientY - containerRect.top - dragOffsetY + (stickerRect.height / 2);

        let leftPercent = (newLeft / containerRect.width) * 100;
        let topPercent = (newTop / containerRect.height) * 100;

        selectedSticker.style.left = `${leftPercent}%`;
        selectedSticker.style.top = `${topPercent}%`;

        updateDevOutput();
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
            selectedSticker.dataset.scale = e.target.value;
            updateStickerTransform(selectedSticker);
        }
    });

    devZIndexInput.addEventListener('input', (e) => {
        if (selectedSticker) {
            selectedSticker.style.zIndex = e.target.value;
            updateDevOutput();
        }
    });

    devFlipInput.addEventListener('change', (e) => {
        if (selectedSticker) {
            selectedSticker.dataset.flip = e.target.checked ? 'true' : 'false';
            updateStickerTransform(selectedSticker);
        }
    });

    function updateStickerTransform(el) {
        const scale = el.dataset.scale || '1';
        const isFlipped = el.dataset.flip === 'true';
        const flipTransform = isFlipped ? 'scaleX(-1)' : '';

        el.style.transform = `translate(-50%, -50%) scale(${scale}) ${flipTransform}`.trim();
        updateDevOutput();
    }

    function updateDevOutput() {
        if (!devModeActive) return;

        let outputHTML = '<strong>CSS for standard placements:</strong><br><textarea style="width:100%; height:150px; font-size:10px;">';

        // Output for Cat Image
        const catLeft = catImage.style.left || '50%';
        const catTop = catImage.style.top || '50%';
        const catScale = catImage.dataset.scale || '1';
        const catFlip = catImage.dataset.flip === 'true' ? ' scaleX(-1)' : '';
        const catZIndex = catImage.style.zIndex || window.getComputedStyle(catImage).zIndex;
        outputHTML += `#cat-image {\n  position: absolute;\n  left: ${catLeft};\n  top: ${catTop};\n  transform: translate(-50%, -50%) scale(${catScale})${catFlip};\n  z-index: ${catZIndex === 'auto' ? '50' : catZIndex};\n}\n\n`;

        // Output for Stickers
        document.querySelectorAll('.sticker').forEach(sticker => {
            const id = sticker.id;

            // Get computed style if inline style is not set
            const computedStyle = window.getComputedStyle(sticker);

            // Since computed left/top are pixels, and the user provided percentages in CSS,
            // we will only output elements that have been explicitly moved via dragging
            // to avoid overwriting their CSS with incorrect pixel/default values.
            if (sticker.style.left && sticker.style.top) {
                const left = sticker.style.left;
                const top = sticker.style.top;
                const scale = sticker.dataset.scale || '0.5';
                const flip = sticker.dataset.flip === 'true' ? ' scaleX(-1)' : '';
                const zIndex = sticker.style.zIndex || window.getComputedStyle(sticker).zIndex;

                outputHTML += `#${id} {\n  left: ${left};\n  top: ${top};\n  transform: translate(-50%, -50%) scale(${scale})${flip};\n  z-index: ${zIndex === 'auto' ? '1' : zIndex};\n}\n\n`;
            }
        });
        outputHTML += '</textarea>';
        devOutput.innerHTML = outputHTML;
    }

    // Initial render
    renderUpgrades();
});