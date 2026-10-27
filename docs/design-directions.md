# Three mobile directions for "Create company page"

All three use **exactly** the tokens in `src/design/tokens.css`. The brand does not vary between
them — same `#35a8df`, same `#e9432f`, same 6px radius, same Outfit, same `-0.025em`. They differ
only in **composition and motion**.

**Observed vs. proposed:** everything in this file is **PROPOSED**. Mpuza has no mobile version
of this page — its own CSS has no mobile rules for `.mpuza-create-company-*` beyond dropping the
panel shadow below 768px. Nothing here should be read as "how Mpuza does it on mobile."

What is **OBSERVED**, and constrains all three:

- The desktop page shows **form and live preview side by side**. The preview updating as you type
  is the feature, not decoration — the page literally says *"the live preview updates as you type."*
- Sections are **Company logo → Company Identification → Profile Details**, blue headings.
- The commit control is a single **"Create page"** button, left-aligned, not full width.
- After creation: cover, overlapping avatar, **all-blue tab rail**, and a solid-blue
  **Company Overview** accordion.

The mobile problem is therefore specific: **a phone cannot show form and preview side by side,
but the preview is the point.** Each direction is a different answer to that.

---

## Direction A — "Split card"

The literal translation. A segmented control at the top switches between Create and Preview;
Create is a column of white section cards on the `#dfeef5` canvas; Preview is a phone-shaped card
that scales in from 0.96 with the cover, avatar and text already settled. The sticky action bar
holds "Create page" and a progress hairline.

It is honest, quick to build, and completely unsurprising. Its weakness is the one that matters:
**the preview is behind a tab, so the live-updating hero — the whole reason the page exists —
is invisible exactly when you are typing into it.** You have to leave the form to see the thing
the form is building.

```
┌──────────────────────────┐
│ ‹  Create company page   │
├──────────────────────────┤
│  ╭────────╮              │
│  │ Create │  Preview     │  ← pill springs between the two
│  ╰────────╯              │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ Company logo         │ │
│ │ ( ? )  drag & drop   │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Company Identification│ │
│ │ Name  [___________]  │ │
│ │ Website [_________]  │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Profile Details      │ │
│ │ Industry   ›         │ │  ← opens a bottom sheet
│ │ Location   ›         │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ ▬▬▬▬▬▬▬▭▭▭  3 of 4       │
│ [     Create page     ]  │
└──────────────────────────┘
```

---

## Direction B — "Living hero" ⭐ recommended

The preview never leaves. A **compact hero strip** is pinned under the segmented control: cover
sliver, 44px avatar, name, `Industry · Location`. As you type, it is the thing that changes —
initials morph, the meta line fills in, the slogan fades up. Switching to Preview does not
navigate anywhere; the same hero **expands in place** into the full-size card via a shared-element
transition, cover growing 64px → 200px, avatar 44px → 104px, on one continuous spring.

This keeps the desktop page's actual promise on a phone: you are always watching your company
page assemble itself. The tab becomes "see it bigger," not "go and look at it," which is a much
smaller cognitive step. It also gives the brand its best moment — that avatar ring and the
`#35a8df` slogan growing into place is unmistakably Mpuza.

Cost: the shared-element morph is the hardest thing here, it eats ~120px of vertical space in
Create view, and it needs a careful reduced-motion fallback (cross-fade, no geometry change).

```
┌──────────────────────────┐
│ ‹  Create company page   │
│  ╭────────╮              │
│  │ Create │  Preview     │
│  ╰────────╯              │
├──────────────────────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← cover sliver, stays put
│ (IN) INTERNORY           │  ← morphs live as you type
│      Computer Software · │
├──────────────────────────┤
│ Company logo             │
│  ( IN )  drag & drop     │
│                          │
│ Company Identification   │
│  Name    [INTERNORY   ]  │
│  Website [https://... ]  │
│                          │
│ Profile Details          │
│  Industry  Computer S. › │
│  Location  Rwanda      › │
├──────────────────────────┤
│ ▬▬▬▬▬▬▬▬▬▬▬▭  4 of 5     │
│ [     Create page     ]  │
└──────────────────────────┘

switching to Preview — same elements, one spring:

│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓  cover grows  ▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ ╭────╮                   │
│ │ IN │  INTERNORY        │
│ ╰────╯  Computer · Rwanda│
│   “Internships, rebuilt” │
│   [ 🌐 Visit website ]   │
└──────────────────────────┘
```

