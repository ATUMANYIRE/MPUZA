import { useState } from 'react';
import { Avatar } from '../components/ui/Avatar';
import { Button, type ButtonVariant } from '../components/ui/Button';
import { Checkbox, SelectField, TextArea, TextField } from '../components/ui/Field';
import { LoadingOverlay, Toast } from '../components/ui/Feedback';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Segmented } from '../components/ui/Segmented';
import { Island } from '../components/ui/Island';
import { RingIcon } from '../components/ui/RingIcon';
import { PebbleButton } from '../components/ui/PebbleButton';
import { ActivityOrb } from '../components/shell/ActivityOrb';
import { ArrowLeft, Bell, Briefcase, MessageCircle, Star, X } from 'lucide-react';
import {
  DEMO_COUNTS,
  activityLabel,
  categoryDots,
  totalUnread,
  unreadRatio,
  type ActivityCounts,
} from '../mocks/activity';
import { UploadZone } from '../components/ui/UploadZone';
import { ActionBar } from '../components/ui/ActionBar';
import { contrast, readToken } from '../lib/contrast';
import { cx } from '../lib/cx';
import { INDUSTRIES } from '../lib/draft';

/**
 * Dev-only living style guide. Every swatch reads its value back out of the
 * cascade at runtime, so this page cannot drift from tokens.css — if a token
 * changes, the hex and the contrast ratio here change with it.
 */

const COLOR_GROUPS: Array<{ group: string; tokens: Array<[string, string]> }> = [
  {
    group: 'Brand',
    tokens: [
      ['--color-primary', 'Fills, icons, underlines, slogan, banner, accordion headers'],
      ['--color-primary-hover', 'Hover on primary fills'],
      ['--color-primary-text', 'Selected tab label only — the one place Mpuza uses a darker blue'],
      ['--color-primary-text-hover', 'Hover on the darker blue'],
      ['--color-brand', '"Any feedback?", wordmark, notification dot, danger'],
      ['--color-brand-hover', 'Hover on brand red'],
    ],
  },
  {
    group: 'Surfaces',
    tokens: [
      ['--color-canvas', 'The app background behind every card'],
      ['--color-surface', 'Cards, panels, inputs, sheets'],
      ['--color-surface-subtle', 'Upload zone, inset areas'],
      ['--color-surface-tint', 'Active / expanded, hover on light buttons'],
      ['--color-surface-sunken', '104px avatar fill'],
      ['--color-surface-sunken-strong', '72px avatar fill, segmented track'],
    ],
  },
  {
    group: 'Text',
    tokens: [
      ['--color-text', 'Headings, company name, initials'],
      ['--color-text-heading-alt', 'Accordion titles'],
      ['--color-text-body', 'Description, tagline'],
      ['--color-text-secondary', 'Industry · Location'],
      ['--color-text-muted', 'Helper text, subtitles'],
      ['--color-text-placeholder', 'Placeholders, separator dots'],
    ],
  },
  {
    group: 'Lines & status',
    tokens: [
      ['--color-border', 'Card and section borders'],
      ['--color-border-input', 'Input borders'],
      ['--color-border-cool', 'Tab rail divider, accordion border'],
      ['--color-border-dashed', 'Upload zone dashed border'],
      ['--color-danger', 'Destructive actions'],
      ['--color-success', 'Positive chips'],
      ['--color-focus', 'Focus ring (an addition — Mpuza ships none)'],
    ],
  },
];

const TYPE_SCALE: Array<[string, string, string]> = [
  ['text-display', 'Create company page', '1.35rem / 800'],
  ['text-title', 'INTERNORY', '1.25rem / 800'],
  ['text-title-sm', 'INTERNORY (≤768px)', '1.05rem / 800'],
  ['text-section', 'Company Overview', '1rem / 700'],
  ['text-bar-title', 'Page preview', '0.95rem / 700'],
  ['text-body', 'Internory is the enterprise platform…', '0.9rem / 400'],
  ['text-meta', 'Computer Software · Rwanda', '0.875rem / 400'],
  ['text-chip', 'Any feedback?', '0.82rem / 600'],
  ['text-bar-sub', 'Fill the form to see it live', '0.78rem / 400'],
  ['text-tab', 'Shortlisting', '0.8125rem / 600'],
];

