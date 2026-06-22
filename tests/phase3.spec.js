const { test, expect } = require('@playwright/test');

const pagesToTest = ['/index.html', '/index_v2.html'];

for (const pageName of pagesToTest) {
  test.describe(`Phase 3 Scenarios on ${pageName}`, () => {

    test.beforeEach(async ({ page }) => {
      await page.goto(pageName);
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload();
    });

    test('Scenario 1: State Injection (Skip to Game 2)', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('pickleClickerLeaderboard', JSON.stringify([{ score: 100, biscuitsLeft: 1000 }]));
      });
      await page.reload();

      const game2UnlockBtn = page.locator('#game2-unlock-btn');
      await expect(game2UnlockBtn).toBeVisible();

      await game2UnlockBtn.click();
      await expect(page.locator('#game2-start-screen')).toBeVisible();

      const game2StartBtn = page.locator('#game2-start-btn');
      await game2StartBtn.click();

      await expect(page.locator('#game2-start-screen')).toHaveClass(/slide-up/);
      await expect(page.locator('#game2-screen')).toBeVisible();

      const game2InstrOk = page.locator('#game2-instructions-ok');
      await expect(game2InstrOk).toBeVisible();
      await game2InstrOk.click();

      const game2Biscuits = page.locator('#game2-biscuit-count');
      await expect(game2Biscuits).toHaveText('1,000');
    });

    test('Scenario 2: Modal Dismissal Sequence', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('pickleClickerLeaderboard', JSON.stringify([{ score: 100, biscuitsLeft: 1000 }]));
      });
      await page.reload();

      await page.locator('#game2-unlock-btn').click();
      await page.locator('#game2-start-btn').click();

      const instrModal = page.locator('#game2-instructions-modal');
      await expect(instrModal).toBeVisible();

      await page.locator('#game2-instructions-ok').click();
      await expect(instrModal).toBeHidden();

      const stonkButton = page.locator('#selected-stonk-buy');
      await expect(stonkButton).toBeVisible();
    });

  });
}

test.describe('Scenario 3: Visual Regression (Pixel Match)', () => {
  test('index.html vs index_v2.html chart alignment', async ({ page, browser }) => {
    const page1 = await browser.newPage();
    await page1.goto('http://localhost:8080/index.html');
    await page1.evaluate(() => {
        localStorage.setItem('pickleClickerLeaderboard', JSON.stringify([{ score: 100, biscuitsLeft: 1000 }]));
    });
    await page1.reload();
    await page1.locator('#game2-unlock-btn').click();
    await page1.locator('#game2-start-btn').click();
    await page1.locator('#game2-instructions-ok').click();

    await page1.evaluate(() => {
        if(window.stonksChartInstance) {
            window.stonksChartInstance.destroy();
        }
        const canvas = document.getElementById('stonks-chart');
        const rect = canvas.getBoundingClientRect();
        window.canvasRect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    const rect1 = await page1.evaluate(() => window.canvasRect);

    const page2 = await browser.newPage();
    await page2.goto('http://localhost:8080/index_v2.html');
    await page2.evaluate(() => {
        localStorage.setItem('pickleClickerLeaderboard', JSON.stringify([{ score: 100, biscuitsLeft: 1000 }]));
    });
    await page2.reload();
    await page2.locator('#game2-unlock-btn').click();
    await page2.locator('#game2-start-btn').click();
    await page2.locator('#game2-instructions-ok').click();

    await page2.evaluate(() => {
        if(window.stonksChartInstance) {
            window.stonksChartInstance.destroy();
        }
        const canvas = document.getElementById('stonks-chart');
        const rect = canvas.getBoundingClientRect();
        window.canvasRect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    const rect2 = await page2.evaluate(() => window.canvasRect);

    expect(rect1.x).toBeCloseTo(rect2.x, 1);
    expect(rect1.y).toBeCloseTo(rect2.y, 1);
    expect(rect1.width).toBeCloseTo(rect2.width, 1);
    expect(rect1.height).toBeCloseTo(rect2.height, 1);
  });
});
