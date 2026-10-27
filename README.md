# Mpuza — Create company page, mobile rebuild

A mobile-first React rebuild of `https://mpuza.com/m/create-company-page`, built on measured
Mpuza brand values rather than guessed ones.

```bash
npm install
npm run dev          # http://127.0.0.1:5173
```

| Route | What |
| --- | --- |
| `/` | Create company page — the mobile flow |
| `/company` | The company page it hands off to |
| `/styleguide` | Living style guide (dev only) |

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint:tokens` | **Fails if a raw hex / rgb() / arbitrary colour appears in `src/` outside `src/design/`** |
| `npm test` | Vitest — ring arc geometry, dot counts, badge capping, aria-label text, strength scoring, slugify |
| `npm run audit:responsive` | Checks every route at 11 widths (320 → 1440) for horizontal overflow, clipped text and sub-44px touch targets. Exits non-zero on any finding |
| `npm run shots` | Drives the running app and captures `docs/_shots/` at 320 / 375 / 414 / 768 / 1440 |

## Where the brand came from

Nothing here was eyeballed. `docs/design-language.md` records every token with its provenance,
tagged **OBSERVED** or **ESTIMATE**, from three independent sources that were cross-checked
against each other:

1. **Computed styles** read off `mpuza.com` with Playwright (`tools/extract/measure.mjs`).
2. **Mpuza's production CSS bundle** — the whole app ships in one public Next.js stylesheet, so
   the create-page and company-page rules are readable even though the page itself needs a login.
3. **Pixel sampling** of `reference/screenshots/` (`tools/extract/sample-screenshots.mjs`).

Raw evidence is in `docs/_measured/`.

## The ring-icon system

`<RingIcon />` is one SVG primitive: a Lucide glyph inside a progress ring, an optional dot row
beneath, an optional red count badge. Three sizes, three tones, arc starting at 12 o'clock with
round caps, track in `--color-border`. No raster anywhere, crisp at any size, ≥44px hit area.

`<ActivityOrb />` uses it to merge the header's three separate icons — Notifications, Jobs,
Saved — into one orb below 1024px: bell glyph, arc = share of the latest batch still unread,
three dots (one per category), red badge capped at `9+`. Tapping it opens a sheet with a
3-option segmented control. Above 1024px the three icons come back, each drawn as a small
`RingIcon` so the family still reads as one system.

`<PebbleButton />` is the round white companion used for sheet Close and the floating
Messaging toggle.

All counts come from `src/mocks/activity.ts` — **demo data, not an API.** `/styleguide` has a
dev-only slider panel that drives them so the arc, dots and badge can be watched animating.

## The Mpuza Island

One object that replaces six. The logo avatar, the completion ring drawn around it, the step
counter, the next-step hint, the Create page button, the loading overlay and the success toast
are all now a single navy capsule in the thumb zone that changes shape to suit what it is saying —
resting → expanded checklist → `Creating your page…` → `INTERNORY is live`.

The idea is borrowed from the iPhone's Dynamic Island, which fused two separate hardware cutouts
into one surface. Nothing about the look is borrowed: it is `#0e314c`, Outfit and Mpuza's blue.
Full rationale and the ASCII states in `docs/design-directions.md`.

## Where the redesign's visual language came from

Mpuza writes in two voices. The app shell is quiet; **the landing page is not**, and none of its
register appears inside the product. This rebuild brings it in, measured: uppercase eyebrows at
`.14em`, 800-weight section numerals, cards with a **3px top rule cycling blue → navy → red**, and
`clamp(2rem, 3.8vw, 3rem)` display type at `-.03em`.

The useful discovery: **`#0e314c` is a third brand colour, not a dark grey.** On the landing page
the rules cycle through blue, navy and red with equal weight. The app never uses navy at all.
See `docs/design-language.md` §5b.

## Four deliberate deviations

Both are documented in `docs/design-language.md` §6 and visible in the style guide.

2. **There is a visible focus ring.** Mpuza's real focus state only shifts an input's
   border-colour, with `outline: none` and `box-shadow: none`.
3. **Primary fills are `#35a8df`, the site blue, by explicit request.** White on it is 2.69:1 and
   does not meet WCAG AA for normal text. The darker `#1d7eae` is still used for blue *text on
   light surfaces*, which is what Mpuza itself does for the selected tab label.
4. **Touch targets reach 44px on touch devices only.** Mpuza's measured button heights are 42px
   and 36px, both under the minimum — and 44px is a figure Mpuza already honours on its own
   mobile tab rail. On a mouse pointer the measured values stand.

## Structure

```
src/
  design/tokens.css        the only file allowed to hold raw colour values
  components/ui/           Button, Field, Avatar, Segmented, BottomSheet,
                           UploadZone, ActionBar, Feedback
  components/company/      CompanyPreview — the living hero
  components/shell/        AppHeader
  routes/                  CreateCompanyPage, CompanyPage, StyleGuide
tailwind.config.ts         maps every token to a utility name; no literals
docs/design-language.md    measured tokens + provenance
docs/design-directions.md  three mobile directions, one recommended
```