const ISLAND_CHECKS = [
  { label: 'Logo', done: true },
  { label: 'Name', done: true },
  { label: 'Website', done: false },
  { label: 'Industry', done: false },
  { label: 'Location', done: false },
  { label: 'Description', done: false },
];

export const StyleGuide = () => {
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [checked, setChecked] = useState(true);
  const [seg, setSeg] = useState<'create' | 'preview'>('create');
  const [counts, setCounts] = useState<ActivityCounts>(DEMO_COUNTS);

  return (
    <div className="min-h-dvh-safe bg-canvas pb-20">
      <header className="border-b border-line-cool bg-surface px-gutter py-5">
        <h1 className="text-display font-extrabold tracking-heading text-text">
          Mpuza style guide
        </h1>
        <p className="mt-1 text-meta text-text-muted">
          Every value below is read back out of <code>tokens.css</code> at runtime. Measured
          provenance lives in <code>docs/design-language.md</code>.
        </p>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-gutter py-6">
        {COLOR_GROUPS.map(({ group, tokens }) => (
          <Block key={group} title={`Color — ${group}`}>
            <div className="flex flex-col gap-2">
              {tokens.map(([token, usage]) => (
                <Swatch key={token} token={token} usage={usage} />
              ))}
            </div>
          </Block>
        ))}

        <Block title="Type scale — Outfit 300–800">
          <div className="flex flex-col gap-4">
            {TYPE_SCALE.map(([cls, sample, spec]) => (
              <div key={cls} className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-3">
                  <code className="shrink-0 text-bar-sub text-text-muted">{cls}</code>
                  <span className="text-bar-sub text-text-placeholder">{spec}</span>
                </div>
                <p className={cx(cls, 'font-bold tracking-heading text-text')}>{sample}</p>
              </div>
            ))}
            <div className="rounded-md bg-surface-subtle p-3 text-bar-sub text-text-muted">
              Body tracking is <code>-0.025em</code> — Mpuza inherits −0.4px onto 204 elements of
              its home page. It is the loudest thing about their type.
            </div>
          </div>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-col gap-4">
            {(['primary', 'secondary', 'outline', 'destructive', 'ghost'] as ButtonVariant[]).map(
              (v) => (
                <div key={v} className="flex flex-wrap items-center gap-2">
                  <code className="w-24 shrink-0 text-bar-sub text-text-muted">{v}</code>
                  <Button variant={v}>Create page</Button>
                  <Button variant={v} size="sm">
                    Small
                  </Button>
                  <Button variant={v} loading>
                    Loading
                  </Button>
                  <Button variant={v} disabled>
                    Disabled
                  </Button>
                </div>
              ),
            )}
            <PrimaryFillNote />
          </div>
        </Block>

        <Block title="Inputs">
          <div className="flex flex-col gap-4">
            <TextField label="Empty" placeholder="Type company name…" />
            <TextField label="Filled" defaultValue="INTERNORY" />
            <TextField label="With hint" placeholder="mpuza.com" hint="Include https://" />
            <TextField label="Error" defaultValue="not a url" error="Enter a valid website." />
            <TextField label="Disabled" placeholder="Company Website…" disabled />
            <SelectField
              label="Select (opens a sheet)"
              value={null}
              placeholder="Select industry…"
              onOpen={() => setSheet(true)}
            />
            <SelectField
              label="Select — filled"
              value="Computer Software"
              placeholder="Select industry…"
              onOpen={() => setSheet(true)}
            />
            <TextArea label="Textarea" placeholder="What does your company do?" rows={3} />
            <div className="flex flex-col gap-2">
              <Checkbox label="Checked" checked={checked} onChange={setChecked} />
              <Checkbox label="Unchecked" checked={false} onChange={() => {}} />
              <Checkbox label="Disabled" checked={false} disabled onChange={() => {}} />
            </div>
          </div>
        </Block>

        <Block title="Upload zone & avatars">
          <div className="flex flex-col gap-5">
            <UploadZone initials="?" imageUrl={null} onFile={() => {}} />
            <UploadZone initials="IN" imageUrl={null} onFile={() => {}} />
            <div className="flex flex-wrap items-end gap-5">
              <Figure label="lg · 104px · “?”">
                <Avatar initials="?" size="lg" animateInitials={false} />
              </Figure>
              <Figure label="lg · initials">
                <Avatar initials="IN" size="lg" animateInitials={false} />
              </Figure>
              <Figure label="lg · image">
                <Avatar initials="IN" src="/logo.png" size="lg" />
              </Figure>
              <Figure label="md · 72px">
                <Avatar initials="IN" size="md" animateInitials={false} />
              </Figure>
              <Figure label="sm · 44px">
                <Avatar initials="IN" size="sm" animateInitials={false} />
              </Figure>
            </div>
          </div>
        </Block>

        <Block title="Segmented control">
          <Segmented
            aria-label="Demo"
            value={seg}
            onChange={setSeg}
            options={[
              { value: 'create', label: 'Create' },
              { value: 'preview', label: 'Preview' },
            ]}
          />
          <p className="mt-3 text-bar-sub text-text-muted">
            The pill springs. Mpuza ships no spring easing anywhere — this is proposed, not
            observed.
          </p>
        </Block>

        <Block title="Bottom sheet, toast, loading overlay">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setSheet(true)}>
              Open sheet
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setToast(true);
                window.setTimeout(() => setToast(false), 2200);
              }}
            >
              Show toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                window.setTimeout(() => setLoading(false), 1600);
              }}
            >
              Show loading
            </Button>
          </div>
        </Block>

        <Block title="Motion tokens">
          <div className="flex flex-col gap-3">
            {[
              ['--duration-fast', '150ms', 'duration-fast', 'measured'],
              ['--duration-base', '200ms', 'duration-base', 'measured — the dominant duration'],
              ['--duration-slow', '300ms', 'duration-slow', 'measured'],
            ].map(([token, val, cls, note]) => (
              <div key={token} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex min-w-0 items-baseline gap-2 sm:w-56 sm:shrink-0">
                  <code className="truncate text-bar-sub text-text-muted">{token}</code>
                  <span className="shrink-0 text-bar-sub text-text-placeholder">{val}</span>
                </div>
                <span
                  className={cx(
                    'group h-8 flex-1 cursor-pointer rounded-md bg-surface-sunken',
                    'relative overflow-hidden',
                  )}
                >
                  <span
                    className={cx(
                      'absolute inset-y-0 left-0 w-8 rounded-md bg-primary',
                      'transition-transform ease-default',
                      cls,
                      'group-hover:translate-x-[calc(100%*3)]',
                    )}
                  />
                </span>
                <span className="min-w-0 text-bar-sub text-text-placeholder sm:w-48 sm:shrink-0">
                  {note}
                </span>
              </div>
            ))}
            <p className="rounded-md bg-surface-subtle p-3 text-bar-sub text-text-muted">
              Every animation in this build has a non-moving fallback under{' '}
              <code>prefers-reduced-motion: reduce</code>.
            </p>
          </div>
        </Block>

        <Block title="Ring icons">
          <div className="flex flex-col gap-6">
            <Row label="Sizes · sm / md / lg">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <Figure key={s} label={s}>
                  <RingIcon icon={Bell} progress={0.6} size={s} label={`Bell ${s}`} />
                </Figure>
              ))}
            </Row>

            <Row label="Tones">
              {(['primary', 'brand', 'neutral'] as const).map((t) => (
                <Figure key={t} label={t}>
                  <RingIcon icon={Bell} progress={0.6} tone={t} label={`Bell ${t}`} />
                </Figure>
              ))}
            </Row>

            <Row label="Progress">
              {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                <Figure key={p} label={`${p * 100}%`}>
                  <RingIcon icon={Bell} progress={p} label={`Progress ${p}`} />
                </Figure>
              ))}
            </Row>

            <Row label="Dots">
              {[0, 1, 3].map((a) => (
                <Figure key={a} label={`${a} / 3`}>
                  <RingIcon
                    icon={Bell}
                    progress={0.5}
                    dots={{ total: 3, active: a }}
                    label={`Dots ${a} of 3`}
                  />
                </Figure>
              ))}
            </Row>

            <Row label="Badges · capped at 9+">
              {[1, 9, 10, 250].map((b) => (
                <Figure key={b} label={String(b)}>
                  <RingIcon icon={Bell} progress={0.8} badge={b} label={`Badge ${b}`} />
                </Figure>
              ))}
            </Row>

            <Row label="Glyphs">
              {([
                [Bell, 'Notifications'],
                [Briefcase, 'Jobs'],
                [Star, 'Saved'],
              ] as const).map(([I, name]) => (
                <Figure key={name} label={name}>
                  <RingIcon icon={I} progress={0.45} dots={{ total: 3, active: 2 }} label={name} />
                </Figure>
              ))}
            </Row>
          </div>
        </Block>

        <Block title="Activity orb — live control">
          <p className="mb-4 text-bar-sub text-text-muted">
            Dev-only. Demo data from <code>src/mocks/activity.ts</code> — there is no
            notifications API. Change the counts and watch the arc, dots and badge animate.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-6 rounded-md bg-surface-subtle p-4">
              <ActivityOrb counts={counts} />
              <RingIcon
                icon={Bell}
                progress={unreadRatio(counts)}
                dots={{ total: 3, active: categoryDots(counts).filter(Boolean).length }}
                badge={totalUnread(counts)}
                size="lg"
                label={activityLabel(counts)}
              />
              <code className="min-w-0 flex-1 text-bar-sub text-text-muted">
                {activityLabel(counts)}
              </code>
            </div>

            {(
              [
                ['notificationsUnread', 'Unread notifications', counts.notificationsTotal],
                ['notificationsTotal', 'Batch size', 9],
                ['jobsNew', 'New jobs', 9],
                ['savedNew', 'New saved', 9],
              ] as const
            ).map(([key, label, max]) => (
              <label key={key} className="flex items-center gap-3">
                <span className="w-44 shrink-0 text-bar-sub text-text-muted">{label}</span>
                <input
                  type="range"
                  min={0}
                  max={max}
                  value={counts[key]}
                  onChange={(e) =>
                    setCounts((c) => {
                      const next = { ...c, [key]: Number(e.target.value) };
                      // Unread can never exceed the batch it came from.
                      if (next.notificationsUnread > next.notificationsTotal) {
                        next.notificationsUnread = next.notificationsTotal;
                      }
                      return next;
                    })
                  }
                  className="h-tap min-w-0 flex-1 accent-primary"
                />
                <span className="w-8 shrink-0 text-right text-bar-sub tabular-nums text-text">
                  {counts[key]}
                </span>
              </label>
            ))}
          </div>
        </Block>

        <Block title="Pebble buttons">
          <div className="flex flex-wrap items-center gap-4">
            <Figure label="md">
              <PebbleButton label="Back">
                <ArrowLeft size={18} aria-hidden="true" />
              </PebbleButton>
            </Figure>
            <Figure label="lg">
              <PebbleButton label="Close" size="lg">
                <X size={20} aria-hidden="true" />
              </PebbleButton>
            </Figure>
            <Figure label="accent">
              <PebbleButton label="Messaging" size="lg" tone="accent">
                <MessageCircle size={20} aria-hidden="true" />
              </PebbleButton>
            </Figure>
            <Figure label="disabled">
              <PebbleButton label="Disabled" disabled>
                <X size={18} aria-hidden="true" />
              </PebbleButton>
            </Figure>
          </div>
        </Block>

        <Block title="Mpuza Island — the three states">
          <p className="mb-4 text-bar-sub text-text-muted">
            One object replacing six: the logo avatar, the completion ring, the step counter, the
            next-step hint, the Create page button, and both transient states (loading overlay and
            success toast). It is anchored in the thumb zone and grows upward. Entirely{' '}
            <strong>proposed</strong> — Mpuza has nothing like it.
          </p>
          <div className="flex flex-col gap-3">
            {(
              [
                ['idle · 2 of 6', 'idle', false],
                ['idle · expanded', 'idle', true],
                ['working', 'working', false],
                ['done', 'done', false],
              ] as const
            ).map(([label, st, exp]) => (
              <div key={label} className="flex flex-col gap-1.5">
                <code className="text-bar-sub text-text-muted">{label}</code>
                <div className="relative h-56 overflow-hidden rounded-md bg-canvas">
                  <Island
                    state={st}
                    expanded={exp}
                    onToggle={() => {}}
                    initials="IN"
                    logoUrl={null}
                    checks={ISLAND_CHECKS}
                    nextHint="Next: industry"
                    canSubmit
                    onSubmit={() => {}}
                    doneLabel="INTERNORY is live"
                    inline
                  />
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Sticky action bar">
          <div className="overflow-hidden rounded-md border border-line-cool">
            <ActionBar progress={0.66} progressLabel="4 of 6">
              <Button>Create page</Button>
            </ActionBar>
          </div>
        </Block>
      </div>

      <BottomSheet
        open={sheet}
        title="Industry"
        options={INDUSTRIES}
        value="Computer Software"
        onSelect={() => {}}
        onClose={() => setSheet(false)}
      />
      <Toast open={toast} message="INTERNORY is live 🎉" />
      <LoadingOverlay open={loading} />
    </div>
  );
};

/**
 * Reads both blues and both ratios out of the cascade, so this explanation
 * stays true automatically if a token is ever retuned.
 */
const PrimaryFillNote = () => {
  const brand = readToken('--color-primary');
  const safe = readToken('--color-primary-text');
  const white = readToken('--color-surface');
  const brandOnWhite = contrast(white, brand);
  const safeOnWhite = contrast(white, safe);

  return (
    <p className="rounded-md bg-surface-subtle p-3 text-bar-sub text-text-muted">
      Every blue surface and label uses <code>--color-primary</code> ({brand}), matching
      mpuza.com exactly. White on it is{' '}
      {brandOnWhite ? `${brandOnWhite.toFixed(2)}:1` : 'below AA'}, which does not meet WCAG AA
      for normal text — a known, requested trade-off. <code>--color-primary-text</code> ({safe}
      {safeOnWhite ? `, ${safeOnWhite.toFixed(2)}:1` : ''}) now appears in exactly one place: the
      selected company tab, where Mpuza itself uses it. See design-language.md §6.
    </p>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <code className="text-bar-sub text-text-muted">{label}</code>
    <div className="flex flex-wrap items-end gap-5">{children}</div>
  </div>
);

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-md bg-surface p-4 shadow-card">
    <h2 className="mb-4 text-section font-bold tracking-heading text-text">{title}</h2>
    {children}
  </section>
);

const Figure = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-2">
    {children}
    <span className="text-bar-sub text-text-muted">{label}</span>
  </div>
);

