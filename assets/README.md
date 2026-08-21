# Swapping the placeholder art

Every drawing in this site is inline SVG I hand-wrote as a stand-in. Nothing here
is meant to survive — it exists so the layout, the scroll choreography and the
gaze tracking are all real and testable before the actual artwork arrives.

There are **four** placeholders. Each is marked in `index.html` with a
`<!-- PLACEHOLDER ART -->` comment.

---

## 1. The portrait — `.stage__figure` in `index.html`

The big one. A fixed, full-bleed face that the first five acts scroll over:
the eyes start shut, open as you scroll, then turn sharingan and mangekyō.

**To swap for a real image**, replace the whole `<svg class="portrait">` with:

```html
<img class="portrait" src="assets/itachi-portrait.png" alt="">
```

…and you'll need **three** versions, cross-faded instead of the SVG's moving
eyelid. Stack them and drive opacity from `--lid` / `[data-iris]`:

| File | State | Shown when |
|---|---|---|
| `itachi-closed.png` | eyes shut | `--lid` near 0 |
| `itachi-open.png` | eyes open, black irises | `--lid` near 1, `data-iris="black"` |
| `itachi-sharingan.png` | red, three tomoe | `data-iris="sharingan"` |
| `itachi-mangekyo.png` | mangekyō | `data-iris="mangekyo"` |

Requirements: **portrait orientation, ~1600×1960 or larger**, face centred
horizontally, eye-line at roughly **42% from the top** (that's where
`transform-origin` on `.stage__figure` pushes in). Transparent PNG or a dark
background that blends into `--void` (`#050406`).

If you only have one image and don't want the four-state swap, delete the
`--lid` / `[data-iris]` rules in `style.css` and keep the scroll zoom — you lose
the eye-opening beat but everything else still works.

---

## 2. The gaze eyes — `.track__svg` in `index.html`

The centrepiece: two mangekyō eyes that follow the cursor across **9 columns ×
3 rows = 27 discrete frames** (`main.js` → `gaze()`).

Two ways to swap:

**a) Keep the SVG, restyle it.** Easiest. The irises are the `.tIris` groups;
`main.js` only sets `transform: translate(x,y)` on them, so any artwork inside
those groups tracks correctly.

**b) Use a real 9-frame sprite** (what the original appears to do). Lay the nine
gaze positions out left-to-right in one strip, then replace the transform in
`gaze()` with a `background-position` step:

```js
el.style.backgroundPosition = `${-col * 100}% 0`;   // instead of translate()
```

Sprite spec: 9 frames wide, each frame the same size, gaze sweeping hard-left to
hard-right. Drop the `ROWS` term if you only have one row — the frame counter
then reads 01–09 instead of 01–27.

---

## 3. The jutsu figure — `.jutsu__figure` in `index.html`

A cloaked silhouette on the right of the JUTSU act. Pure decoration; the layout
does not depend on it.

```html
<img class="jutsu__figure" src="assets/itachi-amaterasu.png" alt="">
```

Wants a **cut-out figure with a transparent background**, roughly 3:4, bottom-
anchored. In the reference this is Itachi with Amaterasu flames behind him.

---

## 4. `storm.jpg` — currently CSS gradients

`.stage__storm` in `style.css` is a stack of radial gradients standing in for a
background plate. To use a real image, add it as the first background layer:

```css
.stage__storm{
  background:
    radial-gradient(60% 45% at 50% 34%, rgba(120,6,12,.34), transparent 70%),
    url("assets/storm.jpg") center/cover;
}
```

Keep it dark — anything brighter than about 12% luminance will fight the text.

---

## Audio

`main.js` generates a low drone with the Web Audio API so the `音 OFF` toggle is
functional with no audio file shipped. To use a real track, drop it in here and
replace `buildDrone()` with an `<audio loop>` element:

```html
<audio id="bgm" src="assets/theme.mp3" loop preload="none"></audio>
```

Then have the toggle call `bgm.play()` / `bgm.pause()`. Keep it **off by
default** — autoplaying audio is blocked by browsers and hostile besides.

---

## A note on rights

Itachi and everything around him belong to Masashi Kishimoto / Shueisha /
Studio Pierrot. Fan art and tribute pages are fine as personal or portfolio
work. Do not put this behind a paywall, run ads on it, or sell anything from
it. If you use someone else's illustration, credit the artist and check they
allow reposting.
