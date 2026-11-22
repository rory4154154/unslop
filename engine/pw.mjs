// Shared Playwright launcher. Resolves playwright from the skill folder (run `npm install` there once),
// or from $PLAYWRIGHT_MJS. Uses system Chrome on macOS or $CHROME_PATH if present, else Playwright's Chromium
// (`npx playwright install chromium`).
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export async function launch() {
  let pw;
  if (process.env.PLAYWRIGHT_MJS) pw = await import(pathToFileURL(process.env.PLAYWRIGHT_MJS).href);
  else {
    try { pw = await import('playwright'); }
    catch { throw new Error('Playwright not found. Run `npm install` in the skill folder, or set PLAYWRIGHT_MJS to a playwright/index.mjs.'); }
  }
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const executablePath = process.env.CHROME_PATH || (existsSync(mac) ? mac : undefined);
  return pw.chromium.launch(executablePath ? { executablePath } : {});
}

/** "<dir>/name" or "<dir>/name.html" → { dir, name, file } */
export function filmPath(arg) {
  const file = arg.endsWith('.html') ? arg : arg + '.html';
  const i = file.lastIndexOf('/');
  return { dir: i < 0 ? '.' : file.slice(0, i), name: file.slice(i + 1, -5), file };
}
