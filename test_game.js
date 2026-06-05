const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 } // iPhone X dimensions
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000');

  const bgBoundsStart = await page.$eval('#background-container', el => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height, aspect: rect.width/rect.height };
  });
  console.log('Mobile Start Screen BG bounds:', bgBoundsStart);

  await page.click('#start-btn');
  await page.waitForTimeout(1000);

  const bgBoundsGame = await page.$eval('#background-container', el => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height, aspect: rect.width/rect.height };
  });
  console.log('Mobile Game Screen BG bounds:', bgBoundsGame);

  await context.close();
  await browser.close();
})();
