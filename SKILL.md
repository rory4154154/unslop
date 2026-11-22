---
name: unslop
description: Unslop any UI and deliver a "redline" design guide. Input can be a live URL, screenshots, a screen recording, an app in your own codebase, or nothing (demo mode builds a deliberately default AI-made UI first). It rebuilds each screen as clean HTML in the product's own font and brand colour, using only data from the original, and checks it with every installed anti-slop checker. The output is one page: full screens with drag-to-compare before/after sliders, then each component as a short step-by-step film where a cursor highlights each problem in red, the fix morphs in place and the box turns teal. Films can be re-timed to a voiceover for a talking-head video. Use when asked to unslop, redline, de-AI or redesign a UI, make a before/after design guide, show the unslop process step by step, or turn an AI-generated screen into one that looks designed.
license: CC-BY-4.0
---

# Unslop

Turns AI-looking UI into a designed interface, and shows the work. Every fix is made visibly, one step at a time, so the result teaches as well as looks better.

Built on [unslop by Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop) (CC BY 4.0): his nine-pass method is the design brain, and the step-morph film technique is adapted from his story video. Keep the credit in anything you publish with it.

**Before designing anything, read `references/rules.md`** (the rules and the review lessons behind them). Read `references/films.md` before writing the first film.

`K` = this skill's folder. One-time setup: `cd $K && npm install`. That installs Playwright; it uses system Chrome on macOS, otherwise run `npx playwright install chromium`. You also need `ffmpeg` and Node 18+.

## Skills this pulls in

All are optional but recommended. The workflow skips any that aren't installed and says so.

