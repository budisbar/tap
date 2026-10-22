const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // number of images

  const dirEntries = [];
  for (const img of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.data.length, 8); // size of image
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += img.data.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(b => b.data)]);
}

(async () => {
  console.log('Finding Chrome...');
  const chromePath = chromeLauncher.Launcher.getInstallations()[0];
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Generate Favicon SVG with the 3-wave NFC symbol
  // 1:1 square ratio 130x130, centered at (106.35, 80)
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130" width="100%" height="100%">
  <!-- Navy background badge matching brand banner -->
  <rect width="130" height="130" rx="34" fill="#142141" />
  <!-- White 3-Wave NFC Logo -->
  <g fill="#ffffff" transform="translate(24, 0)">
    <path d="M 69,45 A 50,50 0 0,0 69,145 Z" transform="translate(-19, -15)" />
    <path d="M 95.4,50 A 55,55 0 0,0 95.4,140 Z" transform="translate(-19, -15)" />
    <path d="M 111.7,60 A 50,50 0 0,0 111.7,130 Z" transform="translate(-19, -15)" />
  </g>
</svg>`;

  fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(__dirname, 'public', 'logo.svg'), svgContent);
  console.log('Saved public/favicon.svg and public/logo.svg with 3-wave NFC symbol');

  // 2. Generate PNG Favicons at various resolutions (16, 32, 48, 96, 180, 192, 512)
  const sizes = [16, 32, 48, 96, 180, 192, 512];
  const pngBuffers = {};

  for (const size of sizes) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    const radius = Math.round(size * 0.26);

    const badgeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
        .badge {
          width: 100%;
          height: 100%;
          background: #142141;
          border-radius: ${radius}px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        svg {
          width: 78%;
          height: 78%;
        }
      </style>
    </head>
    <body>
      <div class="badge">
        <svg viewBox="46 18 122 122">
          <g fill="#ffffff">
            <path d="M 110,30 A 50,50 0 0,0 110,130 Z" />
            <path d="M 136.4,35 A 55,55 0 0,0 136.4,125 Z" />
            <path d="M 152.7,45 A 50,50 0 0,0 152.7,115 Z" />
          </g>
        </svg>
      </div>
    </body>
    </html>
    `;

    await page.setContent(badgeHtml, { waitUntil: 'load' });
    const buf = await page.screenshot({ omitBackground: true, type: 'png' });
    pngBuffers[size] = buf;

    if (size === 48) {
      fs.writeFileSync(path.join(__dirname, 'public', 'favicon-48x48.png'), buf);
    } else if (size === 96) {
      fs.writeFileSync(path.join(__dirname, 'public', 'favicon-96x96.png'), buf);
    } else if (size === 180) {
      fs.writeFileSync(path.join(__dirname, 'public', 'apple-touch-icon.png'), buf);
    } else if (size === 192) {
      fs.writeFileSync(path.join(__dirname, 'public', 'favicon-192x192.png'), buf);
      fs.writeFileSync(path.join(__dirname, 'public', 'android-chrome-192x192.png'), buf);
    } else if (size === 512) {
      fs.writeFileSync(path.join(__dirname, 'public', 'favicon-512x512.png'), buf);
      fs.writeFileSync(path.join(__dirname, 'public', 'android-chrome-512x512.png'), buf);
    }
    console.log(`Generated 3-wave PNG for ${size}x${size}`);
  }

  // 3. Generate multi-resolution favicon.ico containing 16x16, 32x32, 48x48
  const icoData = createIco([
    { width: 16, height: 16, data: pngBuffers[16] },
    { width: 32, height: 32, data: pngBuffers[32] },
    { width: 48, height: 48, data: pngBuffers[48] }
  ]);
  fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), icoData);
  console.log('Saved public/favicon.ico with 3-wave NFC symbol');

  // 4. Generate high-resolution OpenGraph sharing banner (1200x630) using the brand banner aesthetic
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  const ogHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1200px;
        height: 630px;
        background: #142141;
        font-family: 'Inter', system-ui, sans-serif;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 70px 80px;
        position: relative;
        overflow: hidden;
      }
      .bg-glow {
        position: absolute;
        top: -100px;
        right: -100px;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
      }
      .top-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .domain-badge {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: rgba(255,255,255,0.6);
        border: 1px solid rgba(255,255,255,0.2);
        padding: 6px 16px;
        border-radius: 9999px;
      }
      .center-content {
        display: flex;
        align-items: center;
        gap: 60px;
      }
      .logo-svg {
        width: 160px;
        height: 160px;
        flex-shrink: 0;
      }
      .slogan-text {
        font-size: 52px;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -1px;
        max-width: 780px;
      }
      .bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid rgba(255,255,255,0.15);
        padding-top: 24px;
        font-size: 16px;
        color: rgba(255,255,255,0.7);
      }
      .founded {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 1px;
        color: rgba(255,255,255,0.5);
      }
    </style>
  </head>
  <body>
    <div class="bg-glow"></div>
    <div class="top-row">
      <span class="domain-badge">tapncon.online</span>
    </div>

    <div class="center-content">
      <svg class="logo-svg" viewBox="46 18 122 122">
        <g fill="#ffffff">
          <path d="M 110,30 A 50,50 0 0,0 110,130 Z" />
          <path d="M 136.4,35 A 55,55 0 0,0 136.4,125 Z" />
          <path d="M 152.7,45 A 50,50 0 0,0 152.7,115 Z" />
        </g>
      </svg>
      <h1 class="slogan-text">Boost Reviews, Dominate Local Search, Effortlessly.</h1>
    </div>

    <div class="bottom-row">
      <div>Instant Google Reviews &bull; NFC Business Hardware &bull; Digital Menus</div>
      <div class="founded">Founded June 2026</div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(ogHtml, { waitUntil: 'networkidle0' });
  const ogBuf = await page.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(__dirname, 'public', 'og-image.png'), ogBuf);
  console.log('Saved public/og-image.png with brand banner design');

  await browser.close();
  console.log('Done generating all 3-wave logo assets!');
})();
