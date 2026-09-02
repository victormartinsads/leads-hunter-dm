const { chromium } = require('playwright-core');
const path = require('path');

async function run() {
  const profileDir = path.join(__dirname, '..', '.chrome-profile');
  const context = await chromium.launchPersistentContext(profileDir, { headless: false });
  const page = context.pages()[0] || await context.newPage();

  console.log('Navigating to hashtag page...');
  await page.goto('https://www.instagram.com/explore/tags/facetasemresina/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const posts = await page.locator('a[href*="/p/"]').all();
  console.log('Found post thumbnails:', posts.length);

  const handles = new Set();

  if (posts.length > 0) {
    // Click first post thumbnail
    console.log('Clicking first post...');
    await posts[0].click().catch(() => {});
    await page.waitForTimeout(3000);

    for (let i = 0; i < 15; i++) {
      // Get current post author handle
      const authorHandle = await page.evaluate(() => {
        const headerLinks = Array.from(document.querySelectorAll('header a[href^="/"], article a[href^="/"]'));
        for (const a of headerLinks) {
          const href = a.getAttribute('href');
          if (href && !href.includes('/p/') && !href.includes('/explore/') && href.length > 2) {
            return href.replace(/\//g, '');
          }
        }
        return null;
      });

      if (authorHandle) {
        console.log(`[Post ${i + 1}] Found author handle: @${authorHandle}`);
        handles.add('@' + authorHandle.toLowerCase());
      }

      // Click next post button
      const nextBtn = page.locator('svg[aria-label="Avançar"], svg[aria-label="Next"], button:has(svg[aria-label="Avançar"])').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click().catch(() => {});
        await page.waitForTimeout(2000);
      } else {
        break;
      }
    }
  }

  console.log('Final extracted handles:', Array.from(handles));
  await context.close();
}

run().catch(console.error);