| Skill | Role |
|---|---|
| [heydamir/unslop](https://github.com/heydamir/unslop) | **The method.** Read its SKILL.md first and do its redline pass layer by layer: spacing, colour, icons, copy, type, layout, details, visuals, motion. Also the five-line direction: product, character, world, moments, signature |
| [unslop-ui](https://github.com/felipebasurto/unslop-ui) | Labels, badges, status strings, decorative icons. `count_tells.py --surface` is a checker |
| [Gesso anti-slop](https://github.com/Gesso-Build/skills) | 73-rule HTML checker: `npx -y @gessobuild/anti-slop check <file>` |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend`) | `inspect.mjs --app`, a real-browser inspector for app screens |
| [Emil Kowalski's skills](https://github.com/emilkowalski/skills) | Motion, easing and interaction polish for films and the guide |
| [Vercel Web Interface Guidelines](https://github.com/vercel-labs/agent-skills) | Accessibility pass on the guide page |

## Workflow

1. **Scaffold** with `$K/scripts/new_run.sh <run-dir> <product>` (add `--demo` for a fictional UI). It creates:
   - `before/`, `src/`, `after/`
   - `films/`, with the engine copied in
   - `guide/<product>-redline.html`
2. **Get the "before" screens.** Save them as `before/<n>-<name>.png` at the CSS viewport ×2 (default 1440×800 → 2880×1600).
   - **Live URL:** screenshot it at 1440×800 at 2x (Playwright, or heydamir's `snapshot.mjs`, which also saves the page). Rebuild from that.
   - **Screenshots:** use them as the "before" images.
   - **Screen recording:**
     1. Make a contact sheet: `ffmpeg -i rec.mov -vf "fps=1/5,scale=480:-1" contact/%03d.jpg`.
     2. Read it and pick the screens.
     3. Run `$K/scripts/stills.sh rec.mov before <w:h:x:y|-> 1-home=75 2-orders=79 …`. The crop cuts off browser chrome.
   - **Your own codebase:** run the app and screenshot each page. The HTML rebuilds become the spec for the real change: once the guide is approved, apply the same changes in your components and tokens.
   - **Demo mode (no UI, or no permission to show a real one):**
     - Invent a product unlike the last one.
     - Build its "before" in `slop/` as honest default AI output using `slop-kit`: Inter, indigo-to-violet gradients and gradient text, emoji icons, "Welcome back, Name! 👋", pastel icon chips, percentage pills, rainbow status pills, a pulsing badge, an "AI Insights ✨" card, an upsell card, dividers everywhere, and uppercase tracked labels.
     - Fill it with plausible fictional data.
     - Render it with `node $K/scripts/render_screens.mjs <run>/slop <run>/before`.
     - Say it's fictional in the guide.
3. **Pick what to redline:** 2–4 full screens and 3–6 components. If there are emoji icons, they're always a component.
4. **Find the brand.**
   - Keep a real typeface (read it from the product's site CSS) and a real brand colour (sample a pixel: `ffmpeg -i still.png -vf crop=1:1:x:y -f rawvideo -pix_fmt rgb24 - | xxd -p`).
   - Slop isn't brand: no gradient, sparkle or glow.
   - If there's no real brand, write heydamir's five-line direction and take the accent from the product's world.
   - Put the font and colour into the screen tokens and into `films/frame.css` (`--live*` and the font `@import`).
5. **Audit.**
   - List every tell per screen using heydamir's `references/signs.md` and `rules.md`.
   - Name the one focal point per screen and the product's one signature element.
   - Mark anything that changes behaviour (removing a widget, a streak or an upsell) as a **product call**.
6. **Rebuild the screens.**
   - Put one shared `product.css` and `chrome.js` (nav, top bar) in `src/`, then one HTML file per screen named after its still. Start from `src/_screen.html`.
   - Render with `node $K/scripts/render_screens.mjs <run>/src`; it writes to `after/`.
   - Check with `$K/scripts/check_screens.sh <run>/src`.
   - Then **look at each "after" next to its "before"** and fix what the checkers can't see: too many lines, unneeded labels, a weak focal point.
   - Loop until it passes the bar in `rules.md`.
7. **Make the films.**
   - One per component, `films/<name>.html`, copied from `_film.html`.
   - Build the before state faithfully from the screen, then add 4–6 steps.
   - Run `node $K/engine/capture.mjs <run>/films/<name> --steps` and read every settled frame against the checklist in `films.md`.
   - Then render: `node $K/engine/capture.mjs <run>/films/<name>`. It takes 1–2 minutes per film, so run it in the background.
8. **Assemble the guide.**
   - Run `$K/scripts/guide_assets.sh <run>`.
   - Fill in `GUIDE`, `PAGES` and `FILMS` at the bottom of the guide HTML and set the `<title>`. The `FILMS` step lists must match each film's `Steps.init` order.
9. **Deliver.**
   - The guide is one HTML page plus `img/` and `vid/` folders.
   - If the host can publish pages (e.g. an artifact or page-publishing tool), publish it with those folders as supporting files. Otherwise zip `guide/`.
   - In your reply, give:
     - the link or path
     - checker results per screen, including any hit you kept on purpose and why
     - the product calls
     - anything not verified (e.g. video playback on the published page)

## Talking-head video (optional)

If you record yourself narrating the redline, re-time each film to your words with reel mode (`references/films.md` → Reel mode):

```
node $K/engine/reel_capture.mjs <run>/films/<name> <click ms,ms,…> <frames> <out.mp4>
```

The output is a 1.8:1 window that drops straight into a vertical edit above your head. Pair it with before→after wipes of the full screens for the intro.

## After feedback

- Fix every point named, and re-check the other films for the same failure: if one film deletes content instead of morphing it, check them all.
- Re-render only what changed, re-run `guide_assets.sh`, and republish to the same place.
- Add any new lesson to the table in `references/rules.md`, so the next run inherits it.

## Files

| Path | What it is |
|---|---|
| `engine/steps.js` | Step-morph engine: cumulative step classes, swap/out/in, cursor, red→teal marks, frame clock, reel mode |
| `engine/capture.mjs` | Film → MP4 + poster (30fps); `--steps` settled check frames; `--still` |
| `engine/reel_capture.mjs` | Film re-timed to a voiceover (24fps, 1.8:1, `PZ` plate zoom) |
| `engine/frame.css` | 1280×800 film frame, plate, title, step counter, CC BY credit |
| `engine/pw.mjs` | Playwright and Chrome resolution |
| `templates/film.html` · `screen.html` · `guide.html` | Starters. The guide is driven by a config block |
| `templates/slop-kit/` | Default-AI-UI stylesheet and shell for demo mode |
| `scripts/new_run.sh` · `stills.sh` · `render_screens.mjs` · `check_screens.sh` · `guide_assets.sh` | Pipeline steps |
| `references/rules.md` · `films.md` | The bar, and how to write films |
| `examples/firstcrack/` | A complete demo run (fictional roastery app): slop screens, rebuilds, 4 films, finished guide |
