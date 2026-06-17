# Comprehensive Refactor Plan: Splitting the Monolithic Mr. Pickles Universe

## Phase 0: Project Context and Guardrails
**Objective**: Transition the existing "Mr. Pickles Universe" web game from a monolithic file structure (`index.html`, `script.js`, `style.css`) into a highly modular, domain-specific architecture to support long-term maintainability, parallel agent development, and the addition of future games (e.g., Game 3).

**Critical Constraint:** The original files (`index.html`, `script.js`, `style.css`) MUST REMAIN UNTOUCHED. All refactored work must be executed in parallel tracks and output to a new set of `_v2` files. These new files serve as a functional, structural demonstration and backup that the development team can swap in when ready.

---

## Phase 1: Parallel Development Tracks

This phase is designed to be executed concurrently by multiple agents/developers to maximize efficiency and prevent merge conflicts. Each track is strictly isolated to its domain.

### Track A: Platform Architecture & Shared Framework
*   **Role**: Platform Architect
*   **Target Files**: `index_v2.html`, `shared_v2.js`
*   **Tasks**:
    1.  **Initialize Root File**: Create `index_v2.html` as a direct replica of `index.html`.
    2.  **Module Wiring**: Update the bottom of the `<body>` in `index_v2.html` to load the modular JavaScript files in explicit dependency order:
        ```html
        <script src="shared_v2.js"></script>
        <script src="game1_v2.js"></script>
        <script src="game2_v2.js"></script>
        ```
    3.  **Extract Global Utilities & Scope Exposure**: Create `shared_v2.js` and extract formatting and storage logic. Expose them globally using a strict namespace to prevent collisions:
        ```javascript
        window.PickleShared = {
            formatNumber: (num) => { /* logic */ },
            getLocalStorage: (key, fallback) => { /* logic */ },
            setLocalStorage: (key, value) => { /* logic */ }
        };
        ```
    4.  **Promise-based Modals**: Migrate all custom modal logic (`showAlert`, `showConfirm`). Ensure the DOM listeners are properly cleaned up (`removeEventListener`) within the Promise resolution blocks to prevent memory leaks when transitioning between games.
    5.  **Developer Tools Context**: Isolate the Dev Mode functionality. Implement a context-aware state manager (`currentDevContext = 'game1' | 'game2'`) so that sticker positioning arrays update the correct game's configuration.

### Track B: Game 1 Domain Extraction
*   **Role**: Game 1 Developer
*   **Target File**: `game1_v2.js`
*   **Tasks**:
    1.  **State Isolation**: Create `game1_v2.js`. Migrate all core Game 1 state variables (`score`, `clickPower`, `autoClickPower`, `gameEnded`) into an IIFE (Immediately Invoked Function Expression) or module scope to prevent global namespace pollution.
    2.  **Interval Management (Crucial)**: Extract the `setInterval` logic. To prevent "ghost" loops from executing when Game 1 is hidden, implement strict bail-out closures:
        ```javascript
        setInterval(() => {
            if (!document.getElementById('start-screen').classList.contains('slide-up')) return;
            if (!document.getElementById('game2-screen').classList.contains('hidden')) return;
            // Execute Game 1 passive income
        }, 1000);
        ```
    3.  **Interaction Handlers**: Migrate Mr. Pickles clicking logic, store rendering, and the dynamic floating number generation (`+1`).
    4.  **Endgame Logic & Data Handoff**: When 1,000,000 biscuits are reached, explicitly push the `biscuitsLeft` metric to `window.PickleShared.setLocalStorage('pickleClickerLeaderboard')`. This is the critical handoff point for Track C to pick up the starting balance.

