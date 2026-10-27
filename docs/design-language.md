# Mpuza Design Language — measured

**Status:** Step 1 complete for everything reachable without a login.
**Measured:** 2026-10-27 against `https://mpuza.com` (production).
**Method:** Playwright + Chromium, computed styles read from the live DOM, plus a static read of
the production CSS bundle and the PWA manifest. Reproduce with `node tools/extract/measure.mjs`.

Every row below is tagged:

| Tag | Meaning |
| --- | --- |
| **OBSERVED** | Read from a computed style, Mpuza's own CSS bundle, its manifest, or its logo pixels. This *is* Mpuza. |
| **ESTIMATE** | Not verifiable from a public surface. A proposal, not a brand fact. |
| **CONTRADICTED** | An eyeballed starting point that the measurement disagrees with. |

---

## 1. Sources, and what is still out of reach

1. **The six screenshots are present** in `reference/screenshots/` and have been read and
   pixel-sampled (`tools/extract/sample-screenshots.mjs` → `docs/_measured/screenshot-colors.json`).
   They are: `create-empty`, `create-messaging`, `create-filled`, `create-submit`,
   `company-page`, `company-loading`.
2. **`docs/brief.md` does not exist**, so I worked only from the prompt.
3. **`/m/create-company-page` requires a login.** It returns 200 but redirects to `/login`
   (verified: `finalUrl` is `https://mpuza.com/login`). I could not render the create form,
   so I could not read its live computed styles or interact with it.

**The large mitigation:** Mpuza ships one Next.js CSS bundle for the whole app
(`/_next/static/css/be822bac34120702.css`, 1.22 MB), and it is public. The create-company-page
and company-page rules are *in that bundle* even though the page itself is gated. So I read the
real rules for `.mpuza-create-company-panel`, `.mpuza-company-avatar`, `.mpuza-company-slogan`,
`.mpuza-company-website-btn`, the logo upload dragger, the tab bar and the Company Overview
accordion directly from Mpuza's source. Those are **OBSERVED**, not inferred from a picture.

The screenshots then served as the **cross-check**: for each component I had read out of the
bundle, I sampled the corresponding pixels. Every CSS value survived (see §10). Two things the
bundle could not tell me — the authenticated canvas color and the solid-blue banner/accordion
headers — the screenshots settled.

What remains genuinely unverified is listed in §8.

---

## 2. Verdict on your eyeballed starting points

