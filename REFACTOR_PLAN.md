# Comprehensive Refactor Plan & Architectural Specification: Splitting the Monolithic Mr. Pickles Universe

## Phase 0: Project Context, Philosophy, and Guardrails

**Objective**: Transition the existing "Mr. Pickles Universe" web game from a massive monolithic file structure (`index.html`, `script.js`, `style.css`) into a highly modular, domain-specific architecture. This supports long-term maintainability, allows concurrent agent development without merge conflicts, and prepares the infrastructure for "Game 3".

**Critical Constraint:** The original source files (`index.html`, `script.js`, `style.css`) **MUST REMAIN UNTOUCHED**. All refactored work must be executed in parallel tracks and output to a new set of `_v2` prefixed files. These new files serve as a functional, structural backup that the team can swap in when ready.

**Agent Communication Directive:** This document serves as the absolute source of truth for future AI agents executing this refactor. The monolithic codebase contains highly specific implicit logic and visual layering that must be explicitly understood to prevent regressions. Read this document thoroughly before writing code.

---

## Phase 1: Parallel Development Tracks

This phase is designed to be executed concurrently. Each track is strictly isolated.

### Track A: Platform Architecture & Shared Framework
*   **Role**: Platform Architect
*   **Target Files**: `index_v2.html`, `shared_v2.js`
*   **Tasks**:
    1.  **Initialize Root File**: Create `index_v2.html` as a direct replica of `index.html`.
    2.  **Module Wiring**: Update the bottom of the `<body>` in `index_v2.html` to load the modular scripts in this strict dependency order:
        ```html
        <script src="shared_v2.js"></script>
        <script src="game1_v2.js"></script>
        <script src="game2_v2.js"></script>
        ```
    3.  **Global Scope Exposure (`window.PickleShared`)**: Create `shared_v2.js`. You MUST expose shared logic on a global object. Do NOT rely on implicit globals.
        ```javascript
        window.PickleShared = {
            formatNumber: (num) => { /* logic */ }, // Handles 'k', 'm', 'b' suffixes
            getLocalStorage: (key, fallback) => { /* try/catch wrapper */ },
            setLocalStorage: (key, value) => { /* stringify wrapper */ }
        };
        ```
    4.  **Promise-based Modals**: Migrate all custom modal logic.
        *   **Selectors to migrate**: `#alert-modal`, `#custom-modal`, `#store-item-modal`.
        *   **Gotcha**: You MUST ensure DOM listeners (`addEventListener`) are cleaned up (`removeEventListener`) within the Promise `.then()` blocks to prevent click-event memory leaks across games.
    5.  **Developer Tools Context**: Isolate the Dev Mode functionality (`#dev-mode-panel`).
        *   **Gotcha**: Dev Mode uses a `currentDevContext` variable. Ensure it accurately tracks `'game1'` vs `'game2'` so sticker positioning coordinates write to the correct game's state arrays.

### Track B: Game 1 Domain Extraction
*   **Role**: Game 1 Developer
*   **Target File**: `game1_v2.js`
*   **Tasks**:
    1.  **State Isolation**: Move Game 1 variables (`score`, `clickPower`, `autoClickPower`, `gameEnded`) into a local module scope.
    2.  **Configuration Data**: Migrate `storeItemsData` and `storeItems`.
    3.  **Interval Management (Crucial Gotcha)**: The monolith uses `setInterval` for passive income and auto-saving. In a modular world, these loops will fire even when the player is on Game 2. You MUST implement strict bail-out closures:
        ```javascript
        setInterval(() => {
            if (!document.getElementById('start-screen').classList.contains('slide-up')) return; // Ensure on active screen
            if (!document.getElementById('game2-screen').classList.contains('hidden')) return; // Ensure Game 2 is NOT active
            // Execute Game 1 passive income
        }, 1000);
        ```
    4.  **Interaction Handlers**: Migrate Mr. Pickles clicking logic (`#main-image`), scaling transforms, and dynamic floating number logic.
    5.  **Endgame Logic**: At 1,000,000 biscuits, trigger `#endgame-modal`.
    6.  **Leaderboard Handoff**: Update `pickleClickerLeaderboard` using `window.PickleShared`. This sets `biscuitsLeft`, which Game 2 relies on to start. Ensure the `#game2-unlock-btn` is revealed.

