import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
function dependency(name) {
  try { return require(name); }
  catch (error) {
    if (!process.env.DONECASH_NODE_MODULES) throw error;
    return require(path.join(process.env.DONECASH_NODE_MODULES, name));
  }
}
const { chromium } = dependency('playwright');
const sharp = dependency('sharp');

const root = path.resolve(import.meta.dirname, '..');
const designRoot = path.resolve(root, 'design');
const outputDir = path.resolve(designRoot, 'final');

if (!outputDir.startsWith(`${designRoot}${path.sep}`)) {
  throw new Error(`Unsafe output path: ${outputDir}`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(path.join(outputDir, 'screens'), { recursive: true });

const escapeXml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const chunks = (items, size) => {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
};

async function auditPrototype(page, expectedRoutes) {
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  const audit = await page.evaluate(() => {
    const prototype = window.__prototype;
    if (!prototype) return { count: 0, routes: [], failures: ['window.__prototype is missing'] };
    const failures = [];
    for (const route of prototype.routes) {
      prototype.go(route);
      const title = document.querySelector('#stage-title, #title')?.textContent?.trim();
      const body = document.querySelector('#screen-body, #page')?.textContent?.trim();
      if (!title || !body) failures.push(route);
    }
    return { count: prototype.count, routes: prototype.routes, failures };
  });
  if (audit.count !== expectedRoutes || audit.failures.length || runtimeErrors.length) {
    throw new Error(`Prototype audit failed: ${JSON.stringify({ audit, runtimeErrors })}`);
  }
  return audit.routes;
}

async function mobileCard(screenshot, meta, platform) {
  const width = 430;
  const height = 946;
  const label = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="24" fill="#ffffff" stroke="#000000"/>
      <text x="20" y="29" font-family="Arial, sans-serif" font-weight="700" font-size="17" fill="#000000">${escapeXml(meta.id)} · ${escapeXml(meta.title)}</text>
      <rect x="342" y="13" width="68" height="25" rx="12.5" fill="${platform === 'ios' ? '#adff02' : '#02bbff'}" stroke="#000000"/>
      <text x="376" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="11" fill="#000000">${platform.toUpperCase()}</text>
    </svg>`);
  return sharp({ create: { width, height, channels: 4, background: '#ffffff' } })
    .composite([{ input: label, left: 0, top: 0 }, { input: screenshot, left: 20, top: 58 }])
    .png()
    .toBuffer();
}

async function operationsCard(screenshot, meta) {
  const width = 740;
  const height = 520;
  const preview = await sharp(screenshot)
    .resize(700, 445, { fit: 'contain', background: '#ffffff' })
    .png()
    .toBuffer();
  const frame = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="20" fill="#ffffff" stroke="#000000"/>
      <text x="20" y="34" font-family="Arial, sans-serif" font-weight="700" font-size="18" fill="#000000">${escapeXml(meta.title)}</text>
      <text x="720" y="34" text-anchor="end" font-family="Consolas, monospace" font-size="12" fill="#6e6e6e">${escapeXml(meta.route)}</text>
    </svg>`);
  return sharp({ create: { width, height, channels: 4, background: '#ffffff' } })
    .composite([{ input: frame, left: 0, top: 0 }, { input: preview, left: 20, top: 55 }])
    .png()
    .toBuffer();
}

async function contactSheet(cards, title, output, columns, cardWidth, cardHeight) {
  const gap = 24;
  const margin = 40;
  const header = 112;
  const rows = Math.ceil(cards.length / columns);
  const width = margin * 2 + columns * cardWidth + (columns - 1) * gap;
  const height = header + margin + rows * cardHeight + (rows - 1) * gap;
  const titleSvg = Buffer.from(`
    <svg width="${width}" height="${header}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${header}" fill="#f2f2f2"/>
      <text x="${margin}" y="64" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#000000">${escapeXml(title)}</text>
      <line x1="${margin}" y1="90" x2="${width - margin}" y2="90" stroke="#000000" stroke-width="1"/>
    </svg>`);
  const composites = [{ input: titleSvg, left: 0, top: 0 }];
  cards.forEach((card, index) => {
    composites.push({
      input: card.buffer,
      left: margin + (index % columns) * (cardWidth + gap),
      top: header + Math.floor(index / columns) * (cardHeight + gap),
    });
  });
  await sharp({ create: { width, height, channels: 4, background: '#f2f2f2' } })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(output);
}

const browser = await chromium.launch({ headless: true });
const manifest = { generatedAt: new Date().toISOString(), routeCount: 0, files: [], screens: [] };

try {
  const hub = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await hub.goto(pathToFileURL(path.join(root, 'prototype/index.html')).href, { waitUntil: 'networkidle' });
  const hubFile = path.join(outputDir, '00-prototype-hub.png');
  await hub.screenshot({ path: hubFile, fullPage: true });
  manifest.files.push({ file: path.basename(hubFile), kind: 'hub' });
  await hub.close();

  const mobile = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await mobile.goto(pathToFileURL(path.join(root, 'prototype/mobile.html')).href, { waitUntil: 'networkidle' });
  const mobileRoutes = await auditPrototype(mobile, 36);
  manifest.routeCount += mobileRoutes.length;

  for (const platform of ['ios', 'android']) {
    const cards = [];
    for (const route of mobileRoutes) {
      const meta = await mobile.evaluate(({ route, platform }) => {
        window.__prototype.setPlatform(platform);
        window.__prototype.go(route);
        return {
          id: document.querySelector('#stage-meta').textContent.split(' · ')[0],
          title: document.querySelector('#app-title').textContent,
        };
      }, { route, platform });
      const screenshot = await mobile.locator('.phone').screenshot({ type: 'png' });
      const individualFile = `screens/mobile-${platform}-${meta.id.toLowerCase()}-${route}.png`;
      await fs.writeFile(path.join(outputDir, individualFile), screenshot);
      manifest.screens.push({ file: individualFile, platform, route, id: meta.id, title: meta.title });
      cards.push({ route, meta, buffer: await mobileCard(screenshot, meta, platform) });

      if (route === 'home') {
        const heroFile = path.join(outputDir, platform === 'ios' ? '01-mobile-ios-home.png' : '02-mobile-android-home.png');
        await mobile.screenshot({ path: heroFile, fullPage: true });
        manifest.files.push({ file: path.basename(heroFile), kind: 'mobile-hero', platform, routes: [route] });
      }
    }

    for (const [index, sheetCards] of chunks(cards, 12).entries()) {
      const number = String(index + 1).padStart(2, '0');
      const file = path.join(outputDir, `10-mobile-${platform}-${number}.png`);
      await contactSheet(sheetCards, `DONECASH MOBILE · ${platform.toUpperCase()} · ${number}/03`, file, 4, 430, 946);
      manifest.files.push({ file: path.basename(file), kind: 'mobile-contact-sheet', platform, routes: sheetCards.map(card => card.route) });
    }
  }
  await mobile.close();

  const operations = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await operations.goto(pathToFileURL(path.join(root, 'prototype/backoffice.html')).href, { waitUntil: 'networkidle' });
  const operationsRoutes = await auditPrototype(operations, 22);
  manifest.routeCount += operationsRoutes.length;
  const operationsCards = [];

  for (const route of operationsRoutes) {
    const meta = await operations.evaluate(route => {
      window.__prototype.go(route);
      return { route, title: document.querySelector('#title').textContent };
    }, route);
    const screenshot = await operations.screenshot({ type: 'png', fullPage: true });
    const individualFile = `screens/backoffice-${route}.png`;
    await fs.writeFile(path.join(outputDir, individualFile), screenshot);
    manifest.screens.push({ file: individualFile, platform: 'backoffice', route, title: meta.title });
    operationsCards.push({ route, meta, buffer: await operationsCard(screenshot, meta) });

    if (route === 'overview') {
      const heroFile = path.join(outputDir, '03-backoffice-overview.png');
      await fs.writeFile(heroFile, screenshot);
      manifest.files.push({ file: path.basename(heroFile), kind: 'backoffice-hero', routes: [route] });
    }
  }

  for (const [index, sheetCards] of chunks(operationsCards, 6).entries()) {
    const number = String(index + 1).padStart(2, '0');
    const file = path.join(outputDir, `20-backoffice-${number}.png`);
    await contactSheet(sheetCards, `DONECASH OPERATIONS · ${number}/04`, file, 2, 740, 520);
    manifest.files.push({ file: path.basename(file), kind: 'backoffice-contact-sheet', routes: sheetCards.map(card => card.route) });
  }
  await operations.close();

  if (manifest.routeCount !== 58) throw new Error(`Expected 58 routes, found ${manifest.routeCount}`);
  const wireframes = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await wireframes.goto(pathToFileURL(path.join(root, 'design/wireframes.html')).href, { waitUntil: 'networkidle' });
  await wireframes.screenshot({ path: path.join(designRoot, 'wireframes.png'), fullPage: true });
  await wireframes.close();
  await fs.writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
} finally {
  await browser.close();
}