| # | Your starting point | Measured | Verdict |
| --- | --- | --- | --- |
| 1 | Font: geometric sans, probably **Outfit** | `Outfit`, loaded from Google Fonts at weights **300, 400, 500, 600, 700, 800**, `display=swap`; exposed as `--font-outfit: "Outfit", sans-serif` and `--bs-heading-font-family` | **Correct** |
| 2 | Primary action blue ≈ `#3BA6DE` | **`#35a8df`** — 299 occurrences in the bundle, second only to white | **Close, corrected** |
| 3 | Section heading blue, a lighter ≈ `#43A0D9` | No such color exists in the bundle. Pixel-sampling "Company logo" and "Profile Details" gives `#35afe7`/`#35ade5`, which is `#35a8df` plus antialiasing bias — the same sampler returns **exactly** `#35a8df` on hard-edged strokes (tab underline, focused border, upload icon). There is **one** Mpuza blue, plus a darker `#1d7eae` and a hover `#2b93c5` | **CONTRADICTED** — one blue, not two |
| 4 | Brand red/coral ≈ `#EF4632` | **`#e9432f`** — declared by Mpuza itself as `theme_color` and `background_color` in `/manifest.json` | **Close, corrected** |
| 5 | Page background, pale blue-grey ≈ `#DFECF4` | **`#dfeef5`** — `.ant-layout#mpuza_app_container { background:#dfeef5 }`, and sampled from the screenshots at **spread 0** (perfectly flat) in four separate places | **You were right.** My Step 1 reading of `#f7fafc` came from `/login`; that is the auth-gate background, not the app shell |
| 6 | Cards white, soft shadow, ~8px radius | White and soft-shadowed, yes — but the radius is **6px** (`--mpuza-radius-md: .375rem`), on 110 elements of the home page. 8px appears once | **Corrected: 6px** |
| 7 | Near-black headings, mid-grey secondary | True, but the ramp is **navy-tinted**, not neutral grey: `#0e314c`, `#3d5a73`, `#6084a4`, `#9aafc2`. A parallel neutral ramp (Tailwind greys) is used inside the app shell | **Refined** |
| 8 | Slogan: italic, blue, curly quotes | `.mpuza-company-slogan { color:#35a8df; font-size:.9rem; font-style:italic; line-height:1.4 }`. The curly quotes are **not** in the CSS but are visible in `create-filled.png` and `company-page.png` — `“Internships, rebuilt for the best.”` — so they come from the markup | **Fully confirmed** |
| 9 | Logo avatar: big circle, light-grey fill, thick white ring, shadow, initials | `.mpuza-company-avatar`: **104×104px**, `border-radius:9999px`, `background:#f3f4f6`, **`border:4px solid #ffffff`**, `box-shadow:0 8px 20px rgba(15,23,42,.16)`; initials `1.65rem/800`, `letter-spacing:.02em`, `color:#111827`, uppercase | **Correct, now exact** |
| 10 | Upload zone: dashed border, light fill, blue upload icon | `border:1px dashed #cbd5e1`, `background:#f8fafc`, `border-radius:.375rem`. The border and fill are **slate, not blue**. The icon color is not in the bundle — unverified | **Partly corrected** |