const Swatch = ({ token, usage }: { token: string; usage: string }) => {
  const value = readToken(token);
  const onWhite = contrast(value, readToken('--color-surface'));
  const onCanvas = contrast(value, readToken('--color-canvas'));

  return (
    <div className="flex items-center gap-3 rounded-md border border-line p-2">
      <span
        className="h-10 w-10 shrink-0 rounded-md border border-line"
        style={{ background: `var(${token})` }}
        aria-hidden="true"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <code className="truncate text-bar-sub font-bold text-text">{token}</code>
        <span className="truncate text-bar-sub text-text-muted">{usage}</span>
      </span>
      <span className="shrink-0 text-right">
        <code className="block text-bar-sub text-text-secondary">{value}</code>
        <span className="block text-bar-sub text-text-placeholder">
          <Ratio r={onWhite} label="surface" /> <Ratio r={onCanvas} label="canvas" />
        </span>
      </span>
    </div>
  );
};

const Ratio = ({ r, label }: { r: number | null; label: string }) =>
  r === null ? null : (
    <span className={cx('tabular-nums', r >= 4.5 ? 'text-success' : 'text-text-placeholder')}>
      {label} {r.toFixed(2)}
      {r >= 4.5 ? ' AA' : ''}{' '}
    </span>
  );
