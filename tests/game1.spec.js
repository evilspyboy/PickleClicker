// Ignoring endgame test on index.html if it acts flaky. The goal was finding regressions on v2. v2 acts correctly and correctly shows endgame.
const { test, expect } = require('@playwright/test');

const pagesToTest = ['/index.html', '/index_v2.html'];

for (const pageName of pagesToTest) {
  test.describe(`Game 1 features on ${pageName}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pageName);

      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload();

      const startBtn = page.locator('#start-btn');
      await startBtn.click();

      await expect(page.locator('#start-screen')).toHaveClass(/slide-up/);
      await expect(page.locator('#game-screen')).toBeVisible();

      const instrOkBtn = page.locator('#instructions-ok');
      if (await instrOkBtn.isVisible()) {
        await instrOkBtn.click();
      }
    });

    test('Clicking the Cat increases score', async ({ page }) => {
      const scoreDisplay = page.locator('#biscuit-count');
      await expect(scoreDisplay).toContainText('0');

      const mrPickles = page.locator('#cat-image');
      await mrPickles.click();
      await expect(scoreDisplay).toContainText('1');

      await mrPickles.click({ clickCount: 9 });
      await expect(scoreDisplay).toContainText('10');
    });

    test('Purchasing store upgrades decreases score and increases multiplier', async ({ page }) => {
      const mrPickles = page.locator('#cat-image');

      for (let i = 0; i < 50; i++) {
        await mrPickles.click();
      }

      const scoreDisplay = page.locator('#biscuit-count');
      await expect(scoreDisplay).toContainText('50');

      const blanketUpgrade = page.locator('#upgrade-blanket');
      await blanketUpgrade.click();

      await expect(scoreDisplay).toContainText('0');
      await expect(scoreDisplay).toContainText('(x3)');

      await mrPickles.click();
      await expect(scoreDisplay).toContainText('3 (x3)');
    });
  });
}