**Final tally: one contradicted (#3), three corrected to exact values (#2, #4, #6), six confirmed
(#1, #5, #7, #8, #9, #10).** Your color instincts were good; the radius and the second blue were
the two real misses, and #5 was my error, not yours.

---

## 3. Color tokens

### 3.1 Brand

| Token | Value | Source | Used for |
| --- | --- | --- | --- |
| `--color-primary` | `#35a8df` | **OBSERVED** — 299× in bundle; `.btn_dark_blue`, `.mpuza-company-website-btn`, `.mpuza-nav-signup` | Primary button fill, Visit website, Save, selected tab underline, checked checkbox/radio, focus border, slogan text |
| `--color-primary-hover` | `#2b93c5` | **OBSERVED** — `.mpuza-company-website-btn:hover`, `.mpuza-company-follow-btn:hover` border | Hover state of primary fills |
| `--color-primary-text` | `#1d7eae` | **OBSERVED** — `.mpuza-company-menus-bar .ant-menu-item-selected.user_menu span { color:#1d7eae }` | Selected tab label, link-coloured text. See §6 — this is the AA-safe blue and Mpuza already owns it |
| `--color-brand` | `#e9432f` | **OBSERVED** — `/manifest.json` `theme_color`; `.mpuza_header_feedback`, `.btn_red`, `.mpuza-nav-login`, wordmark | "Any feedback?", wordmark, destructive accents, notification dot |
| `--color-brand-hover` | `#d63a27` | **OBSERVED** — `.mpuza_header_feedback:hover` | Hover on brand-red fills |
| *(logo artwork)* | `#e9453b` → `#f1863e` gradient | **OBSERVED** — sampled from `logo.png` (500×378, 70 % transparent) | The logo mark is a **red-to-orange gradient**, not the flat `#e9432f`. Flat red is the UI token; the gradient belongs to the mark only |

### 3.2 Surfaces

| Token | Value | Source | Used for |
| --- | --- | --- | --- |
| `--color-canvas` | `#dfeef5` | **OBSERVED** — `.ant-layout#mpuza_app_container { background:#dfeef5 }`, also `.light_blue`; sampled at spread 0 from four places in the screenshots | **The authenticated app background** behind every card on the create page and the company page |
| `--color-canvas-auth` | `#f7fafc` | **OBSERVED** — `.mpuza-app-layout, .mpuza-app-content` | The *logged-out* auth-gate background only. Not used in this rebuild |
| `--color-surface` | `#ffffff` | **OBSERVED** — every panel, card and preview | Cards, panels, inputs, accordion bodies |
| `--color-surface-subtle` | `#f8fafc` | **OBSERVED** — upload dragger fill; top of the preview bar gradient | Upload zone, inset areas |
| `--color-surface-tint` | `#f7fbfe` | **OBSERVED** — active accordion header; 21× in bundle | Active/expanded header, blue-tinted sections |
| `--color-surface-sunken` | `#f3f4f6` | **OBSERVED** — `.mpuza-company-avatar` background | Avatar fill behind initials |
| `--color-surface-sunken-strong` | `#e5e7eb` | **OBSERVED** — `.mpuza-create-company-logo-preview` background | Form-side logo preview fill |
| *(landing only)* | `#eaf6fc`, `#f4f8fb` | **OBSERVED** — marketing page icons and job-card logos | Public landing page; **not** part of the app shell |

### 3.3 Text

Mpuza runs two parallel text ramps. The **navy ramp** is the marketing/landing voice; the
**neutral ramp** is what the authenticated app and the company page actually use. The create
page belongs to the second.

| Token | Value | Source | Used for |
| --- | --- | --- | --- |
| `--color-text` | `#111827` | **OBSERVED** — `.mpuza-company-title`, `.mpuza-create-company-heading h1`, avatar initials | App headings, company name, initials |
| `--color-text-strong` | `#0f172a` | **OBSERVED** — 69× ; landing `h2`/`h3` | Display headings |
| `--color-text-body` | `#374151` | **OBSERVED** — `.mpuza-company-tagline` | Description / tagline body copy |
| `--color-text-secondary` | `#4b5563` | **OBSERVED** — `.mpuza-company-meta` | "Computer Software · Rwanda" |
| `--color-text-muted` | `#6b7280` | **OBSERVED** — `.mpuza-create-company-heading p`, `.mpuza-company-preview-bar-sub` | Helper text, section subtitles |
| `--color-text-placeholder` | `#9ca3af` | **OBSERVED** — `.mpuza-company-dot`, `.mpuza-company-meta-placeholder` | Separator dots, empty-state placeholder text |
| `--color-text-heading-alt` | `#1f2937` | **OBSERVED** — `.mpuza-company-settings-title` | Accordion titles |
| *(navy ramp, landing)* | `#0e314c` / `#3d5a73` / `#6084a4` / `#9aafc2` | **OBSERVED** — landing page only | Marketing surfaces |

### 3.4 Lines and dividers

| Token | Value | Source | Used for |
| --- | --- | --- | --- |
| `--color-border` | `#e5e7eb` | **OBSERVED** — preview bar bottom, job preview card | Card and section borders |
| `--color-border-input` | `#dbdbdb` | **OBSERVED** — `.mpuza_input.bordered_input` | Input / select borders |
| `--color-border-input-alt` | `#c4c4c4` | **OBSERVED** — `.ant-input-affix-wrapper.mpuza_input` | Affix-wrapped inputs |
| `--color-border-cool` | `#e8eef3` | **OBSERVED** — tab bar underline, accordion border | Tab divider, Company Overview panels |
| `--color-border-dashed` | `#cbd5e1` | **OBSERVED** — logo dragger | Upload zone dashed border |

### 3.5 Status

| Token | Value | Source | Used for |
| --- | --- | --- | --- |
| `--color-danger` | `#e9432f` | **OBSERVED** — `.mpuza-company-settings-title--danger` | Destructive settings rows. Mpuza reuses the brand red as danger |
| `--color-success` | `#157347` on `#e8f7ee`, border `#bfe6cf` | **OBSERVED** — `.mpuza-sr-job-workplace.is-remote` computed styles | Positive chips |
| `--color-success-accent` | `#44ce6f` | **OBSERVED** — 46× in bundle | Secondary green accent |
| `--color-focus` | `#35a8df` | **OBSERVED** — focus changes `border-color` to `rgb(52,166,220)`; no outline, no ring | See §6 — this is an accessibility gap |

---

## 4. Typography

| Token | Value | Source |
| --- | --- | --- |
| `--font-sans` | `"Outfit", sans-serif` | **OBSERVED** — `--font-outfit`, `--bs-heading-font-family`, `html.font-outfit` |
| Weights shipped | 300, 400, 500, 600, 700, 800 | **OBSERVED** — Google Fonts request + `document.fonts` |
| Root size | `16px` on `html` | **OBSERVED** |
| Body size | `14px` (antd base), `line-height 22px` | **OBSERVED** |
| Body letter-spacing | `-0.4px` — inherited to **204 elements** on the home page | **OBSERVED** — this is the single loudest typographic signature |
| Heading letter-spacing | `-0.02em` (h1/h3/h4), `-0.03em` on 48px display | **OBSERVED** |

### Measured type ramp (app shell / company page)

| Role | Size | Weight | Line height | Letter-spacing | Color | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Form page title | `1.35rem` (21.6px) | 800 | — | `.01em` | `#111827` | `.mpuza-create-company-heading h1` |
| Form page subtitle | `.875rem` (14px) | 400 | — | — | `#6b7280` | `.mpuza-create-company-heading p` |
| Preview bar title | `.95rem` (15.2px) | 700 | 1.2 | — | `#111827` | `.mpuza-company-preview-bar-title` |
| Preview bar sub | `.78rem` (12.5px) | 400 | — | — | `#6b7280` | `.mpuza-company-preview-bar-sub` |
| Company name | `1.25rem` (20px) → `1.05rem` ≤768px | 800 | 1.25 | `.01em` | `#111827` | `.mpuza-company-title` |
| Industry · Location | `.875rem` | — | — | — | `#4b5563` | `.mpuza-company-meta` |
| Tagline / description | `.9rem` | — | 1.45 | — | `#374151` | `.mpuza-company-tagline` |
| Slogan | `.9rem` | — | 1.4 | — | `#35a8df`, **italic** | `.mpuza-company-slogan` |
| Avatar initials | `1.65rem` | 800 | 1 | `.02em` | `#111827`, uppercase | `.mpuza-company-avatar-initials` |
| Form logo initials | `1.2rem` | 800 | — | — | `#111827`, uppercase | `.mpuza-create-company-logo-preview span` |
| Accordion title | `.95rem` | 600 | — | — | `#1f2937` | `.mpuza-company-settings-title` |
| Overview section h3 | `1rem` | 700 | — | — | — | `.mpuza-company-overview__about h3` |
| Button label | `14px` | 700 | — | — | `#ffffff` | `.btn_dark_blue` |
| Feedback button | `.82rem` | 600 | 1 | — | `#ffffff` | `.mpuza_header_feedback` |
| Input text | `14px` | — | — | `-.01em` | — | `.mpuza_input` |
| Tabs, mobile | `13px` | 700 when selected | 20px | — | `#1d7eae` selected | `.mpuza-company-menus-bar` ≤767px |

**Note on the ramp:** these sizes (`.78`, `.82`, `.875`, `.9`, `.95`, `1`, `1.2`, `1.25`, `1.35`,
`1.65rem`) are **not a modular scale** — they were chosen ad hoc. I will keep each measured value
where it maps to an existing component, and propose a tidy scale for anything new, clearly marked
as proposed in `tokens.css`. That is a Step 2 decision, flagged here so it is not a surprise.

---

## 5. Shape, depth, space and motion

### Radius — **OBSERVED**

| Token | Value | Where |
| --- | --- | --- |
| `--radius-md` | `.375rem` = **6px** | `--mpuza-radius-md`; the house radius. Cards, panels, inputs, primary buttons, upload zone. 110 elements on the home page |
| `--radius-lg` | `.5rem` = 8px | Company Overview accordion items |
| `--radius-xl` | `12px` | Auth card |
| `--radius-full` | `9999px` | Avatars, pills, the auth `Next` button (`999px`) |
| `--radius-sm` | `2px` | Bare antd inputs (an antd default, not a Mpuza choice) |

### Shadow — **OBSERVED**

Mpuza tints its shadows. Two families exist, and they are not interchangeable:

| Token | Value | Where |
| --- | --- | --- |
| `--shadow-card` | `0 4px 18px rgba(15,23,42,.08)` | `.mpuza-company-preview`, `.mpuza-create-company-panel`, `.mpuza-job-preview` |
| `--shadow-sm` | `0 1px 2px rgba(15,23,42,.03)` | Accordion items |
| `--shadow-raised` | `0 2px 10px rgba(15,23,42,.04)` | Job preview card |
| `--shadow-avatar` | `0 8px 20px rgba(15,23,42,.16)` | 104px company avatar |
| `--shadow-avatar-sm` | `0 4px 12px rgba(15,23,42,.12)` | 72px form logo preview |
| `--shadow-modal` | `0 10px 30px rgba(16,24,40,.08)` | Auth card |
| *(landing, navy-tinted)* | `0 1px 6px rgba(14,49,76,.04)`, `0 4px 18px rgba(14,49,76,.06)` | Marketing surfaces only |
| `--shadow-primary` | `0 4px 12px rgba(53,168,223,.22)` | Blue CTA on the landing nav |
| `--shadow-brand` | `0 4px 12px rgba(233,67,47,.22)` | Red CTA on the landing nav |

**The app shell uses the slate tint `rgba(15,23,42,…)`; the landing page uses the navy tint
`rgba(14,49,76,…)`.** The company page is app shell, so slate is correct for this rebuild.

### Spacing and layout — **OBSERVED**

| Token | Value | Where |
| --- | --- | --- |
| `--page-gutter` | `clamp(1.75rem, 3.5vw, 3rem)` desktop, **`0.75rem` ≤834px and ≤576px** | `--mpuza-page-gutter` |
| Control height | `2.8125rem` = **45px** | `.mpuza_input`, `.mpuza_select` |
| Button height | **42px** (`.btn_dark_blue`), 55px large, 36px feedback | |
| Button padding | `0 2rem` | `.btn_dark_blue` |
| Mobile tab target | **min-height 44px**, padding `12px 2px`, margin `0 6px` | `.mpuza-company-menus-bar` ≤767px |
| Avatar overlap | `margin-top:-3.25rem` on identity row, `padding-top:3.4rem` on the text column | `.mpuza-company-identity` |
| Cover min-height | `200px`, **`160px` ≤767px** | `.mpuza-company-cover` |
| Breakpoints | **768px** (identity stacks), **767px** (tabs/banner), **834px** and **576px** (gutter) | |

### Motion — **OBSERVED**

| Token | Value | Where |
| --- | --- | --- |
| `--motion-fast` | `.15s ease` | `.mpuza-company-website-btn`, follow button |
| `--motion-base` | `.2s ease` | Cards, buttons, inputs — the dominant duration |
| `--motion-slow` | `.25s`–`.3s ease` | Header, nav pill, auth links |
| `--ease-antd` | `cubic-bezier(.645,.045,.355,1)` | antd buttons |

Mpuza has **no spring or overshoot easing anywhere.** Everything is `ease`. The springy
segmented-control pill in Step 4 is therefore a **proposal**, not a brand behaviour — I will say
so in `docs/design-directions.md` rather than present it as Mpuza's.

---

## 5b. The editorial register — Mpuza's second voice

Mpuza writes in two voices. The app shell is quiet: grey labels, white cards, one blue. **The
landing page is not** — and everything in it is measurable. None of it appears inside the product.
This rebuild brings it in, because it is the loudest *authentically Mpuza* material available.

| Device | Measured value | Source |
| --- | --- | --- |
| Eyebrow | `.74rem / 700 / letter-spacing .14em / uppercase`, `#35a8df` — red variant `#e9432f`, light variant `rgba(255,255,255,.85)` | `.mpz-lp-eyebrow` |
| Section numeral | `.9rem / 800 / letter-spacing .04em`, `#35a8df`, last item `#e9432f` | `.mpz-lp-spine__index` |
| Editorial numeral | `.85rem / 800 / letter-spacing .06em`, `#e9432f` | `.mpz-lp-editorial__num` |
| Card with top rule | white, radius `.375rem`, `border 1px rgba(14,49,76,.1)`, **`border-top: 3px solid #35a8df`**, cycling `#0e314c` on `2n` and `#e9432f` on `3n` | `.mpz-lp-mosaic__card` |
| Display heading | `clamp(2rem, 3.8vw, 3rem) / 800 / line-height 1.08 / letter-spacing -.03em`, `#0f172a` | `.mpz-lp-intro__title` |
| Editorial body | `.88rem / line-height 1.55`, `#3d5a73` | `.mpz-lp-editorial__item p` |

The most useful discovery: **`#0e314c` is a third brand colour, not a dark grey.** On the landing
page the 3px rules cycle blue → navy → red with equal weight. The app never uses navy at all. It
is now `--color-accent`, and it is what the Island is made of.

New tokens from this register: `--text-hero`, `--leading-hero`, `--text-eyebrow`,
`--tracking-eyebrow`, `--text-index`, `--tracking-index`, `--color-accent`,
`--color-accent-text`, `--color-rule`, `--rule-weight`.

---

## 6. Contrast audit — and one decision you need to know about

Computed, not estimated (sRGB, WCAG 2.1):

| Pair | Ratio | AA normal | AA large |
| --- | --- | --- | --- |
| `#35a8df` text on white | **2.69** | ✗ | ✗ |
| **white text on `#35a8df`** (the real Create page / Save / Visit website button) | **2.69** | ✗ | ✗ |
| `#1d7eae` on white | **4.52** | ✓ | ✓ |
| white on `#1d7eae` | **4.52** | ✓ | ✓ |
| `#2b93c5` on white | 3.45 | ✗ | ✓ |
| `#e9432f` on white | 3.96 | ✗ | ✓ |
| white on `#e9432f` ("Any feedback?") | 3.96 | ✗ | ✓ |
| `#111827` on white | 17.74 | ✓ | ✓ |
| `#374151` on white | 10.31 | ✓ | ✓ |
| `#4b5563` on white | 7.56 | ✓ | ✓ |
| `#6b7280` on white | 4.83 | ✓ | ✓ |
| `#6b7280` on `#f7fafc` canvas | 4.61 | ✓ | ✓ |
| `#9ca3af` placeholder on white | 2.54 | ✗ | ✗ |
| `#35a8df` on `#f7fafc` canvas | 2.56 | ✗ | ✗ |

**Two real problems, both in Mpuza's live product:**

1. **The primary button fails AA.** White 14px/700 on `#35a8df` is 2.69:1. 14px bold is not
   "large text" under WCAG (that needs 18.66px bold), so this is a normal-text failure on the
   most important control on the page — the one labelled "Create page".
2. **There is effectively no focus ring.** Focusing an input changes `border-color` to the blue
   and nothing else: `outline: 0px none`, `box-shadow: none`. Keyboard users get a ~2.7:1 border
   tint as their only affordance.

**Decision (as directed):**

- **One blue.** Every blue surface and label in the app uses `--color-primary` (`#35a8df`),
  matching mpuza.com exactly. That includes the primary button, the Create/Preview pill, the
  Island, the ring icons and their glyphs.
- White on `#35a8df` is **2.69:1** and does not meet WCAG AA for normal text. This is a known,
  requested trade-off, recorded here rather than quietly worked around.
- `--color-primary-text` (`#1d7eae`) survives in **exactly one place**: the selected company tab
  label, because that is where Mpuza itself uses it
  (`.mpuza-company-menus-bar .ant-menu-item-selected.user_menu span`).
- Blue panels follow Mpuza's own measured pattern — a solid `#35a8df` surface with white text and
  a **white inner button carrying blue text**, exactly as the verification banner does. The
  Island is built this way.
- A **visible focus ring** is still added, which Mpuza does not currently have:
  `outline: 2px solid; outline-offset: 2px`. An addition, marked as proposed.

**Pixel evidence that settled it** (`docs/_measured/screenshot-colors.json`): the verification
banner's inner button label samples `#35b1e6` and the "Post a job" label `#35aee5` — both
`#35a8df` with antialiasing bias — while the selected tab samples `#1d85bd` ≈ `#1d7eae`. An
earlier pass had used the darker blue for those two labels; the measurements say otherwise.

### Touch targets

A third, smaller deviation, found by `npm run audit:responsive`: Mpuza's measured button heights
are **42px** (`.btn_dark_blue`) and **36px** (`.mpuza_header_feedback`). Both sit under the 44px
minimum touch target — and 44px is a figure Mpuza itself already honours elsewhere, in
`.mpuza-company-menus-bar`'s `min-height: 44px` on mobile.

So on **touch devices only**, `--button-height` and `--button-height-sm` come up to 44px:

```css
@media (pointer: coarse) {
  :root { --button-height: 2.75rem; --button-height-sm: 2.75rem; }
}
```

On a mouse pointer the measured 42px and 36px stand unchanged.

---

## 7. Assets

| Asset | Value | Source |
| --- | --- | --- |
| Logo | `https://mpuza.com/logo.png`, **500×378 PNG**, 70 % transparent, red→orange gradient `#e9453b`→`#f1863e` | **OBSERVED** |
| Favicon | the same `logo.png` (no dedicated `.ico`, no SVG anywhere) | **OBSERVED** |
| PWA icons | `/icon-{192,256,384,512}x512.png` | **OBSERVED** — `manifest.json` |
| `theme_color` / `background_color` | **`#e9432f`** | **OBSERVED** — `manifest.json` |
| App name | "Mpuza Inc." | **OBSERVED** — `manifest.json` |
| Font delivery | Google Fonts CSS2, `Outfit:wght@300;400;500;600;700;800&display=swap`, one woff2 | **OBSERVED** |
| Default cover | `/covers/vn2.jpeg` | **OBSERVED** — `.mpuza-user-cover` |
| Loading modal | antd `Spin` with `.ant-spin-blur { opacity:.5 }` over a `:after` at `opacity:.4` | **OBSERVED** — this is an antd default, **not** a Mpuza design decision |

There is **no SVG logo**. A 500×378 PNG is the only mark available. For a crisp mobile avatar
ring I will need either a vector redraw (a proposal, which changes the mark — I would rather not)
or to use the PNG at 2×. I will use the PNG and flag it.

---

## 8. Still unverified — **ESTIMATE**

Short list, now that the screenshots are in.

| Thing | Status | What I am doing |
| --- | --- | --- |
| Exact radius of the verification banner and accordion headers | Fill sampled exactly (`#35a8df`), geometry read off the pixels only | Using `--radius-md` (6px), consistent with the rest of the system |
| Hover / active / disabled states anywhere | The screenshots are all resting states; the page is gated so I could not interact | Deriving from the measured `:hover` rules that *are* in the bundle (`#2b93c5`, `#d63a27`) — marked **PROPOSED** in `tokens.css` |
| Error and validation styling | Never shown | Using `--color-danger` (`#e9432f`, which Mpuza itself uses for danger) — **PROPOSED** |
| Keyboard focus appearance | Measured as near-absent (border tint only) | Adding a real ring — **PROPOSED**, see §6 |
| Any motion, gesture or transition in the real form | Gated | All Step 4 motion is **PROPOSED**; Mpuza ships only `ease`, never a spring |
| Mobile layout of the create page | Mpuza's own CSS has no mobile rules for `.mpuza-create-company-*` beyond dropping the panel shadow ≤768px | The entire mobile composition is **mine**, which is the point of the exercise |

---

## 9. Files produced

| Path | What |
| --- | --- |
| `tools/extract/measure.mjs` | The Playwright extractor. Re-runnable. |
| `tools/extract/logo-colors.mjs` | Samples `logo.png` pixels. |
| `docs/_measured/measured.json` | Full computed-style dump: custom properties, element probes, a frequency census of every color/radius/shadow/transition, focus-state diff, network and font records, for `/`, `/login`, `/signin` (404) and `/m/create-company-page`. |
| `docs/_measured/logo-colors.json` | Logo pixel histogram. |
| `docs/_measured/raw/app.css` | Mpuza's production CSS bundle, as fetched. |
| `docs/_measured/raw/app.pretty.css` | The same, formatted, so the rules above can be checked by eye. |
| `docs/_measured/raw/manifest.json` | Mpuza's PWA manifest. |
| `docs/_measured/raw/logo.png` | The logo as fetched. |
| `docs/_measured/*-{375,1440}.png` | Screenshots of each public page at both widths. |
| `tools/extract/sample-screenshots.mjs` | Pixel sampler for `reference/screenshots/`. |
| `docs/_measured/screenshot-colors.json` | Every sampled patch with its mode and luminance spread. |

---

## 10. Cross-check: screenshots vs. the CSS bundle

Sampled with `tools/extract/sample-screenshots.mjs`. `spread` is the luminance range inside the
patch — **spread 0 means the patch was one flat color**, so the reading is exact.

| What | CSS bundle says | Pixels say | spread |
| --- | --- | --- | --- |
| App canvas | — (not in a public rule) | **`#dfeef5`** | **0** |
| Form panel surface | `#ffffff` | `#ffffff` | **0** |
| Upload zone fill | `#f8fafc` | `#f8fafc` | **0** |
| Form logo preview fill | `#e5e7eb` | `#e5e7eb` | **0** |
| "Create page" button | `#35a8df` | **`#35a8df`** | **0** |
| "Save" button | `#35a8df` | **`#35a8df`** | **0** |
| Verification banner | — | **`#35a8df`** | **0** |
| Company Overview header | — | **`#35a8df`** | **0** |
| Banner's inner button | — | `#ffffff` | **0** |
| Loading card | — | `#ffffff` | 1 |
| Focused textarea border | `#35a8df` | `#35a8df` | — |
| Tab underline | `#35a8df` | `#35a8df` | — |
| Selected tab label | `#1d7eae` | `#1d85bd` (AA bias) | — |
| h1 | `#111827` | `#111827` | — |
| h1 subtitle | `#6b7280` | `#6c7287` | — |
| Description body | `#374151` | `#384154` | — |
| Filled meta line | `#4b5563` | `#4d556e` | — |
| Empty meta placeholder | `#9ca3af` | `#9da3b5` | — |

Every bundle value held. The remaining few-point drifts are antialiasing on text strokes, not
different colors.

**Three things the screenshots taught me that the bundle could not:**

1. The authenticated canvas is **`#dfeef5`**, not the `#f7fafc` of the logged-out shell.
2. The **verification banner and the Company Overview / Company vision accordion headers are
   solid `#35a8df` with white text** — they do not use the white `.mpuza-company-settings`
   accordion I had found in the bundle. That one belongs to the Settings tab.
3. **Every company-page tab label is blue**, not grey: unselected `#35a8df`, selected `#1d7eae`
   with a 2px `#35a8df` underline. That is unusual and distinctly Mpuza, and I would have got it
   wrong from the CSS alone.
