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

  // 1. Generate Favicon SVG
  // Using 1:1 square ratio 100x100
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141418" />
      <stop offset="100%" stop-color="#050505" />
    </linearGradient>
  </defs>
  <!-- Background badge with subtle rounded border -->
  <rect x="2" y="2" width="96" height="96" rx="26" fill="url(#bg)" stroke="#27272a" stroke-width="2" />
  <!-- Text Brand Mark with safe padding -->
  <text x="50" y="57" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', Helvetica, sans-serif" font-weight="900" font-size="21" fill="#ffffff" letter-spacing="-0.8">tap<tspan fill="#a1a1aa" font-weight="700">&amp;</tspan>con</text>
</svg>`;

  fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(__dirname, 'public', 'logo.svg'), svgContent);
  console.log('Saved public/favicon.svg and updated public/logo.svg');

  // 2. Generate PNG Favicons at various resolutions (16, 32, 48, 96, 180, 192, 512)
  const sizes = [16, 32, 48, 96, 180, 192, 512];
  const pngBuffers = {};

  for (const size of sizes) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    
    // Provide ~14% safe margin inside the squircle
    const fontSize = size <= 32 ? Math.round(size * 0.28) : Math.round(size * 0.21);
    const radius = Math.round(size * 0.24);

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
          background: radial-gradient(circle at 30% 30%, #17171c 0%, #050505 100%);
          border-radius: ${radius}px;
          border: ${Math.max(1, Math.round(size * 0.02))}px solid rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
          font-weight: 900;
          font-size: ${fontSize}px;
          letter-spacing: -${(size * 0.015).toFixed(1)}px;
          user-select: none;
        }
        .amp {
          color: #a1a1aa;
          font-weight: 700;
          margin: 0 ${Math.max(0.5, size * 0.01)}px;
        }
      </style>
    </head>
    <body>
      <div class="badge">tap<span class="amp">&amp;</span>con</div>
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
    console.log(`Generated PNG for ${size}x${size}`);
  }

  // 3. Generate multi-resolution favicon.ico containing 16x16, 32x32, 48x48
  const icoData = createIco([
    { width: 16, height: 16, data: pngBuffers[16] },
    { width: 32, height: 32, data: pngBuffers[32] },
    { width: 48, height: 48, data: pngBuffers[48] }
  ]);
  fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), icoData);
  console.log('Saved public/favicon.ico with 16x16, 32x32, 48x48 layers');

  // 4. Generate high-resolution OpenGraph sharing image (1200x630)
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  const ogHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1200px;
        height: 630px;
        background: #050505;
        font-family: 'Inter', -apple-system, sans-serif;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 80px;
        position: relative;
        overflow: hidden;
      }
      .bg-glow {
        position: absolute;
        top: -150px;
        right: -100px;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
        pointer-events: none;
      }
      .bg-glow-2 {
        position: absolute;
        bottom: -200px;
        left: -100px;
        width: 700px;
        height: 700px;
        background: radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%);
        pointer-events: none;
      }
      .top-row {
        display: flex;
        align-items: center;
        gap: 16px;
        z-index: 10;
      }
      .badge-sm {
        width: 64px;
        height: 64px;
        background: radial-gradient(circle at 30% 30%, #1a1a20 0%, #09090b 100%);
        border: 2px solid rgba(255,255,255,0.2);
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: -0.8px;
      }
      .badge-sm .amp { color: #a1a1aa; font-weight: 700; margin: 0 1px; }
      .brand-name {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.5px;
        text-transform: uppercase;
      }
      .tagline-pill {
        margin-left: auto;
        padding: 8px 18px;
        border-radius: 9999px;
        border: 1px solid rgba(255,255,255,0.15);
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #a1a1aa;
        background: rgba(255,255,255,0.03);
      }
      .content {
        z-index: 10;
        max-width: 950px;
      }
      .slogan-title {
        font-size: 56px;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -1.5px;
        margin-bottom: 20px;
        background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .slogan-desc {
        font-size: 24px;
        color: #94a3b8;
        font-weight: 400;
        line-height: 1.5;
      }
      .bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid rgba(255,255,255,0.1);
        padding-top: 28px;
        z-index: 10;
      }
      .features {
        display: flex;
        gap: 24px;
        font-size: 15px;
        color: #71717a;
        font-weight: 500;
      }
      .features span {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .features span::before {
        content: '•';
        color: #a1a1aa;
      }
      .features span:first-child::before {
        display: none;
      }
      .domain {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: 0.5px;
      }
    </style>
  </head>
  <body>
    <div class="bg-glow"></div>
    <div class="bg-glow-2"></div>

    <div class="top-row">
      <div class="badge-sm">tap<span class="amp">&amp;</span>con</div>
      <span class="brand-name">Tap&amp;Con</span>
      <div class="tagline-pill">NFC Solutions</div>
    </div>

    <div class="content">
      <h1 class="slogan-title">The Future of B2B Interaction</h1>
      <p class="slogan-desc">Instant NFC Reviews &amp; Connections. Bespoke smart hardware designed for modern businesses to collect 5-star reviews, share menus, and connect with customers effortlessly.</p>
    </div>

    <div class="bottom-row">
      <div class="features">
        <span>Instant Google Reviews</span>
        <span>Wi-Fi Access</span>
        <span>Digital Menus</span>
        <span>Eco-Friendly</span>
      </div>
      <div class="domain">tapncon.online</div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(ogHtml, { waitUntil: 'networkidle0' });
  const ogBuf = await page.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(__dirname, 'public', 'og-image.png'), ogBuf);
  console.log('Saved public/og-image.png (1200x630)');

  await browser.close();
  console.log('All icons and previews generated successfully!');
})();
