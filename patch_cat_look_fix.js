const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const marketEndRegex = /stonksChartInstance\.update\(\);\n\s*updateNetWorthProgressBar\(\);/g;

const marketEndReplacement = `stonksChartInstance.update();
        updateNetWorthProgressBar();

        // Calculate current owned stonk value to see if there's a surge/drop
        let currentOwnedStonkValue = 0;
        stonksChartInstance.data.datasets.forEach(dataset => {
            let currentPrice = dataset.data[dataset.data.length - 1];
            let owned = game2StonkOwnership[dataset.label] || 0;
            currentOwnedStonkValue += (currentPrice * owned);
        });

        // Trigger looking cat if there's a significant change (>2% or >5k change) and not currently looking or in catnip/crashed state
        if (previousOwnedStonkValue > 0) {
            let diff = Math.abs(currentOwnedStonkValue - previousOwnedStonkValue);
            let threshold = Math.max(previousOwnedStonkValue * 0.02, 5000); // 2% change or 5000 biscuits

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
        previousOwnedStonkValue = currentOwnedStonkValue;`;

code = code.replace(marketEndRegex, marketEndReplacement);

fs.writeFileSync('script.js', code);
console.log("Cat look mechanic added to correct location.");
