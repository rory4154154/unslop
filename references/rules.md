# Redline rules

Every screen rebuild and every film's end state has to pass these rules. They combine heydamir's unslop principles with what real design reviews of redline guides kept rejecting. The review lessons win any conflict.

## Review lessons (the bar)

| What a reviewer said | Rule it became |
|---|---|
| "Make it look like an actual human designed it" | Every decision must be explainable. If another model given the same prompt would produce the same screen, redo it |
| "I really hate the emojis on the sidebar" | Emoji used as icons are always the first thing to go: one line-icon set at one stroke weight |
| "It can also be component redesigns" | The guide has two parts: full screens, then components |
| Static before/after crops with numbered red pins: "gone backwards" | No pinned crops. Components are always step films |
| Drag-to-compare sliders on full screens: fine | Keep the slider for full screens |
| "Short videos showing each step, with a cursor going over it" | One film per component: cursor → red labelled box → fix morphs in place → box turns teal |
| "You just completely deleted everything" (a tile grid vanished and a line appeared) | Content never vanishes. It morphs, slides, shrinks or collapses into its replacement on screen |
| "The last button is cut off" | Every end state fits its plate with margin. Check the settled frame of every step |
| "I don't even think that looked better afterwards" | The end state must be obviously better. If you can't say why in one line, redesign it, don't just tidy it |
| "Still too many unnecessary lines" | Zero dividers by default. Separate with space and one tone step |
| "Only have a subheader if it's absolutely necessary" | Delete every section label the screen survives without |
| "That's exactly how the unslop process should look" (an icon/sidebar film) | The bar for films: a small component zoomed up, 4–6 steps, every step visibly changing it |

## Screen rules

**Lines and structure**
- No `border-bottom`, `<hr>` or hairline dividers between rows, sections, rail, header or status bar.
- At most one outline per screen, on the single thing that needs to stand out, and you can say why.
- No cards in cards. A modal on a grey backdrop holding cards is a card in a card, so make it a page.
- Separate surfaces with one tone step (e.g. page `#FFF`, shell `#F4F4F3`, fill `#F2F2F0`).
- Fill a row only when the fill means something, e.g. "waiting on you".
- Use nested radii: inner radius = outer radius minus padding. Bar tracks get square ends.

**Labels and type**
- A section label stays only if the screen doesn't work without it.
- No eyebrow or kicker above the title, and no uppercase tracked labels. Drop any subtitle that repeats its heading.
- Weights 400 and 500 only. Build hierarchy from size and colour (three text roles).
- No greeting headlines ("Welcome back, Name! 👋"). Use something true and useful instead: the date, the count of things that need the user.
- No full stops on short UI strings, and no em dashes in UI copy.

**Icons, colour, detail**
- Real line icons (e.g. Lucide at stroke 1.6–1.7), never emoji. No icon chips (an icon in a tinted square) unless the chip *is* the brand.
- If the product has a real brand, keep its typeface (check its marketing site's CSS) and its brand colour, sampled from the screen. An indigo-to-violet gradient, sparkles and glow are slop, not brand.
- If there's no real brand, take the accent from the product's world (heydamir's direction: product, character, world, moments, signature).
- The accent goes on data and on one signature element, e.g. a status dot used only for something actually running.
- No glows, gradient washes, button shadows or gradient text. No shadow heavier than about `0 8px 24px rgba(0,0,0,.08)`.
- No streaks or gamification in a work tool. Flag removing a widget or feature as a **product call**, not just a visual fix.

**Copy and data**
- Rewrite filler. A placeholder becomes the question the user actually has to answer.
- A spinner becomes words ("Running"). An age becomes waiting time ("6 days").
- A change says what it compares to ("+$1.4k vs last week").
- One action per row. Only the main action is a filled button.
- Use only data visible on the "before" screen. Never invent a number, name, price or date for the "after".

## Checker bar (`scripts/check_screens.sh`)

- **Taste Skill inspector** (`inspect.mjs --app`): 0 FAIL on every screen. A WARN you can explain is fine (e.g. an empty band under a log that grows).
- **Gesso anti-slop**: PASS on every screen.
- **unslop-ui** (`count_tells.py --surface`): every remaining hit is deliberate and named in your report.

The checkers catch tells; they don't judge whether a screen is good. Always look at each rendered "after" next to its "before".
