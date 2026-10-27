import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/shell/AppHeader';
import { MessagingPebble } from '../components/shell/MessagingPebble';
import { CompanyPreview } from '../components/company/CompanyPreview';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Checkbox, SelectField, TextArea, TextField } from '../components/ui/Field';
import { Island, type IslandState } from '../components/ui/Island';
import { SectionCard } from '../components/ui/SectionCard';
import { Segmented } from '../components/ui/Segmented';
import { UploadZone } from '../components/ui/UploadZone';
import { initialsFor } from '../components/ui/Avatar';
import { useMediaQuery } from '../lib/useMediaQuery';
import { cx } from '../lib/cx';
import { HandleField } from '../components/company/HandleField';
import { BrandColorChip } from '../components/company/BrandColorChip';
import { computeStrength } from '../lib/strength';
import {
  COMPANY_TYPES,
  INDUSTRIES,
  LOCATIONS,
  canSubmit,
  emptyDraft,
  type CompanyDraft,
} from '../lib/draft';

type Sheet = 'industry' | 'location' | 'companyType' | null;
type View = 'create' | 'preview';

/**
 * Direction B, "Living hero" — docs/design-directions.md — rebuilt around the
 * Mpuza Island (components/ui/Island.tsx) and the landing page's editorial
 * register: uppercase eyebrows, 800-weight numerals and 3px rules that cycle
 * blue → navy → red.
 */
