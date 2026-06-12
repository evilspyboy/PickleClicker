const fs = require('fs');

const file = 'script.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "function updateGame2UI() {\n        if(game2BiscuitCountEl) game2BiscuitCountEl.textContent = Number(game2Biscuits).toLocaleString();\n",
    "function updateGame2UI() {\n        updateNetWorthProgressBar();\n        if(game2BiscuitCountEl) game2BiscuitCountEl.textContent = Number(game2Biscuits).toLocaleString();\n"
);

fs.writeFileSync(file, content);
console.log("Patched updateGame2UI logic to include updateNetWorthProgressBar().");
