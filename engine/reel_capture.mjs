// node engine/reel_capture.mjs <films>/<name> <click ms,ms,…> <frames> <out.mp4> [--still ms,ms]
// Reel mode: renders a film at 24fps so each step's click lands at the given time (ms from the film's first frame),
// in a 1120x622 (1.8:1) window at 2x, scaled to 1600 wide. Env PZ=1.17 zooms a short, wide plate up to fill it.
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch, filmPath } from './pw.mjs';

const [arg, atList, framesArg, out, flag, stills] = process.argv.slice(2);
if (!out) { console.error('usage: node reel_capture.mjs <films>/<name> <ms,ms,…> <frames> <out.mp4> [--still ms,ms]'); process.exit(1); }
const { dir, name, file } = filmPath(resolve(arg));
const FPS = 24, VW = 1120, VH = 622, frames = Number(framesArg);
const end = Math.round(frames / FPS * 1000);
const browser = await launch();
const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(pathToFileURL(file).href + `?reel&at=${atList}&end=${end}&vw=${VW}&vh=${VH}&pz=${process.env.PZ || 1}`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
if (flag === '--still') {
  mkdirSync(join(dir, 'check'), { recursive: true });
  let t = 0;
  for (const ms of stills.split(',').map(Number)) {
    await page.evaluate(([a, b]) => { for (let x = a; x <= b; x += 1000 / 24) Steps.tick(x); Steps.tick(b); }, [t, ms]);
    t = ms;
    await page.screenshot({ path: join(dir, 'check', `reel-${name}-${ms}.jpg`), type: 'jpeg', quality: 80 });
  }
  console.log(name, 'stills', stills, 'errors', errs); await browser.close(); process.exit(0);
}
const tmp = join(dir, 'frames', 'reel-' + name); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => Steps.tick(t), f * 1000 / FPS);
  await page.screenshot({ path: join(tmp, String(f).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 92 });
}
await browser.close();
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(tmp, '%04d.jpg'), '-vf', 'scale=1600:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
rmSync(join(dir, 'frames'), { recursive: true, force: true });
console.log(name, 'frames', frames, 'errors', errs, '->', out);
