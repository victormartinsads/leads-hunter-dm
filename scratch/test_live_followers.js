const { chromium } = require('playwright-core');
const path = require('path');

async function getLiveFollowers(handle) {
  const cleanHandle = handle.replace('@', '').trim();
  const profileDir = path.join(__dirname, '..', '.chrome-profile');

  const context = await chromium.launchPersistentContext(profileDir, { headless: false });
  const page = context.pages()[0] || await context.newPage();

  console.log(`Navigating to https://www.instagram.com/${cleanHandle}/...`);
  await page.goto(`https://www.instagram.com/${cleanHandle}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const followerText = await page.evaluate(() => {
    // Look for follower elements in Instagram profile header
    const listItems = Array.from(document.querySelectorAll('header section ul li, header ul li'));
    for (const item of listItems) {
      const text = item.textContent || '';
      if (text.includes('seguidores') || text.includes('followers')) {
        const titleSpan = item.querySelector('span[title]');
        if (titleSpan) return titleSpan.getAttribute('title');
        return text;
      }
    }
    return null;
  });

  console.log(`[${cleanHandle}] Live Follower Text:`, followerText);
  await context.close();
  return followerText;
}

getLiveFollowers('drayasminabrahao');
