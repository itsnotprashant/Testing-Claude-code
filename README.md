# うちはイタチ — UCHIHA ITACHI

A scroll-driven tribute page. Eight acts, a fixed portrait you scroll *through*
rather than past, and two mangekyō eyes that follow your cursor.

**Vanilla HTML, CSS and JavaScript. No framework, no build step, no dependencies.**
Open `index.html` and it runs.

```bash
python3 -m http.server 8000    # then visit http://localhost:8000
```

---

## The acts

| # | Section | What happens |
|---|---------|--------------|
| I | `#hero` | 「うちはイタチ」 over a closed-eye portrait. *Scroll to open his eyes.* |
| II | `#awakening` | 覚醒 — the eyes open as you scroll |
| III | `#sharingan` | 写輪眼 — irises turn red, three tomoe spinning |
| IV | `#crow` | 烏 — drifting feathers between beats |
| V | `#eyes` | 見つめ返せ — **the eyes track your cursor**, 27 gaze frames |
| VI | `#jutsu` | 其の眼に宿る術 — three technique categories, each opens a card overlay |
| VII | `#quote` | The Sasuke line, over a giant ghost kanji |
| VIII | `#end` | 終 |

Persistent chrome: fixed header, `暁 · AKATSUKI` rail on the left, a live
`SCROLL 000%` counter and progress bar on the right, a per-act label bottom
right, a frame counter bottom left, and a custom cursor.

---

## How the moving parts work

**Scroll choreography** — `main.js` writes four CSS custom properties on
`:root` from the scroll position, and the stylesheet does the rest:

| Property | Drives |
|---|---|
| `--lid` | `0` shut → `1` open; translates the SVG eyelids |
| `--zoom` | pushes the portrait in from 1× to 2.5× across acts I–III |
| `--pan` | parallax offset, split between background and figure |
| `--stage-op` | retires the portrait as the tracking eyes take over |

Iris state (`black` / `sharingan` / `mangekyo`) and the corner label come from an
IntersectionObserver keyed to whichever act crosses the middle of the viewport.

**Gaze tracking** — the viewport is divided into 9 columns × 3 rows. The cursor's
cell picks one of 27 discrete frames; the irises snap to that offset and the
counter reads `FRAME 01`–`FRAME 27`. Touch devices get a slow autonomous drift
instead of a dead scene.

**Audio** — the `音 OFF` toggle builds a low drone with the Web Audio API, so it
does something real without shipping an audio file. Off by default.

---

## Design system

Built against the **Parallax Storytelling** pattern (`.claude/skills/ui-ux-pro-max`),
which is rated **high accessibility risk** — so every effect has a fallback:

- `prefers-reduced-motion: reduce` renders the **final readable state**: eyes
  already open, no scroll-scrub, no parallax, no gaze tracking, no grain, no
  custom cursor.
- A **skip link** jumps past the scroll acts.
- **Audited, not assumed.** A scripted pass measured every text node's computed
  contrast, every target size, and heading order. It found 12 contrast failures
  (a `.34` alpha tier at 2.56:1 carrying real copy like "SCROLL TO OPEN HIS EYES")
  and micro-type down at 8px. Both are fixed: the text ramp now bottoms out at
  5.3:1, meaningful copy is >=11.5px, and a separate `--tx-deco` tier holds the
  failing alpha — used **only** inside `aria-hidden` chrome. Gradient-clipped
  headings were verified by sampling painted pixels (4.9:1 at their palest).
- The card overlay is a real `role="dialog"`: focus moves in, is trapped, Escape
  closes it, and focus returns to the button that opened it.
- Visible focus rings everywhere (2px, `--blood-hot`). Nothing is hover-only.
- Responsive at 375 / 768 / 1024 / 1440, no horizontal scroll.
- With JavaScript off you still get every word — nothing is JS-gated.

**Tokens** (`style.css`):

```
--blood #c0121f   --blood-hot #ff2b2b   --blood-deep #78060c
--void  #050406   --char #0f0b0c        bone text 232,228,220
--serif Shippori Mincho B1   --display Cormorant Garamond   --mono JetBrains Mono
```

---

## The art is placeholder

Every illustration is inline SVG I wrote as a stand-in so the mechanics could be
built and tested for real. **See [`assets/README.md`](assets/README.md)** for
what to replace and the exact specs each slot needs.

---

## Rights

Itachi Uchiha and *Naruto* belong to Masashi Kishimoto, Shueisha and Studio
Pierrot. This is a non-commercial fan tribute. Don't monetise it, and credit any
artist whose work you drop into `assets/`.
