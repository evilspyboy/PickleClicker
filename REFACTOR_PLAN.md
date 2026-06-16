# Comprehensive Refactor Plan: Splitting the Monolithic Mr. Pickles Universe

## Phase 0: Project Context and Guardrails
**Objective**: Transition the existing "Mr. Pickles Universe" web game from a monolithic file structure (`index.html`, `script.js`, `style.css`) into a highly modular, domain-specific architecture to support long-term maintainability and the addition of future games (e.g., Game 3).

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
        *   `<script src="shared_v2.js"></script>`
        *   `<script src="game1_v2.js"></script>`
        *   `<script src="game2_v2.js"></script>`
    3.  **CSS Wiring**: Update the `<head>` in `index_v2.html` to load modular CSS:
        *   `<link rel="stylesheet" href="shared_v2.css">`
        *   `<link rel="stylesheet" href="game1_v2.css">`
        *   `<link rel="stylesheet" href="game2_v2.css">`
    4.  **Extract Global Utilities**: Create `shared_v2.js` and extract the following from `script.js`:
        *   Number formatting logic (`formatNumber`).
        *   Safe LocalStorage wrapping functions (`getLocalStorage`, `setLocalStorage`).
        *   Global Leaderboard array manipulation functions.
    5.  **Extract Custom Modals**: Migrate all custom Promise-based modal logic (`showAlert`, `showConfirm`, store item information modal templates) into `shared_v2.js`.
    6.  **Extract Developer Tools**: Isolate the robust Developer Mode functionality (sticker positioning, cycling cats, dev panel toggles). Implement context awareness (`currentDevContext = 'game1' | 'game2'`) to ensure Dev Mode continues to function seamlessly across different domain screens.
    7.  **Global Scope Exposure**: Use the `window` object to explicitly expose these shared utilities (e.g., `window.PickleShared = { formatNumber, showAlert }`) so Tracks B and C can access them without import statements.

### Track B: Game 1 Domain Extraction
*   **Role**: Game 1 Developer
*   **Target File**: `game1_v2.js`
*   **Tasks**:
    1.  **State Isolation**: Create `game1_v2.js`. Migrate all core Game 1 state variables (`score`, `clickPower`, `autoClickPower`, `gameEnded`) from the monolith.
    2.  **Configuration Data**: Migrate the `storeItemsData` array and its dynamic cloned state `storeItems`.
    3.  **Core Loops**: Extract the `setInterval` logic specific to Game 1:
        *   The passive income (BPS) loop. Ensure it strictly checks that `document.getElementById('start-screen').classList.contains('slide-up')` is true and Game 2 is not active.
        *   The Game 1 Auto-save loop.
    4.  **Interaction Handlers**: Migrate DOM event listeners:
        *   Mr. Pickles main image clicking, scale transforms, and dynamic floating number generation.
        *   Store list rendering and dynamic buy button binding.
    5.  **Endgame Logic**: Migrate the logic that triggers at 1,000,000 biscuits. Ensure the transition logic properly updates the `pickleClickerLeaderboard` using the Track A shared utility and makes the Game 2 unlock button visible.
    6.  **Dependency Mapping**: Identify any function calls that relied on monolith globals and map them to `window.PickleShared`.

### Track C: Game 2 Domain Extraction
*   **Role**: Game 2 Developer
*   **Target File**: `game2_v2.js`
*   **Tasks**:
    1.  **State Isolation**: Create `game2_v2.js`. Migrate complex Game 2 variables (`game2Biscuits`, `stonkMarketSpeed`, `selectedStonkLabel`, `game2StonkOwnership`, `investigatedStonks`, and the `catnipLevel` states).
    2.  **Configuration Data**: Migrate `stonksData` (colors, labels, base prices) and `defaultGame2StoreItemsData` (asset, shell, business configurations).
    3.  **Market Mathematics**: Extract the dense `updateStonksMarket` function. This is critical as it contains:
        *   The two-pass modifier calculation.
        *   Catnip multiplier effects.
        *   Probabilistic rounding.
        *   Chart.js dataset updates.
    4.  **Interval Management**: Migrate Game 2 specific background processes:
        *   The silent BPS accumulator for Legit Businesses.
        *   The 5-minute Tax Audit loop and Shadow Board evasion logic.
        *   The Catnip decay timer.
        *   The 1000ms Chart updating loop.
        *   Ensure all loops have explicit bail-out conditions if the player is currently looking at Game 1 or a Start Screen.
    5.  **Dynamic Store UI**: Extract the complex 3-column store rendering logic. Ensure the exponential cost scaling calculation (`baseCost * (1.15 ^ count)`) is perfectly preserved.
    6.  **Insider Trading Logic**: Migrate the logic that triggers SEC investigation modals when a stonk surpasses 1,000,000 value.

### Track D: CSS Domain Segregation
*   **Role**: UI/UX Engineer
*   **Target Files**: `shared_v2.css`, `game1_v2.css`, `game2_v2.css`
*   **Tasks**:
    1.  **Global Resets (`shared_v2.css`)**: Extract baseline styles: body flexboxes, font families, hidden scrollbars, standard button interaction animations, and the global `#app-container` rules.
    2.  **Modal Styling (`shared_v2.css`)**: Migrate all `.modal-overlay`, `.modal-content`, and generic button color classes (`.green-btn`, `.red-btn`).
    3.  **Game 1 Specifics (`game1_v2.css`)**: Move all styling related to the `#game-screen`, pastel backgrounds, floating numbers, the Game 1 store grid layout, and the `container-query` rules (`cqw` units) for the main clicking area.
    4.  **Game 2 Specifics (`game2_v2.css`)**: Extract all styles unique to the Capitalism simulator:
        *   The `.stonk-column` matrix-style transparent layouts.
        *   The complex positioning of the Chart.js canvas over the background monitor.
        *   The Catnip bar absolute positioning and fill transitions.
        *   The `#billion-progress-bar` net-worth tracking logic.

---

## Phase 2: Sequential Integration & Validation (Track E)

*   **Role**: Integration & QA Lead
*   **Prerequisite**: All parallel tracks (A, B, C, D) must report task completion.

**Tasks**:
1.  **Global Scope Verification**:
    *   Ensure `shared_v2.js` initializes first.
    *   Verify that `game1_v2.js` cleanly signals transitions to `game2_v2.js` without relying on undefined monolithic variables.
2.  **Data Persistence Testing**:
    *   Clear `localStorage`.
    *   Play Game 1 until a score registers. Save and exit.
    *   Verify that `pickleClickerLeaderboard` correctly writes the state.
    *   Open Game 2 and confirm it correctly parses the `biscuitsLeft` from the leaderboard as the starting balance.
3.  **Seamless Transition Testing**:
    *   Manually trigger the Game 1 Endgame modal.
    *   Click "Next Stage" and verify the DOM smoothly hides the `#game-screen` and reveals the `#game2-screen` without a page reload. Ensure background images do not bleed or flicker.
4.  **Visual Parity Check**:
    *   Compare `index_v2.html` side-by-side with the monolith `index.html`.
    *   Verify the Developer Mode sticker alignment UI remains exactly 1:1.
    *   Confirm the Game 2 chart transparently overlays the monitor background correctly.
