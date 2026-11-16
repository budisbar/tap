import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const ssrDir = path.join(rootDir, 'dist-ssr');
const templatePath = path.join(distDir, 'index.html');

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceTag(html, regex, replacement) {
  return regex.test(html) ? html.replace(regex, replacement) : html;
}

function injectSeo(template, seo, structuredData, appHtml) {
  let result = template;

  result = replaceTag(result, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(seo.title)}</title>`);
  result = replaceTag(
    result,
    /<meta name="title" content="[^"]*"\s*\/?>/,
    `<meta name="title" content="${escapeAttr(seo.title)}" />`
  );
  result = replaceTag(
    result,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeAttr(seo.description)}" />`
  );
  result = replaceTag(
    result,
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    `<meta name="robots" content="${escapeAttr(seo.robots)}" />`
  );
  result = replaceTag(
    result,
    /<meta name="googlebot" content="[^"]*"\s*\/?>/,
    `<meta name="googlebot" content="${escapeAttr(seo.robots)}" />`
  );
  result = replaceTag(
    result,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeAttr(seo.canonical)}" />`
  );
  result = replaceTag(
    result,
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeAttr(seo.canonical)}" />`
  );
  result = replaceTag(
    result,
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeAttr(seo.title)}" />`
  );
  result = replaceTag(
    result,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeAttr(seo.description)}" />`
  );
  result = replaceTag(
    result,
    /<meta name="twitter:url" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:url" content="${escapeAttr(seo.canonical)}" />`
  );
  result = replaceTag(
    result,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeAttr(seo.title)}" />`
  );
  result = replaceTag(
    result,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeAttr(seo.description)}" />`
  );
  result = replaceTag(
    result,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n    ${JSON.stringify(structuredData, null, 2).replace(/\n/g, '\n    ')}\n    </script>`
  );

  const visibleHtml = appHtml.replace(/opacity:\s*0;?/g, 'opacity:1;');
  result = result.replace('<div id="root"></div>', `<div id="root">${visibleHtml}</div>`);
  return result;
}

async function run() {
  const template = fs.readFileSync(templatePath, 'utf8');
  const entryUrl = pathToFileURL(path.join(ssrDir, 'entry-server.js')).href;
  const { render, getRouteSeo, getStructuredData } = await import(entryUrl);
  const structuredData = getStructuredData();

  const routes = [
    { url: '/', outFile: path.join(distDir, 'index.html') },
    { url: '/studio', outFile: path.join(distDir, 'studio', 'index.html') },
    { url: '/portal', outFile: path.join(distDir, 'portal', 'index.html') },
    { url: '/account', outFile: path.join(distDir, 'account', 'index.html') },
    { url: '/admin', outFile: path.join(distDir, 'admin', 'index.html') },
    { url: '/404', outFile: path.join(distDir, '404.html') },
  ];

  for (const route of routes) {
    const appHtml = await render(route.url);
    const seo = getRouteSeo(route.url);
    const finalHtml = injectSeo(template, seo, structuredData, appHtml);
    fs.mkdirSync(path.dirname(route.outFile), { recursive: true });
    fs.writeFileSync(route.outFile, finalHtml, 'utf8');
    console.log(`Pre-rendered ${route.url} -> ${path.relative(rootDir, route.outFile)}`);
  }

  fs.rmSync(ssrDir, { recursive: true, force: true });
}

run().catch((err) => {
  console.error('Pre-render failed:', err);
  process.exit(1);
});
