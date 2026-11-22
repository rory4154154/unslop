// node engine/capture.mjs <films>/<name>                  → <films>/out/<name>.mp4 + <name>-poster.jpg (30fps)
// node engine/capture.mjs <films>/<name> --steps          → <films>/check/<name>-step<k>.jpg (each step settled) + -end.jpg
// node engine/capture.mjs <films>/<name> --still ms,ms    → <films>/check/<name>-<ms>.jpg
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch, filmPath } from './pw.mjs';

const [arg, flag, list] = process.argv.slice(2);
if (!arg) { console.error('usage: node capture.mjs <films>/<name> [--steps | --still ms,ms]'); process.exit(1); }
const { dir, name, file } = filmPath(resolve(arg));
const FPS = 30, DPR = 1.25;
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: DPR });
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(pathToFileURL(file).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
const { total, count, T } = await page.evaluate(() => ({ total: Steps.total, count: Steps.count, T: Steps.T }));

if (flag === '--still' || flag === '--steps') {
  mkdirSync(join(dir, 'check'), { recursive: true });
  const step = T.move + T.look + T.morph + T.hold + T.gap;
  const shots = flag === '--steps'
    ? [...Array.from({ length: count }, (_, k) => [`step${k + 1}`, T.intro + k * step + T.move + T.look + T.morph + 300]), ['end', total - 100]]
    : list.split(',').map((ms) => [ms, Number(ms)]);
  let t = 0;
  for (const [tag, ms] of shots) {
    await page.evaluate(([a, b]) => { for (let x = a; x <= b; x += 33) Steps.tick(x); Steps.tick(b); }, [t, ms]);
    t = ms;
    await page.screenshot({ path: join(dir, 'check', `${name}-${tag}.jpg`), type: 'jpeg', quality: 80 });
  }
  console.log(name, 'steps', count, 'seconds', (total / 1000).toFixed(1), 'wrote', shots.map((s) => s[0]).join(' '), 'errors', errs);
  await browser.close(); process.exit(errs.length ? 1 : 0);
}

const frames = join(dir, 'frames', name); rmSync(frames, { recursive: true, force: true }); mkdirSync(frames, { recursive: true });
mkdirSync(join(dir, 'out'), { recursive: true });
const n = Math.ceil(total / 1000 * FPS);
for (let f = 0; f < n; f++) {
  await page.evaluate((t) => Steps.tick(t), f * 1000 / FPS);
  await page.screenshot({ path: join(frames, String(f).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90 });
}
await browser.close();
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(frames, '%04d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(dir, 'out', name + '.mp4')]);
execFileSync('cp', [join(frames, String(n - 1).padStart(4, '0') + '.jpg'), join(dir, 'out', name + '-poster.jpg')]);
rmSync(join(dir, 'frames'), { recursive: true, force: true });
console.log(name, 'frames', n, 'seconds', (n / FPS).toFixed(1), 'errors', errs);