### Track C: Game 2 Domain Extraction (Capitalism Simulator)
*   **Role**: Game 2 Developer
*   **Target File**: `game2_v2.js`
*   **Tasks**:
    1.  **State Variables**: Migrate `game2Biscuits`, `stonkMarketSpeed`, `investigatedStonks`, `catnipLevel`, `selectedStonkLabel`, `game2StonkOwnership`.
    2.  **Configuration Arrays**: Migrate `stonksData` and `defaultGame2StoreItemsData`.
        *   **Store Scaling Math**: Ensure exponential cost scaling calculation is exact: `baseCost * (1.15 ^ count)`. Note: The 'Shadow Board' (`shell3`) uniquely uses `totalPurchased` instead of `count` for scaling.
    3.  **Market Mathematics (`updateStonksMarket`)**:
        *   **Gotcha - 2-Pass System**: Replicate the exact Stonk Web modifier math. First pass calculates primary modifiers. Second pass distributes fractional ripple effects based *only* on strictly positive primary modifiers.
        *   **Gotcha - Rounding Trap**: Ensure the probabilistic rounding logic is migrated intact, otherwise stonks under 10 biscuits will get mathematically stuck and never fluctuate.
        *   **Gotcha - Price Floor**: Enforce `Math.max(1, currentPrice + change)`.
    4.  **Chart.js Transparency**: When moving `window.stonksChartInstance`, preserve exact styling: `border: { display: false }`, `drawOnChartArea: false`. The graph must render transparently over the monitor background asset.
    5.  **Tax Audits & Interval Loops**:
        *   Migrate the 5-minute tax audit loop. Ensure it calculates dynamic "Audit Exposure" correctly (ratio of hidden assets vs. businesses).
        *   Ensure the Catnip meter decay loop (every 3s) and the BPS loop for Legit Businesses are active.
        *   Apply the same Interval Bail-out logic described in Track B (checking `#game2-start-screen` and `#game2-screen`).
    6.  **Insider Trading**: Migrate the SEC investigation modal trigger when a stonk hits `1,000,000` biscuits (imposes a strict `-0.05` modifier and flat fine).

### Track D: CSS Domain Segregation & Container Queries
*   **Role**: UI/UX Engineer
*   **Target Files**: `shared_v2.css`, `game1_v2.css`, `game2_v2.css`
*   **Tasks**:
    1.  **Global Resets (`shared_v2.css`)**: Extract baseline styles, `.modal-overlay`, `.hidden` (`display: none !important`), and the `.slide-up` animation.
        *   **Gotcha - Z-Index Hierarchy**: Modals must be `z-index: 2000`. Dev Mode panel must be `z-index: 3000`. Game UI overlays must be `z-index: 10`.
    2.  **Start Screen Transparency**: Start screens (`#start-screen`, `#game2-start-screen`) MUST use `background-color: transparent`. They overlay the actual game screens below them. Do not add solid backgrounds to start screens.
    3.  **Container Query Management (Crucial)**:
        *   Both `#game-area` and `#game2-area` use `container-type: inline-size` and `aspect-ratio: 1/1`.
        *   Ensure that all inner font sizes and layout margins use `cqw` units (e.g., `font-size: 3cqw`) scoped strictly within these areas to ensure the games scale proportionally across mobile and desktop.
    4.  **Game 2 UI Specifics (`game2_v2.css`)**:
        *   Extract the matrix-style transparent monitor UI (`#stonks-ui`, `.stonk-column`).
        *   Extract the Catnip Bar absolute positioning and fill transitions.

---

## Phase 2: Data Migration & Save State Strategy

The monolith used a single `pickleClickerSave` object. The modular refactor must maintain isolated states while providing seamless backward compatibility:

1.  **Game 1 Save (`pickleClickerSave`)**: Managed by `game1_v2.js`.
2.  **Leaderboard Handoff (`pickleClickerLeaderboard`)**: The crucial bridge. It stores the top 5 scores from Game 1.
3.  **Game 2 Save (`pickleClickerGame2Save`)**: Managed by `game2_v2.js`.
4.  **Hydration Gotcha (Type Preservation)**: When loading Game 2 state, you MUST spread the `defaultGame2StoreItemsData` over the saved objects. Older save files might lack properties like `type: 'asset'` or `stonkLink: ['Yarn']`. If these properties are lost during loading, Audit evasion and Market Flooding mechanics will silently fail.

---

## Phase 3: Quality Assurance & Playwright Testing (Track F)

*   **Role**: QA Automation Engineer
*   **Prerequisite**: Tracks A, B, C, D complete.

**Automated Playwright Scenarios to Implement**:
1.  **State Injection (Skip to Game 2)**:
    *   Inject state before page load: `localStorage.setItem('pickleClickerLeaderboard', JSON.stringify([{ score: 100, biscuitsLeft: 1000 }]));`
    *   Assert `#game2-unlock-btn` is visible on the Game 1 start screen.
    *   Click `#game2-unlock-btn`. Assert `#game-screen` is `.hidden` and `#game2-screen` is visible.
    *   Click `#game2-start-btn`. Assert liquid biscuits display reads exactly `1.0k` (verifying `window.PickleShared.formatNumber` integration).
2.  **Modal Dismissal Sequence**:
    *   A fresh Game 2 save auto-triggers the `#game2-instructions-modal`.
    *   Playwright MUST locate and `.click()` the `#game2-instructions-ok` button before interacting with stonk columns, otherwise the overlay blocks pointer events.
3.  **Visual Regression (Pixel Match)**:
    *   Take a screenshot of `index.html`. Compare it against `index_v2.html`. Focus specifically on the Chart.js canvas alignment to ensure no 1-2px shifting occurred during the CSS extraction.

---

## Phase 4: Sequential Integration & Validation (Track E)

*   **Role**: Integration Lead
*   **Tasks**:
    1.  Ensure `.slide-up` classes are correctly managed. When toggling games, `.slide-up` must be removed from the target game's start screen so it becomes visible again.
    2.  Verify zero bleed-through. Inner interactive UI elements (like `.game2-dynamic-sticker`) must be explicitly hidden or moved off-screen (`.ui-offscreen-bottom`) when returning to start screens.
