const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 2 });
  
  await page.evaluateOnNewDocument(() => {
    window.__CAPTURE_MODE__ = true;
  });

  await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });
  
  await page.waitForSelector('canvas');
  
  // Inject CSS to hide everything except the canvas and make html/body transparent
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      body, html { background: transparent !important; }
      * { background-color: transparent !important; }
      /* Only the 3D stage: hide the page, the animated backdrop and the poster */
      * { visibility: hidden !important; }
      #experience-canvas, #experience-canvas * { visibility: visible !important; opacity: 1 !important; }
    `;
    document.head.appendChild(style);
    
    // Hide header and navigation explicitly if needed
    const header = document.querySelector('header');
    if (header) header.style.display = 'none';
  });

  // Wait for 3D model to load and animate
  // Wait for the model, the first photo wallpaper and the intro rise-and-spin.
  await new Promise(r => setTimeout(r, 7000));
  
  const buffer = await page.screenshot({ type: 'png', omitBackground: true });
  
  const outputPath = path.join(__dirname, '../public/images/phone-hero-poster-v2.webp');
  
  await sharp(buffer)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 80 })
    .toFile(outputPath);
    
  console.log('Saved phone-hero-poster-v2.webp tightly cropped');
  await browser.close();
})();
