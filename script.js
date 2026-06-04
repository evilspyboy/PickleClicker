document.addEventListener('DOMContentLoaded', () => {
    console.log("PickleClicker initialized");

    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startBtn = document.getElementById('start-btn');

    // Initialize Game Screen state
    gameScreen.classList.add('slide-down');
    gameScreen.classList.remove('hidden'); // Remove hidden so it can slide up

    startBtn.addEventListener('click', () => {
        // Slide out start screen
        startScreen.classList.add('slide-up');

        // Slide in game screen
        setTimeout(() => {
            gameScreen.classList.remove('slide-down');
        }, 100); // Slight delay for smoother transition start

        // Fully hide start screen after transition
        setTimeout(() => {
            startScreen.classList.add('hidden');
        }, 1000);
    });

    // Game Variables
    let biscuits = 0;
    let tapMultiplier = 1;

    // Upgrades Data
    const defaultUpgradesData = [
        { id: 'blanket', name: 'Blanket', baseCost: 50, currentCost: 50, count: 0, multiplier: 2, isSunbeam: false },
        { id: 'pillow', name: 'Pillow', baseCost: 100, currentCost: 100, count: 0, multiplier: 4, isSunbeam: false },
        { id: 'spring_toy', name: 'Spring Toy', baseCost: 200, currentCost: 200, count: 0, multiplier: 8, isSunbeam: false },
        { id: 'carboard_box', name: 'Cardboard Box', baseCost: 500, currentCost: 500, count: 0, multiplier: 16, isSunbeam: false },
        { id: 'mouse_toy', name: 'Mouse Toy', baseCost: 1000, currentCost: 1000, count: 0, multiplier: 32, isSunbeam: false },
        { id: 'sunbeam', name: 'Sunbeam', baseCost: 2000, currentCost: 2000, count: 0, multiplier: 0, isSunbeam: true }, // Special item
        { id: 'cat_tree', name: 'Cat Tree', baseCost: 4000, currentCost: 4000, count: 0, multiplier: 64, isSunbeam: false },
        { id: 'motivational_poster', name: 'Motivational Poster', baseCost: 8000, currentCost: 8000, count: 0, multiplier: 128, isSunbeam: false }
    ];
    let upgradesData = JSON.parse(JSON.stringify(defaultUpgradesData));

    function saveGame() {
        const gameState = {
            biscuits,
            tapMultiplier,
            upgradesData
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

                // Merge loaded upgrades with defaults to prevent issues if game updates
                if (gameState.upgradesData) {
                    upgradesData = gameState.upgradesData;
                    // Trigger global visibility update
                    updateStickerVisibility();
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

    // Sunbeam State
    let sunbeamActive = false;
    let sunbeamInterval = null;
    let sunbeamTimeout = null;

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
        biscuitCountEl.textContent = Math.floor(biscuits);
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
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-cost">Cost: <span class="cost-val" id="cost-${upgrade.id}">${Math.floor(upgrade.currentCost)}</span> biscuits</div>
                    <div class="upgrade-desc">${upgrade.isSunbeam ? 'Auto-tap for 60s' : '+' + upgrade.multiplier + 'x Multiplier'}</div>
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

            // Increment count
            upgrade.count += 1;
            document.getElementById(`count-${upgrade.id}`).textContent = `${upgrade.count}x`;

            if (upgrade.isSunbeam) {
                // Sunbeam remains flat cost, activate logic here later
                activateSunbeam();
            } else {
                // Standard item: increase cost by 1.15x
                upgrade.currentCost = Math.ceil(upgrade.currentCost * 1.15);
                document.getElementById(`cost-${upgrade.id}`).textContent = Math.floor(upgrade.currentCost);

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
        if (sunbeamActive) {
            // Reset timer if already active
            clearTimeout(sunbeamTimeout);
            clearInterval(sunbeamInterval);
        }

        sunbeamActive = true;
        bgImage.src = 'assets/bg_sunbeam.png';

        // Auto-tap 2 times per second
        sunbeamInterval = setInterval(() => {
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
        }, 500); // 500ms = 2 taps per second

        // End after 60 seconds
        sunbeamTimeout = setTimeout(() => {
            endSunbeam();
        }, 60000);
    }

    const resetBtn = document.getElementById('reset-btn');
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
        clearInterval(sunbeamInterval);
        bgImage.src = 'assets/bg_game.png';
        catImage.src = 'assets/cat_rest.png';
        catAnimIndex = 0;
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
            if (!catImage.dataset.scale) catImage.dataset.scale = "1"; // Default scale for cat
            if (!catImage.dataset.flip) catImage.dataset.flip = "false";

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

                // Initialize custom transform values if not set
                if (!sticker.dataset.scale) sticker.dataset.scale = "0.5";

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