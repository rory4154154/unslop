# Writing a component film

Each film is one HTML page driven by `engine/steps.js`. It opens on the slop "before" state. For each step, a cursor glides to the problem, a red labelled box appears, the cursor clicks, the fix morphs in place, the box turns teal with a tick, and it moves on. Capture runs at a fixed frame rate on a frame clock, so every frame is exact.

Worked examples: `examples/firstcrack/films/`.

| Film | Shows |
|---|---|
| `nav.html` | Sidebar: icon crossfades, labels collapsing, an upsell card collapsing, the plate shrinking |
| `stats.html` | Stat cards: a 2×2 grid of cards that slides into one row of figures |
| `roast.html` | A progress bar that becomes a drawn chart: an SVG draw-in, the card going dark, a tile flying into the chart |
| `orders.html` | Table rows: dividers out, pills becoming words, three icon buttons becoming one action |

## Contract

- **Before and steps:** the "before" is the plain CSS. Each fix is `.sK .thing { … }`. The classes add up, so step 4 still has `.s1`–`.s3`.
- **Text that changes:** `<span class="swap" data-at="K"><span class="from">old</span><span class="to">new</span></span>`. For block-level text, use `class="swap b"`.
- **Something that goes:** `data-out="K"` collapses its height. Add `data-axis="x"` to collapse its width (inline badges and buttons).
- **Something that arrives:** `data-in="K"` grows in, also with `data-axis="x"`.
- **Steps:** `Steps.init({ steps: [{ label, target: [selectors], hit? }] })`.
  - `label` is 2–5 words, said the way a designer would ("Kill the glow", "One clear yes").
  - `target` gets the red box.
  - `hit` is where the cursor clicks; it defaults to `target[0]`.
- **Timing:** the intro is 1.1s, each step 3.7s, the outro 2.2s; 5 steps run about 21.8s. The guide template's `INTRO`/`STEP` constants depend on these.
- **Preview** in real time: open `<name>.html?play`.

## Morph patterns

**A grid becomes a line or row** (`stats.html`):
- Position the cards absolutely in the before state.
- At the step, animate `left`, `top`, `width`, `height` and the font size so each one slides into its slot.
- Fade out card backgrounds and borders.
- Remove a card that is cut entirely one step earlier, with opacity and a small scale.
- Never use `data-out` on the grid with `data-in` on the line. It reads as "everything got deleted".

**A layout rearrangement** (an empty hero shrinking while a list moves up):
- Animate the hero's height and padding down.
- Move the list with `top` and `transform`, adding `transition-delay: 420ms` so the hero clears first.
- Give the shrinking element `z-index: 2` so nothing crosses over it mid-morph.

**The plate follows the content:**
- When content shrinks, shrink `.plate` and `.stage` heights in the same step, e.g. `html.live .plate { transition: height 650ms … }`, then `.s4 .plate { height: 362px }`.
- A tall empty plate at the end reads as dead space.

**Stacked text collapsing:** when an old paragraph swaps for a shorter one, cap `.from` with `max-height` and drop it to 0 at the step. Otherwise the old height lingers.

**Icons replacing emoji:** stack the emoji and the line icon absolutely in one box and crossfade them with a small scale and rotate (`nav.html`). That isn't a swap.

**A chart drawing in** (`roast.html`):
- Set `stroke-dasharray`/`stroke-dashoffset` to the path length, then `.sK .act { stroke-dashoffset: 0 !important }` with its own transition.

## Pitfalls

- **Reserved class names.** The engine puts `live`, `done` and `s1`–`s12` on `<html>`, and styles `.swap`/`.from`/`.to` globally. A component class called `.live` will collide.
- **Collapsing text wraps into a tall column.** Width collapses need `white-space: nowrap`. The engine sets it, so don't override it.
- **Overflow at the final step.** Things that fit at step 2 can overflow by step 4. Lay out the end state first, then work backwards.
- **Anything that forces a layout before `steps.js` loads shows on camera.** E.g. building an SVG and calling `getTotalLength()` before the engine's script tag: every hidden `.to` then starts visible and fades out in the first 0.7s, so old and new text overlap in frame 0. Build and measure in the script after `steps.js`, just before `Steps.init`, and check `--still 0,400`.
- **Collapse wrappers are inline.** A `<span>` inside a `data-out` wrapper ignores width and renders as a hairline. Give it `display: block` or `inline-block`.
- **Columns that gain or lose a button.** When one row gets a button and its neighbours don't, give the action column a fixed width.
- **Fonts.** Capture waits for `document.fonts.ready`. Keep `&display=block` on font imports.

## Verify before rendering

```
node engine/capture.mjs <film-dir>/<name> --steps   # check/<name>-step1.jpg … -stepN.jpg (settled) + -end.jpg
```

Read every frame. Each must pass all of these:
1. Nothing clipped by the plate.
2. Nothing overlapping.
3. No old content lingering.
4. The change is visible at phone size.
5. The end frame is obviously better than frame 0.

Use `--still 4000,4400` for mid-morph frames. Then `node engine/capture.mjs <film-dir>/<name>` writes `out/<name>.mp4` and a poster.

## Reel mode: sync a film to a voiceover

When you narrate the redline on camera, re-render each film so the clicks land on your words:

```
node engine/reel_capture.mjs <film-dir>/<name> <press ms,ms,…> <frames> <out.mp4> [--still ms,ms]
PZ=1.17 node engine/reel_capture.mjs …   # zoom a short, wide plate up to fill the window
```

- **Times:** each time is the click time in ms from the film's first frame, at 24fps. Put each click 6–12 frames before the stressed word so the morph (~16 frames) settles on it.
- **Timing:** the engine fits the cursor move, the mark and the teal fix around each click.
- **Output:** a 1120×622 (1.8:1) window at 2x, scaled to 1600 wide, with no title or credit, bigger tags and cursor, and the plate centred.
- **Tags:** a tag that would run off the right edge right-aligns itself.
- **Tall plates (a sidebar) can't grow.** They're bound by height.
