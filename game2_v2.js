document.addEventListener('DOMContentLoaded', () => {
    console.log("Game 2 initialized");

    const startScreen = document.getElementById('start-screen');
    const game2StartScreen = document.getElementById('game2-start-screen');
    const gameScreen = document.getElementById('game-screen');
    const game2StartBtn = document.getElementById('game2-start-btn');

    // Toggle Buttons
    const game2UnlockBtn = document.getElementById('game2-unlock-btn');
    const game1SwitchBtn = document.getElementById('game1-switch-btn');
    const globalBgImage = document.getElementById('bg-image');

    // UI Elements for Transition
    const headerEl = document.getElementById('header');
    const catContainerEl = document.getElementById('cat-container');
    const stickersContainerEl = document.getElementById('stickers-container');
    const upgradeListContEl = document.getElementById('upgrade-list');
    const settingsAreaEl = document.getElementById('settings-area');

    // Game 2 UI Elements
    const game2Screen = document.getElementById('game2-screen');

    // Track total clicks in Game 2
    game2Screen.addEventListener('click', () => {
        if (!game2Ended && !game2Screen.classList.contains('hidden')) {
            game2TotalClicks++;
        }
    });

    const game2HeaderEl = document.getElementById('game2-header');
    const game2BackgroundContEl = document.getElementById('game2-background-container');
    const game2StoreListContEl = document.getElementById('game2-store-list');
    const game2SettingsAreaEl = document.getElementById('game2-settings-area');
    const game2BiscuitCountEl = document.getElementById('game2-biscuit-count');

    // Global Game 2 Variables
    let game2Biscuits = 0;
    let game2TotalClicks = 0;
    let game2Ended = false;

    let selectedStonkLabel = null; // Tracks currently selected stonk

    const STONKS_CONFIG = [
        { label: 'Tuna Inc', icon: 'assets/tuna_can.png' },
        { label: 'Yarn Corp', icon: 'assets/yarn_ball.png' },
        { label: 'Salmon Tech', icon: 'assets/robot_salmon.png' },
        { label: 'Laser Dynamics', icon: 'assets/laser_pointer.png' },
        { label: 'Cardboard Box LLC', icon: 'assets/carboard_box.png' },
        { label: 'Catnip Futures', icon: 'assets/catnip_leaf.png' },
        { label: 'Solar Energy Co', icon: 'assets/solar_panel.png' },
        { label: 'Spring Toy Co', icon: 'assets/spring_toy.png' }
    ];

    // Game 2 Default Stonk Ownership Data
    const defaultGame2StonkOwnership = {
        'Tuna Inc': 0,
        'Yarn Corp': 0,
        'Salmon Tech': 0,
        'Laser Dynamics': 0,
        'Cardboard Box LLC': 0,
        'Catnip Futures': 0,
        'Solar Energy Co': 0,
        'Spring Toy Co': 0
    };

    let game2StonkOwnership = JSON.parse(JSON.stringify(defaultGame2StonkOwnership));

    // Catnip State
    let catnipLevel = 0;
    let isCrashedOut = false;

    // Track cat looking mechanic
    let isCatLooking = false;
    let catLookingTimeout = null;
    let previousOwnedStonkValue = 0;
    let investigatedStonks = []; // Tracks stonks under insider trading investigation

    // Game 2 Default Store Items Data
    const defaultGame2StoreItemsData = [
        // Tangible Assets
        { id: 'asset-sportscar', name: 'Cardboard Sports Car', type: 'asset', icon: 'assets/cardboard_sportscar.png', baseCost: 1000, count: 0, desc: 'Got some zoomies? You can park this tax free asset.', effect: 'Hides wealth from liquid tax audits.' },
        { id: 'asset-yacht', name: 'Cardboard Yacht', type: 'asset', icon: 'assets/cardboard_yacht.png', baseCost: 10000, count: 0, desc: 'Look at me, look. I am the CAT-tain now.', effect: 'Offshore assets are always in a tax free harbour.' },
        { id: 'asset-goldstatue', name: 'Gold Statue', type: 'asset', icon: 'assets/gold_statue.png', baseCost: 100000, count: 0, desc: 'A monument to the most important being in the universe.', effect: 'Solid gold of course, scratch free and tax free.' },
        { id: 'asset-diamondlitter', name: 'Diamond Litter', type: 'asset', icon: 'assets/diamond_litter.png', baseCost: 1000000, count: 0, desc: 'Just the place for my own diamonds in the rough.', effect: 'Turn taxable biscuits into sparkly, unauditable waste.' },
        { id: 'asset-privateisland', name: 'Private Island Litterbox', type: 'asset', icon: 'assets/private_island_litterbox.png', baseCost: 10000000, count: 0, desc: 'The ultimate in offshore accounts, by having your own shore.', effect: 'Send a friendly hello to the tax office from your haven.' },

        // Shell Companies
        { id: 'shell-company', name: 'Shell Company', type: 'shell', icon: 'assets/shell_shellcompany.png', baseCost: 10000, count: 0, bps: 100, desc: 'A literal shell company.', effect: 'Hide your wealth and earn +100 biscuits/sec off the books.' },
        { id: 'shell-3dogs', name: '3 Dogs in a Trenchcoat Inc.', type: 'shell', icon: 'assets/shell_3dogstrenchcoat.png', baseCost: 100000, count: 0, bps: 1000, desc: 'Trust us to manage your biscuits for some returns.', effect: 'Totally legit and earns +1000 biscuits/sec.' },
        { id: 'shell-laundry', name: 'Money Laundromat', type: 'shell', icon: 'assets/shell_cashlaundry.png', baseCost: 500000, count: 0, bps: 5000, desc: 'Take your dirty traceable biscuits...', effect: '...and turn them into nice clean tax free ones. Earns +5000 biscuits/sec.' },
        { id: 'shell-shadowboard', name: 'Shadow Board', type: 'shell', icon: 'assets/shell_shadowboard.png', baseCost: 500000, count: 0, desc: 'The Lizardmen of the Shadow Board will look after your best interests...', effect: '...with their influence as long as they get a slice.' },

        // Legit Businesses
        { id: 'business-storage', name: 'Storage Company', type: 'business', icon: 'assets/business_storagecompany.png', baseCost: 10000, count: 0, bps: 100, desc: 'Do you have a box? Do you need a place to put that box?', effect: 'Do you want a box for your box? Earns +100 biscuits/sec.', stonkLink: ['Cardboard Box LLC'], stonkDepress: ['Laser Dynamics'], threshold: 50, maxModifier: 0.015 },
        { id: 'business-petstore', name: 'Pet Store', type: 'business', icon: 'assets/business_petstore.png', baseCost: 100000, count: 0, bps: 1000, desc: 'From magic red dots to toys for all.', effect: 'A good investment for stonks, earns +1000 biscuits/sec.', stonkLink: ['Laser Dynamics', 'Yarn Corp', 'Spring Toy Co'], stonkDepress: ['Solar Energy Co', 'Cardboard Box LLC'], threshold: 40, maxModifier: 0.016 },
        { id: 'business-dispensary', name: 'Catnip Dispensary', type: 'business', icon: 'assets/business_dispensary.png', baseCost: 500000, count: 0, bps: 5000, desc: 'Medical grade catnip. Locally source. totally legal.', effect: 'Very green, earns +5000 biscuits/sec.', stonkLink: ['Catnip Futures', 'Tuna Inc'], stonkDepress: ['Yarn Corp', 'Salmon Tech'], threshold: 30, maxModifier: 0.017 },
        { id: 'business-solarfarm', name: 'Solar Farm', type: 'business', icon: 'assets/business_solarfarm.png', baseCost: 1000000, count: 0, bps: 10000, desc: 'Storing sunbeams for access 24x7.', effect: 'Limitless potential, earns +10000 biscuits/sec.', stonkLink: ['Solar Energy Co'], stonkDepress: ['Catnip Futures'], threshold: 20, maxModifier: 0.018 }
    ];

    // Game 2 Store Items Data
    let game2StoreItemsData = JSON.parse(JSON.stringify(defaultGame2StoreItemsData));

    function saveGame2() {
        const game2State = {
            game2Biscuits,
            game2StoreItemsData,
            game2StonkOwnership,
            investigatedStonks,
            game2TotalClicks,
            game2Ended
        };
        window.PickleShared.setLocalStorage('pickleClickerGame2Save', game2State);
    }

    function loadGame2() {
        const game2State = window.PickleShared.getLocalStorage('pickleClickerGame2Save', null);
        if (game2State) {
            try {
                game2Biscuits = game2State.game2Biscuits || 0;
                game2TotalClicks = game2State.game2TotalClicks || 0;
                game2Ended = game2State.game2Ended || false;
                if (game2State.game2StoreItemsData) {
                    // Load saved data, but update with any new desc/effect/properties from defaults
                    game2StoreItemsData = defaultGame2StoreItemsData.map(defaultItem => {
                        const savedItem = game2State.game2StoreItemsData.find(s => s.id === defaultItem.id);
                        if (savedItem) {
                            return { ...savedItem, id: defaultItem.id, type: defaultItem.type, desc: defaultItem.desc, effect: defaultItem.effect, name: defaultItem.name, stonkLink: defaultItem.stonkLink, stonkDepress: defaultItem.stonkDepress, threshold: defaultItem.threshold, maxModifier: defaultItem.maxModifier, baseCost: defaultItem.baseCost, bps: defaultItem.bps };
                        }
                        return { ...defaultItem };
                    });
                }
                if (game2State.game2StonkOwnership) {
                    game2StonkOwnership = game2State.game2StonkOwnership;
                }
                if (game2State.investigatedStonks) {
                    investigatedStonks = Array.isArray(game2State.investigatedStonks)
                        ? game2State.investigatedStonks
                        : Array.from(game2State.investigatedStonks || []);
                }
                return true;
            } catch (e) {
                console.error("Failed to parse Game 2 save data", e);
            }
        }
        return false;
    }

    // Catnip Decay Logic
    setInterval(() => {
        if (isCrashedOut) {
            // Decay down to -2 for the 6-second cooldown penalty
            catnipLevel--;
            if (catnipLevel <= -2) {
                isCrashedOut = false;
                catnipLevel = 0;
            }
            updateCatnipUI();
        } else if (catnipLevel > 0) {
            catnipLevel--;
            updateCatnipUI();
        }
    }, 3000);

    // Stonk Market Config and Timer
    let stonkMarketSpeed = 1000;
    setInterval(() => {
        if (!document.getElementById('start-screen').classList.contains('slide-up')) return;
        if (!game2Ended && !game2Screen.classList.contains('hidden') && game2StartScreen.classList.contains('hidden')) {
            updateStonksMarket();
        }
    }, stonkMarketSpeed);

    // Game 2 Passive Income Loop
    setInterval(() => {
        if (!document.getElementById('start-screen').classList.contains('slide-up')) return;
        if (!game2Ended && !game2Screen.classList.contains('hidden') && game2StartScreen.classList.contains('hidden')) {
            let passiveIncome = 0;
            game2StoreItemsData.forEach(item => {
                if (item.bps && item.count > 0) {
                    passiveIncome += (item.bps * item.count);
                }
            });
            if (passiveIncome > 0) {
                game2Biscuits += passiveIncome;
            }
        }
    }, 1000);

    // Tax Audit Loop
    let auditActive = false;
    setInterval(async () => {
        if (!document.getElementById('start-screen').classList.contains('slide-up')) return;
        if (game2Ended || game2Screen.classList.contains('hidden') || !game2StartScreen.classList.contains('hidden') || auditActive) {
            return;
        }

        // Calculate Audit Exposure
        const totalNetWorth = calculateTotalNetWorth();

        let hiddenAssetsCount = 0;
        let legitBusinessCount = 0;
        let shellCompanyCount = 0;

        game2StoreItemsData.forEach(item => {
            if (item.type === 'asset') hiddenAssetsCount += item.count;
            if (item.type === 'business') legitBusinessCount += item.count;
            if (item.type === 'shell') shellCompanyCount += item.count;
        });

        // Check if player has anything to be audited on
        if (hiddenAssetsCount === 0 && legitBusinessCount === 0 && shellCompanyCount === 0 && (totalNetWorth - game2Biscuits) === 0) {
            auditActive = false;
            return;
        }

        // Base exposure from wealth: 1% per 10k net worth, max 50%
        let wealthExposure = Math.min(50, Math.floor(totalNetWorth / 10000));

        // Ratio exposure
        let ratioExposure = 0;
        if (legitBusinessCount === 0 && hiddenAssetsCount > 0) {
            ratioExposure = 20; // Suspicious: hidden assets but no legit businesses
        } else if (legitBusinessCount > 0) {
            const ratio = hiddenAssetsCount / legitBusinessCount;
            if (ratio > 2) ratioExposure = 15;
            else if (ratio > 1) ratioExposure = 5;
        }

        let catnipExposure = (catnipLevel > 0) ? (catnipLevel * 2) : 0; // Up to 20%

        let exposurePercent = wealthExposure + ratioExposure + catnipExposure;

        // Money Laundromat reduces exposure (5% per count)
        const moneyLaundromat = game2StoreItemsData.find(item => item.id === 'shell-laundry');
        if (moneyLaundromat && moneyLaundromat.count > 0) {
            exposurePercent -= (moneyLaundromat.count * 5);
        }

        exposurePercent = Math.max(0, Math.min(100, exposurePercent));

        let triggerAudit = (Math.random() * 100) < exposurePercent;

        // Guarantee audit if crashed out
        let aggressiveAudit = false;
        if (isCrashedOut) {
            triggerAudit = true;
            aggressiveAudit = true;
        }

        if (triggerAudit) {
            auditActive = true;

            const shadowBoard = game2StoreItemsData.find(item => item.id === 'shell-shadowboard');
            if (shadowBoard && shadowBoard.count > 0 && !aggressiveAudit) {
                shadowBoard.count -= 1;
                await window.PickleShared.showAlertModal(
                    "The Tax Office attempted an audit, but your Shadow Board used its influence to make them look the other way.",
                    "assets/tax_dog.png",
                    "Audit Averted!"
                );
                updateGame2UI();
            } else {
                let modalMessage = "";
                let fine = 0;

                // 1. Liquid Penalty
                if (game2Biscuits > 0) {
                    const penaltyPercent = (Math.random() * 0.14) + 0.01; // 1% to 15%
                    fine = Math.floor(game2Biscuits * penaltyPercent);
                    game2Biscuits -= fine;
                    modalMessage += `The Tax Office audited you and seized ${window.PickleShared.formatNumber(fine)} liquid biscuits.\n\n`;
                } else {
                    modalMessage += "The Tax Office audited you but as you are bankrupt they could not fine your liquid accounts.\n\n";
                }

                // 2. Investigation Roll
                let findChance = 0.3; // 30% base chance to find hidden money
                if (shellCompanyCount > 0) {
                    findChance += 0.2; // Higher chance if you have shell companies
                }
                if (aggressiveAudit) {
                    findChance += 0.4; // Highly likely if crashed out
                }

                if (Math.random() < findChance) {
                    // Investigation Succeeds: Seize something
                    modalMessage += "Their deep investigation found irregularities!\n";

                    let seizedItem = null;
                    let possibleSeizures = game2StoreItemsData.filter(item => item.type === 'shell' && item.count > 1 && item.id !== 'shell-shadowboard');

                    if (possibleSeizures.length > 0) {
                        seizedItem = possibleSeizures[Math.floor(Math.random() * possibleSeizures.length)];
                    } else {
                        let legitSeizures = game2StoreItemsData.filter(item => item.type === 'business' && item.count > 5);
                        if (legitSeizures.length > 0) {
                            seizedItem = legitSeizures[Math.floor(Math.random() * legitSeizures.length)];
                        }
                    }

                    if (seizedItem) {
                        seizedItem.count -= 1;
                        modalMessage += `They seized one of your ${seizedItem.name}!`;
                    } else {
                        modalMessage += "However, they couldn't find any physical assets to seize.";
                    }
                } else {
                    // Investigation Fails
                    if (fine > 0) {
                        modalMessage += "They investigated further but found no hidden assets.";
                    } else {
                        modalMessage = "The Tax Office audited your accounts but found nothing suspicious. You are safe... for now.";
                    }
                }

                await window.PickleShared.showAlertModal(
                    modalMessage.trim(),
                    "assets/tax_dog.png",
                    fine > 0 || modalMessage.includes("seized") ? "Audited!" : "Safe... For Now"
                );
                updateGame2UI();
            }

            auditActive = false;
        }
    }, 180000); // Check every 3 minutes

    // Auto-save and Update Game 2 UI periodically
    setInterval(() => {
        if (!document.getElementById('start-screen').classList.contains('slide-up')) return;
        if (!game2Screen.classList.contains('hidden') && game2StartScreen.classList.contains('hidden')) {
            saveGame2();
            if (!game2Ended) {
                updateGame2UI();
                updateStonksMonitorUI();
                updateSelectedStonkUI();
            }
        }
    }, 1000);

    // Event delegation for Stonk Monitor clicks
    document.getElementById('stonk-column-1').addEventListener('click', handleStonkClick);
    document.getElementById('stonk-column-2').addEventListener('click', handleStonkClick);


    // Stonk Buy/Sell Action Logic
    const selectedStonkBuyBtn = document.getElementById('selected-stonk-buy');
    const selectedStonkSellBtn = document.getElementById('selected-stonk-sell');

    if (selectedStonkBuyBtn) {
        selectedStonkBuyBtn.addEventListener('click', () => {
            if (!selectedStonkLabel) return;
            const currentPrice = getCurrentStonkPrice(selectedStonkLabel);
            const costFor100 = currentPrice * 100;

            if (game2Biscuits >= costFor100) {
                game2Biscuits -= costFor100;
                game2StonkOwnership[selectedStonkLabel] = (game2StonkOwnership[selectedStonkLabel] || 0) + 100;

                updateGame2UI();
                updateSelectedStonkUI();
                saveGame2();
            }
        });
    }

    if (selectedStonkSellBtn) {
        selectedStonkSellBtn.addEventListener('click', () => {
            if (!selectedStonkLabel) return;
            const currentOwned = game2StonkOwnership[selectedStonkLabel] || 0;

            if (currentOwned >= 100) {
                const currentPrice = getCurrentStonkPrice(selectedStonkLabel);
                const revenueFor100 = currentPrice * 100;

                game2StonkOwnership[selectedStonkLabel] -= 100;
                game2Biscuits += revenueFor100;

                updateGame2UI();
                updateSelectedStonkUI();
                saveGame2();
            }
        });
    }

    function handleStonkClick(e) {
        const item = e.target.closest('.stonk-monitor-item');
        if (!item) return;

        const label = item.getAttribute('data-label');
        if (selectedStonkLabel === label) {
            // Deselect if already selected
            selectedStonkLabel = null;
        } else {
            // Select new stonk
            selectedStonkLabel = label;
        }

        updateStonksMonitorUI();
        updateSelectedStonkUI();
        updateStonksChartHighlight();
    }

    function updateStonksChartHighlight() {
        if (!window.stonksChartInstance) return;

        window.stonksChartInstance.data.datasets.forEach(dataset => {
            if (selectedStonkLabel) {
                if (dataset.label === selectedStonkLabel) {
                    dataset.borderColor = dataset._defaultBorderColor;
                } else {
                    dataset.borderColor = 'rgba(255, 255, 255, 0.1)'; // Dull greyish transparent
                }
            } else {
                // Nothing selected, restore all to default
                dataset.borderColor = dataset._defaultBorderColor;
            }
        });

        window.stonksChartInstance.update();
    }

    // Check if Game 2 is unlocked
    const savedLeaderboard = window.PickleShared.getLocalStorage('pickleClickerLeaderboard', null);
    if (savedLeaderboard) {
        const hasValidScore = savedLeaderboard.some(entry => typeof entry === 'object' && entry !== null && 'biscuitsLeft' in entry);
        if (hasValidScore) {
            game2UnlockBtn.classList.remove('hidden');
        }
    }

    game2UnlockBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        gameScreen.classList.add('hidden'); // Hide Game 1 background

        game2Screen.classList.remove('hidden'); // Show Game 2 background
        game2StartScreen.classList.remove('hidden');
        game2StartScreen.classList.remove('slide-up');
        if (globalBgImage) globalBgImage.src = 'assets/bg_game_stonks.png';

        if(game2HeaderEl) game2HeaderEl.classList.add('ui-offscreen-top');

        // Hide game 2 inner stickers
        const billionProgress = document.getElementById('billion-progress-container');
        const game2Graph = document.getElementById('game2-graph-container');
        const stonkCol1 = document.getElementById('stonk-column-1');
        const stonkCol2 = document.getElementById('stonk-column-2');
        const game2CatCont = document.getElementById('game2-cat-container');
        const game2CrashedCatCont = document.getElementById('game2-crashedcat-container');
        const catnipMeter = document.getElementById('catnip-meter-container');
        const selectedStonk = document.getElementById('game2-selected-stonk');
        const game2Stickers = document.getElementById('game2-stickers-container');

        if(billionProgress) billionProgress.classList.add('ui-offscreen-bottom');
        if(game2Graph) game2Graph.classList.add('ui-offscreen-bottom');
        if(stonkCol1) stonkCol1.classList.add('ui-offscreen-bottom');
        if(stonkCol2) stonkCol2.classList.add('ui-offscreen-bottom');
        if(game2CatCont) game2CatCont.classList.add('ui-offscreen-bottom');
        if(game2CrashedCatCont) game2CrashedCatCont.classList.add('ui-offscreen-bottom');
        if(catnipMeter) catnipMeter.classList.add('ui-offscreen-bottom');
        if(selectedStonk) selectedStonk.classList.add('ui-offscreen-bottom');
        if(game2Stickers) game2Stickers.classList.add('ui-offscreen-bottom');


        if(game2StoreListContEl) {
            game2StoreListContEl.style.visibility = 'hidden';
            game2StoreListContEl.style.opacity = '0';
            game2StoreListContEl.style.pointerEvents = 'none';
        }
        if(game2SettingsAreaEl) {
            game2SettingsAreaEl.style.visibility = 'hidden';
            game2SettingsAreaEl.style.opacity = '0';
            game2SettingsAreaEl.style.pointerEvents = 'none';
        }
        if(game2BackgroundContEl) {
            game2BackgroundContEl.classList.remove('game-bg-active');
            game2BackgroundContEl.classList.add('game-bg-inactive');
        }
    });

    game1SwitchBtn.addEventListener('click', () => {
        game2StartScreen.classList.add('hidden');
        game2Screen.classList.add('hidden'); // Hide Game 2 background

        gameScreen.classList.remove('hidden'); // Show Game 1 background
        // Make sure Game 1 UI is hidden and ready for start screen
        headerEl.classList.add('ui-offscreen-top');
        catContainerEl.classList.add('ui-offscreen-bottom');
        stickersContainerEl.classList.add('ui-offscreen-bottom');
        upgradeListContEl.style.visibility = 'hidden';
        upgradeListContEl.style.opacity = '0';
        upgradeListContEl.style.pointerEvents = 'none';
        settingsAreaEl.style.visibility = 'hidden';
        settingsAreaEl.style.opacity = '0';
        settingsAreaEl.style.pointerEvents = 'none';
        document.getElementById("background-container").classList.remove('game-bg-active');
        document.getElementById("background-container").classList.add('game-bg-inactive');
        startScreen.classList.remove('hidden');
        startScreen.classList.remove('slide-up');

        if (globalBgImage) globalBgImage.src = 'assets/bg_game.png';
    });

    game2StartBtn.addEventListener('click', () => {
        // Since user clicked Start from the title screen, start a completely fresh Game 2 run.
        localStorage.removeItem('pickleClickerGame2Save');

        // Reset state variables to defaults
        game2Biscuits = 0;
        game2TotalClicks = 0;
        game2Ended = false;
        investigatedStonks = [];
        game2StonkOwnership = {};
        // Deep copy defaults
        game2StoreItemsData = defaultGame2StoreItemsData.map(item => ({...item}));
        if(window.stonksChartInstance) {
           window.stonksChartInstance.destroy();
           window.stonksChartInstance = null;
        }

        const hasSave = false;
        if (!hasSave) {
            const savedLeaderboard = window.PickleShared.getLocalStorage('pickleClickerLeaderboard', null);
            if (savedLeaderboard) {
                // Find the best score (lowest) that has biscuitsLeft. Since it's sorted ascending by score,
                // the first one we find that is an object with biscuitsLeft is the correct one.
                const bestValidEntry = savedLeaderboard.find(entry => typeof entry === 'object' && entry !== null && 'biscuitsLeft' in entry);
                if (bestValidEntry) {
                    game2Biscuits = bestValidEntry.biscuitsLeft;
                    saveGame2(); // Initial save
                }
            }
        }

        // Slide out start screen components
        game2StartScreen.classList.add('slide-up');
        gameScreen.classList.add('hidden'); // Hide Game 1 container to be safe
        game2Screen.classList.remove('hidden');

        // Init biscuits visual
        if(game2BiscuitCountEl) game2BiscuitCountEl.textContent = Number(game2Biscuits).toLocaleString();
        updateNetWorthProgressBar();

        if (typeof window.initStonksChart === 'function') window.initStonksChart();

        renderGame2StoreItems();
        updateGame2UI();
        updateStonksMonitorUI();

        // Prepare to show game 2 UI
        setTimeout(() => {
            if(game2HeaderEl) game2HeaderEl.classList.remove('ui-offscreen-top');

            // Show game 2 inner stickers
            const billionProgress = document.getElementById('billion-progress-container');
            const game2Graph = document.getElementById('game2-graph-container');
            const stonkCol1 = document.getElementById('stonk-column-1');
            const stonkCol2 = document.getElementById('stonk-column-2');
            const game2CatCont = document.getElementById('game2-cat-container');
            const game2CrashedCatCont = document.getElementById('game2-crashedcat-container');
            const catnipMeter = document.getElementById('catnip-meter-container');
            const selectedStonk = document.getElementById('game2-selected-stonk');
            const game2Stickers = document.getElementById('game2-stickers-container');

            if(billionProgress) billionProgress.classList.remove('ui-offscreen-bottom');
            if(game2Graph) game2Graph.classList.remove('ui-offscreen-bottom');
            if(stonkCol1) stonkCol1.classList.remove('ui-offscreen-bottom');
            if(stonkCol2) stonkCol2.classList.remove('ui-offscreen-bottom');
            if(game2CatCont) game2CatCont.classList.remove('ui-offscreen-bottom');
            if(game2CrashedCatCont) game2CrashedCatCont.classList.remove('ui-offscreen-bottom');
            if(catnipMeter) catnipMeter.classList.remove('ui-offscreen-bottom');
            if(selectedStonk) selectedStonk.classList.remove('ui-offscreen-bottom');
            if(game2Stickers) game2Stickers.classList.remove('ui-offscreen-bottom');

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

            if (typeof window.initStonksChart === 'function') window.initStonksChart();
        }, 100);

        setTimeout(() => {
            game2StartScreen.classList.add('hidden');

            if (!hasSave) {
                const game2InstrModal = document.getElementById('game2-instructions-modal');
                if (game2InstrModal) {
                    game2InstrModal.classList.remove('hidden');
                }
            }
        }, 1000);
    });

    // Game 2 Instructions OK button
    const game2InstrOkBtn = document.getElementById('game2-instructions-ok');
    if (game2InstrOkBtn) {
        game2InstrOkBtn.addEventListener('click', () => {
            document.getElementById('game2-instructions-modal').classList.add('hidden');
        });
    }

    const endgameJumpGame2Btn = document.getElementById('endgame-jump-game2');
    if (endgameJumpGame2Btn) {
        endgameJumpGame2Btn.addEventListener('click', () => {
            document.getElementById('endgame-modal').classList.add('hidden');
            document.getElementById('game-screen').classList.add('hidden');
            startScreen.classList.add('hidden');

            game2Screen.classList.remove('hidden'); // Ensure game2 screen is visible for background
            game2StartScreen.classList.remove('hidden');
            game2StartScreen.classList.remove('slide-up');
            // Make sure background is ready for game 2
            const bgImageEl = document.getElementById('bg-image');
            if (bgImageEl) {
                bgImageEl.src = 'assets/bg_game_stonks.png';
            }
            if (globalBgImage) globalBgImage.src = 'assets/bg_game_stonks.png';

            if(game2HeaderEl) game2HeaderEl.classList.add('ui-offscreen-top');

            // Hide game 2 inner stickers
            const billionProgress = document.getElementById('billion-progress-container');
            const game2Graph = document.getElementById('game2-graph-container');
            const stonkCol1 = document.getElementById('stonk-column-1');
            const stonkCol2 = document.getElementById('stonk-column-2');
            const game2CatCont = document.getElementById('game2-cat-container');
            const game2CrashedCatCont = document.getElementById('game2-crashedcat-container');
            const catnipMeter = document.getElementById('catnip-meter-container');
            const selectedStonk = document.getElementById('game2-selected-stonk');
            const game2Stickers = document.getElementById('game2-stickers-container');

            if(billionProgress) billionProgress.classList.add('ui-offscreen-bottom');
            if(game2Graph) game2Graph.classList.add('ui-offscreen-bottom');
            if(stonkCol1) stonkCol1.classList.add('ui-offscreen-bottom');
            if(stonkCol2) stonkCol2.classList.add('ui-offscreen-bottom');
            if(game2CatCont) game2CatCont.classList.add('ui-offscreen-bottom');
            if(game2CrashedCatCont) game2CrashedCatCont.classList.add('ui-offscreen-bottom');
            if(catnipMeter) catnipMeter.classList.add('ui-offscreen-bottom');
            if(selectedStonk) selectedStonk.classList.add('ui-offscreen-bottom');
            if(game2Stickers) game2Stickers.classList.add('ui-offscreen-bottom');

            if(game2StoreListContEl) {
                game2StoreListContEl.style.visibility = 'hidden';
                game2StoreListContEl.style.opacity = '0';
                game2StoreListContEl.style.pointerEvents = 'none';
            }
            if(game2SettingsAreaEl) {
                game2SettingsAreaEl.style.visibility = 'hidden';
                game2SettingsAreaEl.style.opacity = '0';
                game2SettingsAreaEl.style.pointerEvents = 'none';
            }
            if(game2BackgroundContEl) {
                game2BackgroundContEl.classList.remove('game-bg-active');
                game2BackgroundContEl.classList.add('game-bg-inactive');
            }
        });
    }

    // --- INVESTIGATION MODAL ---
    const investigationModal = document.getElementById('investigation-modal');
    const investigationModalMessage = document.getElementById('investigation-modal-message');
    const investigationModalOk = document.getElementById('investigation-modal-ok');

    let investigationModalActive = false;

    function showInvestigationModal(stonkLabel) {
        if (!investigationModal || investigationModalActive) return;
        investigationModalActive = true;
        investigationModalMessage.textContent = `The Tax Office has noticed suspiciously high trading volume and prices for ${stonkLabel}. An investigation has been launched! A continuous negative lean will apply until the price cools down.`;
        investigationModal.classList.remove('hidden');

        const handleOk = () => {
            investigationModal.classList.add('hidden');
            investigationModalOk.removeEventListener('click', handleOk);
            investigationModalActive = false;
        };
        investigationModalOk.addEventListener('click', handleOk);
    }


    const catnipBtn = document.getElementById('catnip-btn');

    // Catnip Mechanic
    if (catnipBtn) {
        catnipBtn.addEventListener('click', () => {
            // Note: Dev mode checks could go here if re-implemented
            if (isCrashedOut || catnipLevel >= 10) return;

            if (game2Biscuits < 1000) return;

            game2Biscuits -= 1000;

            // Trigger shake animation
            catnipBtn.classList.remove('shake-anim');
            void catnipBtn.offsetWidth; // trigger reflow
            catnipBtn.classList.add('shake-anim');

            catnipLevel++;

            if (catnipLevel >= 10) {
                isCrashedOut = true;
            }

            updateCatnipUI();
            updateGame2UI();
        });
    }

    function renderGame2StoreItems() {
        const assetCol = document.getElementById('store-items-asset');
        const shellCol = document.getElementById('store-items-shell');
        const businessCol = document.getElementById('store-items-business');

        if (!assetCol || !shellCol || !businessCol) return;

        assetCol.innerHTML = '';
        shellCol.innerHTML = '';
        businessCol.innerHTML = '';

        game2StoreItemsData.forEach(item => {
            const el = document.createElement('div');
            el.className = 'store-item-wrapper';
            el.id = `store-item-wrapper-${item.id}`;

            const disableSell = item.id === 'shell-shadowboard' ? 'disabled style="opacity: 0.5; pointer-events: none;"' : '';
            const sellActive = item.count > 0 && item.id !== 'shell-shadowboard' ? 'active' : '';

            // We calculate width to only cover the middle and buy button (calc(100% - 40px))
            el.innerHTML = `
                <img src="${item.icon}" class="store-item-icon-large" alt="${item.name}">
                <div class="store-item" id="store-item-${item.id}">
                    <div class="store-item-progress" id="progress-${item.id}" style="width: 0%; left: 40px; right: auto;"></div>
                    <div class="store-item-content">
                        <button class="store-btn sell ${sellActive}" data-id="${item.id}" ${disableSell}>-</button>
                        <div class="store-item-middle">
                            <span class="store-item-count" id="count-${item.id}">x${item.count}</span>
                        </div>
                        <button class="store-btn buy" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;

            if (item.type === 'asset') assetCol.appendChild(el);
            else if (item.type === 'shell') shellCol.appendChild(el);
            else if (item.type === 'business') businessCol.appendChild(el);

            const iconEl = el.querySelector('.store-item-icon-large');
            if (iconEl) {
                iconEl.style.cursor = 'pointer';
                iconEl.addEventListener('click', () => {
                    window.PickleShared.showStoreItemModal(item);
                });
            }
        });

        // Add event listeners for buy/sell
        document.querySelectorAll('.store-btn.buy').forEach(btn => {
            btn.addEventListener('click', (e) => handleStoreAction(e.target.dataset.id, 'buy'));
        });
        document.querySelectorAll('.store-btn.sell').forEach(btn => {
            btn.addEventListener('click', (e) => handleStoreAction(e.target.dataset.id, 'sell'));
        });
    }

    function handleStoreAction(itemId, action) {
        const item = game2StoreItemsData.find(i => i.id === itemId);
        if (!item) return;

        if (action === 'buy') {
            const cost = getItemBuyCost(item);
            if (game2Biscuits >= cost) {
                game2Biscuits -= cost;
                item.count++;
                if (item.id === 'shell-shadowboard') {
                    if (item.totalPurchased === undefined) {
                        item.totalPurchased = item.count;
                    } else {
                        item.totalPurchased++;
                    }
                }
                updateGame2UI();
                saveGame2();
            }
        } else if (action === 'sell') {
            if (item.count > 0 && item.id !== 'shell-shadowboard') {
                const sellValue = getItemSellValue(item);
                game2Biscuits += sellValue;
                item.count--;
                updateGame2UI();
                saveGame2();
            }
        }
    }


    function getCurrentStonkPrice(label) {
        if (!window.stonksChartInstance) return 0;
        const dataset = window.stonksChartInstance.data.datasets.find(d => d.label === label);
        if (dataset && dataset.data.length > 0) {
            return dataset.data[dataset.data.length - 1];
        }
        return 0;
    }

    function updateSelectedStonkUI() {
        const iconEl = document.getElementById('selected-stonk-icon');
        const nameEl = document.getElementById('selected-stonk-name');
        const amountEl = document.getElementById('selected-stonk-amount');
        const controlsEl = document.querySelector('.selected-stonk-controls');
        const buyBtn = document.getElementById('selected-stonk-buy');
        const sellBtn = document.getElementById('selected-stonk-sell');

        if (!selectedStonkLabel) {
            iconEl.style.display = 'none';
            if(controlsEl) controlsEl.style.visibility = 'hidden';
            nameEl.textContent = 'Select a Stonk';
            nameEl.style.fontSize = '8.5cqw';
            nameEl.style.whiteSpace = 'nowrap';
            if(buyBtn) buyBtn.classList.remove('active');
            if(sellBtn) sellBtn.classList.remove('active');

            let totalStonks = 0;
            for (const key in game2StonkOwnership) {
                totalStonks += game2StonkOwnership[key];
            }
            if (totalStonks > 0) {
                amountEl.style.display = 'block';
                let formatted = totalStonks >= 1000 ? window.PickleShared.formatNumber(totalStonks) : totalStonks;
                amountEl.innerHTML = `<br><strong style="font-size: 10cqw;">${formatted}</strong><br>Stonks Owned`;
            } else {
                amountEl.style.display = 'none';
            }
            return;
        }

        const config = STONKS_CONFIG.find(c => c.label === selectedStonkLabel);
        if (config) {
            nameEl.style.fontSize = '';
            nameEl.style.whiteSpace = '';
            iconEl.style.display = 'block';
            amountEl.style.display = 'block';
            if(controlsEl) controlsEl.style.visibility = 'visible';
            iconEl.src = config.icon;
            nameEl.textContent = config.label;

            const owned = game2StonkOwnership[config.label] || 0;
            let displayOwned = `${owned} Held`;
            if (owned >= 1000) {
                displayOwned = `${window.PickleShared.formatNumber(owned)} Held`;
            }
            amountEl.textContent = displayOwned;

            if (buyBtn && sellBtn) {
                const currentPrice = getCurrentStonkPrice(config.label);
                const costFor100 = currentPrice * 100;

                if (game2Biscuits >= costFor100) {
                    buyBtn.classList.add('active');
                } else {
                    buyBtn.classList.remove('active');
                }

                if (owned >= 100) {
                    sellBtn.classList.add('active');
                } else {
                    sellBtn.classList.remove('active');
                }
            }
        }
    }

    function updateStonksMarket() {
        if (!window.stonksChartInstance) return;

        // The Complex Stonk Web Links (boosts, depresses)
        const stonkLinks = {
            'Tuna Inc': { boosts: 'Cardboard Box LLC', depresses: 'Yarn Corp' },
            'Salmon Tech': { boosts: 'Laser Dynamics', depresses: 'Spring Toy Co' },
            'Yarn Corp': { boosts: 'Tuna Inc', depresses: 'Catnip Futures' },
            'Laser Dynamics': { boosts: 'Spring Toy Co', depresses: 'Solar Energy Co' },
            'Cardboard Box LLC': { boosts: 'Solar Energy Co', depresses: 'Laser Dynamics' },
            'Solar Energy Co': { boosts: 'Catnip Futures', depresses: 'Tuna Inc' },
            'Catnip Futures': { boosts: 'Salmon Tech', depresses: 'Cardboard Box LLC' },
            'Spring Toy Co': { boosts: 'Yarn Corp', depresses: 'Salmon Tech' }
        };

        let stonkModifiers = {};


        // Handle investigations logic
        window.stonksChartInstance.data.datasets.forEach(dataset => {
            let label = dataset.label;
            let currentPrice = dataset.data[dataset.data.length - 1];

            if (currentPrice >= 1000000 && !investigatedStonks.includes(label)) {
                investigatedStonks.push(label);
                showInvestigationModal(label);
            } else if (currentPrice <= 100000 && investigatedStonks.includes(label)) {
                investigatedStonks = investigatedStonks.filter(s => s !== label);
            }
        });

        // Pass 1: Calculate base modifiers and business modifiers
        window.stonksChartInstance.data.datasets.forEach(dataset => {
            let label = dataset.label;
            let currentPrice = dataset.data[dataset.data.length - 1];

            // Random modifier between -5% to +5%
            let baseModifier = (Math.random() * 0.1) - 0.045;
            let businessModifier = 0;

            // Find associated legit businesses (can be multiple that boost or depress)
            const boostingBusinesses = game2StoreItemsData.filter(item => item.type === 'business' && item.stonkLink && item.stonkLink.includes(label));
            const depressingBusinesses = game2StoreItemsData.filter(item => item.type === 'business' && item.stonkDepress && item.stonkDepress.includes(label));

            boostingBusinesses.forEach(business => {
                if (business.count > 0) {
                    const count = business.count;
                    const threshold = business.threshold;
                    const maxMod = business.maxModifier;
                    let modToAdd = 0;

                    if (count <= threshold * 0.5) {
                        modToAdd = maxMod * (count / (threshold * 0.5));
                    } else if (count <= threshold) {
                        const overflow = count - (threshold * 0.5);
                        const scale = 1 - (overflow / (threshold * 0.5));
                        modToAdd = maxMod * scale;
                    } else {
                        const excess = count - threshold;
                        const penaltyScale = excess / (threshold * 0.5);
                        modToAdd = -(maxMod * penaltyScale);
                    }
                    businessModifier += modToAdd;
                }
            });

            depressingBusinesses.forEach(business => {
                if (business.count > 0) {
                    const count = business.count;
                    const threshold = business.threshold;
                    const maxMod = business.maxModifier;
                    let modToSubtract = 0;

                    if (count <= threshold * 0.5) {
                        modToSubtract = maxMod * (count / (threshold * 0.5));
                    } else if (count <= threshold) {
                        const overflow = count - (threshold * 0.5);
                        const scale = 1 - (overflow / (threshold * 0.5));
                        modToSubtract = maxMod * scale;
                    } else {
                        const excess = count - threshold;
                        const penaltyScale = excess / (threshold * 0.5);
                        modToSubtract = -(maxMod * penaltyScale);
                    }
                    businessModifier -= modToSubtract;
                }
            });

            let primary = baseModifier + businessModifier;

            // Apply Insider Trading penalty lean
            if (investigatedStonks.includes(label)) {
                primary = -0.05; // Complete override
            }

            // Apply Catnip Modifiers on top of base/investigation primary
            if (isCrashedOut) {
                primary -= 0.10; // Strong universal negative crash modifier
            } else if (catnipLevel > 0) {
                primary += (catnipLevel * 0.15); // Large bonus to quickly trigger insider trading limits
            }

            stonkModifiers[label] = {
                primary: primary,
                final: 0
            };
        });

        // Pass 2: Calculate Complex Web Impacts
        window.stonksChartInstance.data.datasets.forEach(dataset => {
            let label = dataset.label;
            let primaryMod = stonkModifiers[label].primary;
            let finalMod = primaryMod;

            // Check if any other stonk impacts this one
            for (const [sourceLabel, links] of Object.entries(stonkLinks)) {
                let sourceMod = stonkModifiers[sourceLabel].primary;

                if (links.boosts === label) {
                    if (sourceMod > 0) {
                        finalMod += (sourceMod * 0.3);
                    }
                }
                if (links.depresses === label) {
                    if (sourceMod > 0) {
                        finalMod -= (sourceMod * 0.3);
                    }
                }
            }

            stonkModifiers[label].final = finalMod;
        });

        // Apply final prices
        window.stonksChartInstance.data.datasets.forEach(dataset => {
            let label = dataset.label;
            let currentPrice = dataset.data[dataset.data.length - 1];
            let finalModifier = stonkModifiers[label].final;

            let exactChange = currentPrice * finalModifier;
            // Probabilistic rounding to prevent low-price lock-in (trapping)
            let integerChange = Math.floor(Math.abs(exactChange));
            let fractionalChange = Math.abs(exactChange) - integerChange;
            if (Math.random() < fractionalChange) {
                integerChange += 1;
            }
            let change = exactChange >= 0 ? integerChange : -integerChange;
            let newPrice = Math.max(1, currentPrice + change);

            dataset.data.shift(); // Remove oldest
            dataset.data.push(newPrice); // Add newest
        });

        window.stonksChartInstance.update();
        updateNetWorthProgressBar();

        // Calculate current owned stonk value to see if there's a surge/drop
        let currentOwnedStonkValue = 0;
        window.stonksChartInstance.data.datasets.forEach(dataset => {
            let currentPrice = dataset.data[dataset.data.length - 1];
            let owned = game2StonkOwnership[dataset.label] || 0;
            currentOwnedStonkValue += (currentPrice * owned);
        });

        // Trigger looking cat if there's a significant change (>2% or >5k change) and not currently looking or in catnip/crashed state
        if (previousOwnedStonkValue > 0) {
            let diff = Math.abs(currentOwnedStonkValue - previousOwnedStonkValue);
            let threshold = 0; // 2% change or 5000 biscuits

            if (diff >= threshold) {
                if (!isCrashedOut && catnipLevel < 5 && !isCatLooking) {
                    isCatLooking = true;
                    updateCatnipUI(); // Will apply looking image

                    if (catLookingTimeout) clearTimeout(catLookingTimeout);
                    catLookingTimeout = setTimeout(() => {
                        isCatLooking = false;
                        updateCatnipUI(); // Will revert to resting image
                    }, 10000); // 10 seconds
                }
            }
        }
        previousOwnedStonkValue = currentOwnedStonkValue;
    }

    function updateStonksMonitorUI() {
        if (!window.stonksChartInstance) return;

        const column1 = document.getElementById('stonk-column-1');
        const column2 = document.getElementById('stonk-column-2');
        if (!column1 || !column2) return;

        column1.innerHTML = '';
        column2.innerHTML = '';

        const datasets = window.stonksChartInstance.data.datasets;

        // 1. Gather all current prices and labels
        let stonkData = datasets.map(dataset => {
            const currentPrice = dataset.data[dataset.data.length - 1];
            const config = STONKS_CONFIG.find(c => c.label === dataset.label) || { icon: '' };
            return {
                label: dataset.label,
                price: currentPrice,
                iconSrc: config.icon
            };
        });

        // 2. Sort stonks by descending price (highest first)
        stonkData.sort((a, b) => b.price - a.price);

        // 3. Render into columns based on requested order
        // Order: Highest price (1st) is right-top. Lowest price (8th) is left-bottom.
        // Specifically:
        // Left Column (top to bottom): 5th, 6th, 7th, 8th
        // Right Column (top to bottom): 1st, 2nd, 3rd, 4th
        const renderItemHTML = (item) => {
            const isSelectedClass = selectedStonkLabel === item.label ? ' selected' : '';
            return `
                <div class="stonk-monitor-item${isSelectedClass}" data-label="${item.label}">
                    <img src="${item.iconSrc}" alt="${item.label}">
                    <span>${window.PickleShared.formatNumber(item.price)} b</span>
                </div>
            `;
        };

        // Right Column gets top 4 (index 0, 1, 2, 3 in sorted array)
        for (let i = 0; i < 4; i++) {
            if(stonkData[i]) column2.innerHTML += renderItemHTML(stonkData[i]);
        }

        // Left Column gets bottom 4 (index 4, 5, 6, 7 in sorted array)
        for (let i = 4; i < 8; i++) {
            if(stonkData[i]) column1.innerHTML += renderItemHTML(stonkData[i]);
        }
    }

    function updateCatnipUI() {
        const fillEl = document.getElementById('catnip-bar-fill');
        const game2CatImg = document.getElementById('game2-cat-image');
        const game2CatCont = document.getElementById('game2-cat-container');
        const game2CrashedCont = document.getElementById('game2-crashedcat-container');

        if (!fillEl || !game2CatImg || !game2CatCont || !game2CrashedCont) return;

        // Calculate visual level (min 0)
        const visualLevel = Math.max(0, catnipLevel);
        fillEl.style.height = `${visualLevel * 10}%`;

        // Determine color
        if (visualLevel < 5) {
            fillEl.style.backgroundColor = '#81c784'; // Green
        } else if (visualLevel < 8) {
            fillEl.style.backgroundColor = '#ffd54f'; // Yellow
        } else {
            fillEl.style.backgroundColor = '#e57373'; // Red
        }

        // Update Cat Sticker
        if (isCrashedOut) {
            game2CatCont.classList.add('hidden');
            game2CrashedCont.classList.remove('hidden');
        } else {
            game2CrashedCont.classList.add('hidden');
            game2CatCont.classList.remove('hidden');
            if (catnipLevel >= 5) {
                game2CatImg.src = 'assets/business_cat_catnip.png';
            } else if (isCatLooking) {
                game2CatImg.src = 'assets/business_cat_looking.png';
            } else {
                game2CatImg.src = 'assets/business_cat_rest.png';
            }
        }
    }

    function getItemBuyCost(item) {
        const exponent = item.id === 'shell-shadowboard' && item.totalPurchased !== undefined ? item.totalPurchased : item.count;
        return Math.floor(item.baseCost * Math.pow(1.15, exponent));
    }

    function getItemSellValue(item) {
        if (item.id === 'shell-shadowboard') return 0;
        // The value of the last item bought is the cost at (count - 1)
        if (item.count <= 0) return 0;
        const exponent = item.count - 1;
        const lastCost = Math.floor(item.baseCost * Math.pow(1.15, exponent));
        return Math.floor(lastCost * 0.75);
    }

    function calculateTotalNetWorth() {
        let netWorth = game2Biscuits;

        // Add Stonk Holdings Value
        if (window.stonksChartInstance && window.stonksChartInstance.data && window.stonksChartInstance.data.datasets) {
            window.stonksChartInstance.data.datasets.forEach(dataset => {
                let currentPrice = dataset.data[dataset.data.length - 1];
                let owned = game2StonkOwnership[dataset.label] || 0;
                netWorth += (currentPrice * owned);
            });
        }

        // Add Item Assets Value
        game2StoreItemsData.forEach(item => {
            if (item.count > 0) {
                // Sum of all past purchase costs
                let itemValue = 0;
                for (let i = 0; i < item.count; i++) {
                    itemValue += Math.floor(item.baseCost * Math.pow(1.15, i));
                }
                netWorth += itemValue;
            }
        });

        return netWorth;
    }

    function updateNetWorthProgressBar() {
        const billionGoal = 1000000000;
        const totalNetWorth = calculateTotalNetWorth();
        const billionProgressBar = document.getElementById('billion-progress-bar');
        const billionProgressContainer = document.getElementById('billion-progress-container');
        const billionProgressText = document.getElementById('billion-progress-text');

        if (billionProgressBar && billionProgressContainer) {
            let nwPercent = (totalNetWorth / billionGoal) * 100;
            if (nwPercent > 100) nwPercent = 100;
            billionProgressBar.style.width = `${nwPercent}%`;
            billionProgressContainer.title = `Net Worth: ${Math.floor(totalNetWorth).toLocaleString()} / 1,000,000,000`;
        }

        if (billionProgressText) {
            billionProgressText.textContent = Math.floor(totalNetWorth).toLocaleString();
        }

        if (totalNetWorth >= billionGoal && !game2Ended) {
            triggerGame2Endgame();
        }
    }

    function triggerGame2Endgame() {
        const wasEnded = game2Ended;
        game2Ended = true;

        // Load leaderboard
        let leaderboard = window.PickleShared.getLocalStorage('pickleClickerGame2Leaderboard', []);

        // Add new score if it wasn't already ended
        if (!wasEnded) {
            leaderboard.push({ score: game2TotalClicks, biscuitsLeft: game2Biscuits });
        }

        // Sort ascending (lower is better)
        leaderboard.sort((a, b) => {
            const scoreA = typeof a === 'object' ? a.score : a;
            const scoreB = typeof b === 'object' ? b.score : b;
            return scoreA - scoreB;
        });

        // Keep top 5
        if (leaderboard.length > 5) {
            leaderboard = leaderboard.slice(0, 5);
        }

        // Save leaderboard
        window.PickleShared.setLocalStorage('pickleClickerGame2Leaderboard', leaderboard);

        // Populate leaderboard UI
        const listEl = document.getElementById('game2-leaderboard-list');
        if (listEl) {
            listEl.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const li = document.createElement('li');
                if (i < leaderboard.length) {
                    const entry = leaderboard[i];
                    const scoreVal = typeof entry === 'object' ? entry.score : entry;
                    li.textContent = `${i + 1}. Actions: ${scoreVal}`;
                } else {
                    li.textContent = `${i + 1}. ---`;
                }
                listEl.appendChild(li);
            }
        }

        // Show End Game Modal only if actively playing Game 2
        if (game2StartScreen.classList.contains('hidden') && !game2Screen.classList.contains('hidden')) {
            const endgameBalanceEl = document.getElementById('game2-endgame-balance');
            if (endgameBalanceEl) {
                endgameBalanceEl.textContent = `Final Balance: ${Math.floor(game2Biscuits).toLocaleString()} liquid biscuits`;
            }

            const endgameModal = document.getElementById('game2-endgame-modal');
            if (endgameModal) {
                endgameModal.classList.remove('hidden');
            }
        }
    }

    function updateGame2UI() {
        updateNetWorthProgressBar();
        if(game2BiscuitCountEl) game2BiscuitCountEl.textContent = Number(game2Biscuits).toLocaleString();

        game2StoreItemsData.forEach(item => {
            const countEl = document.getElementById(`count-${item.id}`);
            if (countEl) countEl.textContent = `x${item.count}`;

            const sellBtn = document.querySelector(`.store-btn.sell[data-id="${item.id}"]`);
            if (sellBtn) {
                if (item.count > 0 && item.id !== 'shell-shadowboard') {
                    sellBtn.classList.add('active');
                } else {
                    sellBtn.classList.remove('active');
                }
            }

            const progressBar = document.getElementById(`progress-${item.id}`);
            if (progressBar) {
                // Calculate percentage based on baseCost
                let currentCost = getItemBuyCost(item);
                let percentage = (game2Biscuits / currentCost) * 100;
                if (percentage > 100) percentage = 100;
                progressBar.style.height = `${percentage}%`;

                if (percentage >= 100) {
                    progressBar.style.backgroundColor = 'rgba(144, 238, 144, 0.4)';
                } else {
                    progressBar.style.backgroundColor = 'rgba(144, 238, 144, 0.2)';
                }
            }

            const buyBtn = document.querySelector(`.store-btn.buy[data-id="${item.id}"]`);
            if (buyBtn) {
                if (game2Biscuits >= getItemBuyCost(item)) {
                    buyBtn.classList.add('active');
                } else {
                    buyBtn.classList.remove('active');
                }
            }
        });
    }

    const game2ResetBtn = document.getElementById('game2-reset-icon');
    if (game2ResetBtn) {
        game2ResetBtn.addEventListener('click', async () => {
            const isConfirmed = await window.PickleShared.showConfirmModal("Are you sure you want to reset your Game 2 progress?");
            if (isConfirmed) {
                resetGame2();
            }
        });
    }

    const game2EndgameResetBtn = document.getElementById('game2-endgame-reset');
    if (game2EndgameResetBtn) {
        game2EndgameResetBtn.addEventListener('click', () => {
            const endgameModal = document.getElementById('game2-endgame-modal');
            if (endgameModal) endgameModal.classList.add('hidden');
            resetGame2();
        });
    }

    const game2EndgameJumpGame3Btn = document.getElementById('game2-endgame-jump-game3');
    if (game2EndgameJumpGame3Btn) {
        game2EndgameJumpGame3Btn.addEventListener('click', async () => {
            document.getElementById('game2-endgame-modal').classList.add('hidden');
            await window.PickleShared.showAlertModal("Game 3 (Mr. Pickles Colonises Mars) is currently in development! Check back later.", "assets/business_cat_rest.png", "Coming Soon");

            // Go back to main title screen cleanly without losing progress
            game2StartScreen.classList.add('hidden');
            game2StartScreen.classList.remove('slide-up');
            game2Screen.classList.add('hidden'); // Hide Game 2 background

            gameScreen.classList.remove('hidden'); // Show Game 1 background
            // Make sure Game 1 UI is hidden and ready for start screen
            headerEl.classList.add('ui-offscreen-top');
            catContainerEl.classList.add('ui-offscreen-bottom');
            stickersContainerEl.classList.add('ui-offscreen-bottom');
            upgradeListContEl.style.visibility = 'hidden';
            upgradeListContEl.style.opacity = '0';
            upgradeListContEl.style.pointerEvents = 'none';
            settingsAreaEl.style.visibility = 'hidden';
            settingsAreaEl.style.opacity = '0';
            settingsAreaEl.style.pointerEvents = 'none';
            document.getElementById("background-container").classList.remove('game-bg-active');
            document.getElementById("background-container").classList.add('game-bg-inactive');
            startScreen.classList.remove('hidden');
            startScreen.classList.remove('slide-up');

            if (globalBgImage) {
                globalBgImage.src = 'assets/bg_game.png';
            }
        });
    }

    function resetGame2() {
        localStorage.removeItem('pickleClickerGame2Save');
        location.reload();
    }


    // --- GAME 2 SPECIFIC LOGIC ---
    window.stonksChartInstance = null;

    window.initStonksChart = function() {
        const ctx = document.getElementById('stonks-chart');
        if (!ctx) return;

        // Prevent re-initialization
        if (window.stonksChartInstance) return;

        // Preload icons for the chart
        const createStonkIcon = (src) => {
            const img = new Image();
            img.src = src;
            img.width = 24;
            img.height = 24;
            return img;
        };

        const icons = {
            tuna: createStonkIcon('assets/tuna_can.png'),
            yarn: createStonkIcon('assets/yarn_ball.png'),
            salmon: createStonkIcon('assets/robot_salmon.png'),
            laser: createStonkIcon('assets/laser_pointer.png'),
            box: createStonkIcon('assets/carboard_box.png'),
            catnip: createStonkIcon('assets/catnip_leaf.png'),
            solar: createStonkIcon('assets/solar_panel.png'),
            spring: createStonkIcon('assets/spring_toy.png')
        };

        // Custom function to only show the icon on the last data point
        const getPointStyle = (icon, label) => (context) => {
            if (selectedStonkLabel && selectedStonkLabel !== label) return false;
            return context.dataIndex === context.dataset.data.length - 1 ? icon : false;
        };

        const generateInitialStonkData = () => {
            const startPrice = Math.floor(Math.random() * 90) + 10;
            let data = [startPrice];
            let currentPrice = startPrice;
            for (let i = 0; i < 9; i++) {
                const modifier = (Math.random() * 0.1) - 0.05; // -5% to +5%
                currentPrice = Math.max(1, Math.round(currentPrice * (1 + modifier)));
                data.push(currentPrice);
            }
            return data;
        };

        window.stonksChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                datasets: [
                    { label: 'Tuna Inc', data: generateInitialStonkData(), borderColor: '#f06292', _defaultBorderColor: '#f06292', borderWidth: 3, tension: 0.1, fill: false, pointStyle: getPointStyle(icons.tuna, 'Tuna Inc'), pointRadius: 10, pointHoverRadius: 12 },
                    { label: 'Yarn Corp', data: generateInitialStonkData(), borderColor: '#ba68c8', _defaultBorderColor: '#ba68c8', borderWidth: 3, tension: 0.1, fill: false, pointStyle: getPointStyle(icons.yarn, 'Yarn Corp'), pointRadius: 10, pointHoverRadius: 12 },
                    { label: 'Salmon Tech', data: generateInitialStonkData(), borderColor: '#64b5f6', _defaultBorderColor: '#64b5f6', borderWidth: 3, tension: 0.1, fill: false, pointStyle: getPointStyle(icons.salmon, 'Salmon Tech'), pointRadius: 10, pointHoverRadius: 12 },
                    { label: 'Laser Dynamics', data: generateInitialStonkData(), borderColor: '#4fc3f7', _defaultBorderColor: '#4fc3f7', borderWidth: 3, tension: 0.1, fill: false, pointStyle: getPointStyle(icons.laser, 'Laser Dynamics'), pointRadius: 10, pointHoverRadius: 12 },
                    { label: 'Cardboard Box LLC', data: generateInitialStonkData(), borderColor: '#81c784', _defaultBorderColor: '#81c784', borderWidth: 3, tension: 0.1, fill: false, pointStyle: getPointStyle(icons.box, 'Cardboard Box LLC'), pointRadius: 10, pointHoverRadius: 12 },
                    { label: 'Catnip Futures', data: generateInitialStonkData(), borderColor: '#dce775', _defaultBorderColor: '#dce775', borderWidth: 3, tension: 0.1, fill: false, pointStyle: getPointStyle(icons.catnip, 'Catnip Futures'), pointRadius: 10, pointHoverRadius: 12 },
                    { label: 'Solar Energy Co', data: generateInitialStonkData(), borderColor: '#ffd54f', _defaultBorderColor: '#ffd54f', borderWidth: 3, tension: 0.1, fill: false, pointStyle: getPointStyle(icons.solar, 'Solar Energy Co'), pointRadius: 10, pointHoverRadius: 12 },
                    { label: 'Spring Toy Co', data: generateInitialStonkData(), borderColor: '#ff8a65', _defaultBorderColor: '#ff8a65', borderWidth: 3, tension: 0.1, fill: false, pointStyle: getPointStyle(icons.spring, 'Spring Toy Co'), pointRadius: 10, pointHoverRadius: 12 }
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
                    x: {
                        display: false, // Hide x axis labels and grid
                        grid: { display: false, drawBorder: false, drawOnChartArea: false, drawTicks: false },
                        border: { display: false },
                        ticks: { display: false }
                    },
                    y: {
                        display: false,  // Hide y axis per request
                        grid: { display: false, drawBorder: false, drawOnChartArea: false, drawTicks: false },
                        border: { display: false },
                        ticks: { display: false }
                    }
                },
                layout: {
                    padding: {
                        right: 15 // Ensure the icon on the last point isn't cut off
                    }
                }
            }
        });
    };

    // Load initial data and setup UI
    loadGame2();
    renderGame2StoreItems();
    updateGame2UI();

});