export const CreateCompanyPage = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState<CompanyDraft>(emptyDraft);
  const [view, setView] = useState<View>('create');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [islandState, setIslandState] = useState<IslandState>('idle');
  const [islandOpen, setIslandOpen] = useState(false);

  // Above 1024px the form and preview sit side by side, so there is nothing to
  // switch between — the form is always the active pane.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const activeView: View = isDesktop ? 'create' : view;

  const set = useCallback(
    <K extends keyof CompanyDraft>(key: K, value: CompanyDraft[K]) =>
      setDraft((d) => ({ ...d, [key]: value })),
    [],
  );

  const strength = computeStrength(draft, draft.handle);
  const ready = canSubmit(draft);

  const onFile = useCallback((file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDraft((d) => ({ ...d, logoUrl: url }));
  }, []);

  useEffect(
    () => () => {
      if (draft.logoUrl) URL.revokeObjectURL(draft.logoUrl);
    },
    [draft.logoUrl],
  );

  const submit = () => {
    setIslandState('working');
    window.setTimeout(() => setIslandState('done'), 1400);
    window.setTimeout(() => navigate('/company', { state: draft }), 2500);
  };

  return (
    <div className="flex min-h-dvh-safe flex-col bg-canvas">
      <AppHeader />

      <LayoutGroup>
        <main
          className={cx(
            'mx-auto flex w-full max-w-2xl flex-1 flex-col',
            'lg:max-w-6xl lg:flex-row lg:items-start lg:gap-8 lg:px-gutter-lg',
          )}
        >
          <div className="flex w-full min-w-0 flex-col lg:flex-1">
            {/* Editorial masthead, in Mpuza's own landing-page voice. */}
            <header className="px-gutter pb-1 pt-6 lg:px-0">
              <p className="text-eyebrow font-bold uppercase tracking-eyebrow text-primary">
                Company page
              </p>
              <h1 className="mt-2 text-hero font-extrabold tracking-display text-text">
                Build your
                <br />
                company page.
              </h1>
              <p className="mt-3 max-w-md text-body leading-body text-accent-text">
                Fill in the details — the preview updates as you type.
              </p>
            </header>

            <div className="sticky top-14 z-sticky bg-canvas px-gutter py-3 lg:hidden">
              <Segmented
                aria-label="Create or preview"
                value={view}
                onChange={(v) => setView(v)}
                options={[
                  { value: 'create', label: 'Create' },
                  { value: 'preview', label: 'Preview' },
                ]}
              />
            </div>

            {/* The living hero. Hidden on desktop, where the full preview has
                its own pinned column. */}
            <div className="px-gutter pb-4 lg:hidden">
              <CompanyPreview draft={draft} variant={activeView === 'preview' ? 'full' : 'strip'} />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {activeView === 'create' ? (
                <motion.div
                  key="form"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-4 px-gutter pb-44 lg:px-0 lg:pt-2"
                >
                  <SectionCard index="01" eyebrow="Identity" title="Company logo" tone="primary">
                    <UploadZone
                      initials={initialsFor(draft.name)}
                      imageUrl={draft.logoUrl}
                      onFile={onFile}
                    />
                    <BrandColorChip
                      logoUrl={draft.logoUrl}
                      applied={draft.brandColor}
                      onApply={(c) =>
                        setDraft((d) => ({
                          ...d,
                          brandColor: c?.hex ?? null,
                          brandOnColor: c?.onHex ?? null,
                        }))
                      }
                    />
                  </SectionCard>

                  <SectionCard
                    index="02"
                    eyebrow="The basics"
                    title="Company identification"
                    tone="accent"
                  >
                    <TextField
                      label="Name"
                      placeholder="Type company name…"
                      value={draft.name}
                      onChange={(e) => set('name', e.target.value)}
                      autoComplete="organization"
                    />
                    <HandleField
                      value={draft.handle}
                      companyName={draft.name}
                      onChange={(v) => set('handle', v)}
                    />
                    <TextField
                      label="Website (Ex: mpuza.com)"
                      placeholder="Company Website…"
                      value={draft.website}
                      disabled={draft.noWebsite}
                      onChange={(e) => set('website', e.target.value)}
                      inputMode="url"
                      autoComplete="url"
                    />
                    <Checkbox
                      label={<em>No website</em>}
                      checked={draft.noWebsite}
                      onChange={(v) => set('noWebsite', v)}
                    />
                  </SectionCard>

                  <SectionCard
                    index="03"
                    eyebrow="Tell your story"
                    title="Profile details"
                    tone="brand"
                  >
                    <SelectField
                      label="Industry"
                      value={draft.industry}
                      placeholder="Select industry…"
                      onOpen={() => setSheet('industry')}
                    />
                    <SelectField
                      label="Location"
                      value={draft.location}
                      placeholder="Select company location…"
                      onOpen={() => setSheet('location')}
                    />
                    <TextField
                      label="Slogan"
                      placeholder="Slogan…"
                      value={draft.slogan}
                      onChange={(e) => set('slogan', e.target.value)}
                    />
                    <SelectField
                      label="Company type"
                      value={draft.companyType}
                      placeholder="Select company type…"
                      onOpen={() => setSheet('companyType')}
                    />
                    <TextArea
                      label="Description"
                      placeholder="What does your company do?"
                      value={draft.description}
                      onChange={(e) => set('description', e.target.value)}
                      rows={4}
                    />
                  </SectionCard>
                </motion.div>
              ) : (
                <motion.p
                  key="preview-note"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-gutter pb-44 text-center text-meta text-text-muted"
                >
                  This is how your page will look. Switch back to Create to keep editing.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop only: the preview column from the real page, pinned so it
              stays in view while the form scrolls past it. */}
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:w-[26rem] lg:shrink-0 lg:pt-6">
            <CompanyPreview draft={draft} variant="full" />
          </aside>
        </main>
      </LayoutGroup>

      <Island
        state={islandState}
        expanded={islandOpen}
        onToggle={() => setIslandOpen((v) => !v)}
        initials={initialsFor(draft.name)}
        logoUrl={draft.logoUrl}
        checks={strength.factors.map((f) => ({
          label: f.label,
          done: f.score >= 1,
          score: f.score,
          tip: f.tip,
        }))}
        ratio={strength.ratio}
        headline={`${strength.score}% · ${strength.bandLabel}`}
        nextHint={strength.nextBest ? `Next: ${strength.nextBest.label.toLowerCase()}` : null}
        canSubmit={ready}
        onSubmit={submit}
        doneLabel={`${draft.name || 'Your page'} is live`}
      />

      <MessagingPebble />

      <BottomSheet
        open={sheet === 'industry'}
        title="Industry"
        searchPlaceholder="Search industries…"
        options={INDUSTRIES}
        value={draft.industry}
        onSelect={(v) => set('industry', v)}
        onClose={() => setSheet(null)}
      />
      <BottomSheet
        open={sheet === 'location'}
        title="Location"
        searchPlaceholder="Search locations…"
        options={LOCATIONS}
        value={draft.location}
        onSelect={(v) => set('location', v)}
        onClose={() => setSheet(null)}
      />
      <BottomSheet
        open={sheet === 'companyType'}
        title="Company type"
        searchPlaceholder="Search company types…"
        options={COMPANY_TYPES}
        value={draft.companyType}
        onSelect={(v) => set('companyType', v)}
        onClose={() => setSheet(null)}
      />
    </div>
  );
};
