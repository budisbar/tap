const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

(async () => {
  console.log('Launching Chrome...');
  const chromePath = chromeLauncher.Launcher.getInstallations()[0];
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new' });
  
  const page = await browser.newPage();
  console.log('Navigating to app...');
  await page.goto('http://localhost:3001/tap/', { waitUntil: 'networkidle2' });
  
  console.log('Going to Design Studio...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const designBtn = buttons.find(b => b.textContent.includes('Design your card'));
    if (designBtn) designBtn.click();
  });
  
  console.log('Waiting for elements to render...');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Capturing front...');
  // Since html2canvas is imported in the module, it's not on the window object.
  // We can just use Puppeteer's native screenshot on the DOM elements!
  const frontEl = await page.$('#capture-front');
  if (frontEl) {
    // Puppeteer requires the element to be visible to screenshot it.
    // Let's make it visible temporarily.
    await page.evaluate(() => {
       const wrapper = document.querySelector('.opacity-0.absolute.-left-\\[9999px\\]');
       if (wrapper) {
         wrapper.classList.remove('opacity-0', '-left-[9999px]', 'pointer-events-none');
         wrapper.style.position = 'relative';
         wrapper.style.opacity = '1';
         wrapper.style.left = '0';
       }
    });
    
    await frontEl.screenshot({ path: 'tap-and-con-front.png' });
    console.log('Saved tap-and-con-front.png');
  }
  
  console.log('Capturing back...');
  const backEl = await page.$('#capture-back');
  if (backEl) {
    await backEl.screenshot({ path: 'tap-and-con-back.png' });
    console.log('Saved tap-and-con-back.png');
  }
  
  await browser.close();
  console.log('Done!');
})();