---

## Direction C — "Build sheet"

The form collapses to a dense list of labelled rows — each one a tap target showing its current
value or a placeholder. Every row opens a bottom sheet to edit. The preview lives *above* the
list and you **pull it down** to expand it, like a drawer, with the list scrolling under.

Fewest taps to scan what is left to fill, and the most native-feeling gesture language. But it is
also the furthest from Mpuza: a page of chevron rows reads like iOS Settings, and the brief
explicitly rules out Apple-clone styling. It also hides every input behind a sheet, which is a lot
of ceremony for a field as trivial as "Name".

```
┌──────────────────────────┐
│ ╭────────╮               │
│ │ Create │  Preview      │
│ ╰────────╯               │
│ ▓▓▓ (IN) INTERNORY  ▼ ▓▓ │  ← drag down to expand
├──────────────────────────┤
│ Logo          ( IN )   › │
│ Name          INTERNORY › │
│ Website       intern-… › │
│ Industry      Computer › │
│ Location      Rwanda   › │
│ Slogan        —        › │
│ Company type  no profit› │
│ Description   —        › │
├──────────────────────────┤
│ [     Create page     ]  │
└──────────────────────────┘
```

---

## Recommendation

**Direction B.** It is the only one of the three that preserves what the desktop page actually
does — show the company page assembling itself as you type — rather than just reorganising the
fields. A and C both demote the preview to a destination; B keeps it as the subject.

Everything the brief asks for still lands in B: the springing segmented pill, bottom sheets with
search and snap-to-dismiss for Industry / Location / Company type, the sticky action bar with a
progress hairline over `env(safe-area-inset-bottom)`, the success moment handing off to the
company page with its blue tab rail and Company Overview sheet.

Implemented in `src/routes/CreateCompanyPage.tsx`.

---

## The Mpuza Island

**PROPOSED.** Added after the first review. The idea is borrowed from the way the iPhone's
Dynamic Island fused two separate hardware cutouts into one surface that changes shape to suit
whatever it currently has to say. Nothing about the *look* is borrowed — it is navy `#0e314c`,
Outfit, 6px-family radii and Mpuza's blue.

On this page, six separate things were all competing to tell you about the same one state:

| Was | Now |
| --- | --- |
| The logo avatar, sitting in the form | fused with ↓ |
| A progress hairline above the action bar | drawn as a ring **around** that avatar |
| A "4 of 6" counter | the island's headline |
| No next-step guidance at all | "Next: description", in the island |
| A "Create page" button in a sticky bar | inside the island |
| A full-screen Loading overlay | the island morphs to a compact pill |
| A success toast on the next page | the island morphs to the success pill, then hands off |

**Three states, one object:**

```
idle, collapsed                   ← tap the left side to expand
┌───────────────────────────────────────────┐
│ ╭────╮                                    │
│ │◜IN◞│  4 of 6              [Create page] │   ring = completion
│ ╰────╯  Next: description                 │
└───────────────────────────────────────────┘

idle, expanded                    ← grows upward, never pushes the page
┌───────────────────────────────────────────┐
│  ✓ Logo                                   │
│  ✓ Name                                   │
│  ✓ Website                                │
│  ○ Industry                               │
│  ○ Location                               │
│  ○ Description                            │
│ ╭────╮                                    │
│ │◜IN◞│  3 of 6              [Create page] │
│ ╰────╯  Next: industry                    │
└───────────────────────────────────────────┘

working                 done
   ╭──────────────────╮    ╭──────────────────────╮
   │ ● Creating your… │ →  │ ✓ INTERNORY is live  │
   ╰──────────────────╯    ╰──────────────────────╯
```

**Why it is at the bottom.** It is the commit surface, and the commit surface belongs in the thumb
zone. It sits above `env(safe-area-inset-bottom)` and grows upward so it never reflows the form
under your finger.

**Reduced motion.** Every shape change becomes an instant swap: no spring, no height animation,
no ring tween, no ping on the working dot. The state changes are still announced, because each
transient state carries `role="status"` and `aria-live="polite"`.

**Honest cost.** It is the single most non-Mpuza thing in this build. It earns its place by
deleting five elements rather than adding a sixth, but if you want it gone, deleting
`components/ui/Island.tsx` and restoring `ActionBar` + `LoadingOverlay` + `Toast` is a contained
change — those three components still exist and are still exercised in the style guide.
