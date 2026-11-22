// node scripts/render_screens.mjs <html-dir> [out-dir] [--w 1440 --h 800]
// Renders every <html-dir>/*.html (skipping _*.html) to <out-dir>/<name>.png at 2x. out-dir defaults to <html-dir>/../after.
// Use it for the "after" rebuilds (src → after) and for a demo slop build (slop → before).
import { readdirSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch } from '../engine/pw.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : d; };
const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!pos[0]) { console.error('usage: node render_screens.mjs <html-dir> [out-dir] [--w 1440 --h 800]'); process.exit(1); }
const src = resolve(pos[0]), out = resolve(pos[1] || join(dirname(src), 'after'));
const W = opt('--w', 1440), H = opt('--h', 800);
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
for (const f of readdirSync(src).filter((f) => f.endsWith('.html') && !f.startsWith('_')).sort()) {
  await page.goto(pathToFileURL(join(src, f)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const p = join(out, f.replace(/\.html$/, '.png'));
  await page.screenshot({ path: p });
  console.log(p);
}
await browser.close();
