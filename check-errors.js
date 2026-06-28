const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: "new" 
  });
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(`PAGE LOG ERROR: ${msg.text()}`);
    } else {
      logs.push(`PAGE LOG ${msg.type()}: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    logs.push(`PAGE ERROR: ${err.toString()}`);
  });

  console.log('Navigating to site...');
  await page.goto('https://ss-builders-mvs.vercel.app', { waitUntil: 'networkidle0' });

  // Scroll down to trigger scroll animations
  console.log('Scrolling down...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });

  console.log('Finished checking.');
  fs.writeFileSync('browser-logs.txt', logs.join('\n'));
  await browser.close();
})();
