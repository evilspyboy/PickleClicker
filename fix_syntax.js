const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// The issue is around line 733: "if (false) {" has a matching "}" but then the original devOpenBtn.addEventListener('click', () => { block was mangled.