### Track C: Game 2 Domain Extraction
*   **Role**: Game 2 Developer
*   **Target File**: `game2_v2.js`
*   **Tasks**:
    1.  **State Isolation**: Migrate Game 2 variables (`game2Biscuits`, `stonkMarketSpeed`, `investigatedStonks`, `catnipLevel`).
    2.  **Chart.js Transparency**: When re-initializing `window.stonksChartInstance`, ensure the exact transparency configurations (`border: { display: false }`, `drawOnChartArea: false`) are preserved so the graph renders cleanly onto the computer monitor background asset.
    3.  **Market Mathematics**: Extract the dense `updateStonksMarket` function. Pay special attention to the two-pass modifier calculation, catnip multiplier integration, and the probabilistic rounding function used to prevent low-priced stonks from locking up.
    4.  **Dynamic Store Data Hydration**: When parsing `localStorage`, strictly merge `defaultGame2StoreItemsData` with the saved data using a spread operator or mapping function. This ensures that properties like `type: 'asset'` or `stonkLink: ['Yarn']` are not lost from older saves, which would break the Audit evasion and Market Flooding mechanics.

### Track D: CSS Domain Segregation & Container Queries
*   **Role**: UI/UX Engineer
*   **Target Files**: `shared_v2.css`, `game1_v2.css`, `game2_v2.css`
*   **Tasks**:
    1.  **Global Resets (`shared_v2.css`)**: Extract baseline styles (body flexboxes, hidden scrollbars, `pointer-events: none` overlays, and modal `.slide-up` animations).
    2.  **Game 1 Specifics (`game1_v2.css`)**: Isolate the Game 1 `#game-area` styles.
    3.  **Game 2 Specifics (`game2_v2.css`)**: Extract all styles unique to the Capitalism simulator.
    4.  **Container Query (`cqw`) Management (Crucial)**: Both games rely heavily on `container-type: inline-size` attached to their primary `aspect-ratio: 1/1` containers (`#game-area`, `#game2-area`). Ensure that when splitting the CSS, `cqw` units (e.g., `font-size: 3cqw`) are strictly scoped within their respective DOM IDs to prevent inner text scaling from failing on mobile devices.

---

## Phase 2: Data Migration & Save State Strategy

Because the application previously relied on a massive monolithic save state or tightly coupled states, the refactor must enforce a strict separation of concerns in `localStorage`:

1.  **Game 1 Save (`pickleClickerSave`)**: Handled entirely by `game1_v2.js`. Stores `score`, `clickPower`, and Game 1 item counts.
2.  **Leaderboard Handoff (`pickleClickerLeaderboard`)**: The shared bridge. Game 1 writes to this upon reaching the win condition. Game 2 reads from this *only* if `pickleClickerGame2Save` does not exist, using the best `biscuitsLeft` as its starting liquid balance.
3.  **Game 2 Save (`pickleClickerGame2Save`)**: Handled entirely by `game2_v2.js`. Stores `game2Biscuits`, stonk ownership, and the complex array of investigated stonks.

**Backward Compatibility Rule:** The new modular scripts MUST be able to parse the exact schema of the legacy `localStorage` items generated by the monolithic `script.js` without throwing undefined errors.

---

## Phase 3: Testing & QA Strategy (Track F)

*   **Role**: QA Automation Engineer
*   **Prerequisite**: Tracks A, B, C, D must be merged.

**Automated Playwright Scenarios**:
1.  **Data Injection Bypasses**: Write tests that inject `localStorage.setItem('pickleClickerLeaderboard', JSON.stringify([{ score: 100, biscuitsLeft: 1000 }]))` before page load. Verify that clicking "Game 2" seamlessly skips Game 1 and starts Game 2 with exactly 1000 liquid biscuits.
2.  **Modal Dismissal Sequence**: Ensure UI tests explicitly locate and click `#game2-instructions-ok` before attempting to interact with the stonk monitor, as the overlay blocks pointer events.
3.  **Visual Regression**: Take a baseline screenshot of the monolithic `index.html`. Compare it against `index_v2.html` using pixel-match algorithms. Pay special attention to the Developer Mode sticker absolute positioning, ensuring z-indexes were not scrambled during the CSS split.

---

## Phase 4: Sequential Integration (Track E)

*   **Role**: Integration Lead
*   **Prerequisite**: All code and tests are written.

**Tasks**:
1.  Verify `shared_v2.js` initializes before the game scripts in `index_v2.html`.
2.  Test the DOM manipulation sequence: Manually trigger the Game 1 Endgame modal -> Click "Next Stage" -> Verify `#game-screen` hides, `#game2-screen` shows, and `.slide-up` is removed from `#game2-start-screen` without a page reload.
3.  Confirm zero modifications were made to the original monolith files.
