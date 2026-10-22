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
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const img of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += img.data.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(b => b.data)]);
}

(async () => {
  console.log('Launching Chrome...');
  const chromePath = chromeLauncher.Launcher.getInstallations()[0];
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const svgIconHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; display: flex; align-items: center; justify-content: center; }
      svg { width: 90%; height: 90%; }
    </style>
  </head>
  <body>
    <svg viewBox="55 25 103 110">
      <g fill="#16203D">
        <path d="M 110,30 A 50,50 0 0,0 110,130 Z" />
        <path d="M 136.4,35 A 55,55 0 0,0 136.4,125 Z" />
        <path d="M 152.7,45 A 50,50 0 0,0 152.7,115 Z" />
      </g>
    </svg>
  </body>
  </html>
  `;

  const sizes = [16, 32, 48, 96, 180, 192, 512];
  const pngBuffers = {};

  for (const size of sizes) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.setContent(svgIconHtml, { waitUntil: 'load' });
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
    console.log(`Generated logo for ${size}x${size}`);
  }

  const icoData = createIco([
    { width: 16, height: 16, data: pngBuffers[16] },
    { width: 32, height: 32, data: pngBuffers[32] },
    { width: 48, height: 48, data: pngBuffers[48] }
  ]);
  fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), icoData);
  console.log('Saved public/favicon.ico with pure logo.png layers');

  await browser.close();
  console.log('Done generating all logo favicons!');
})();
