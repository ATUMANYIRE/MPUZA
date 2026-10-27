import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/shell/AppHeader';
import { MessagingPebble } from '../components/shell/MessagingPebble';
import { Avatar, initialsFor } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ChevronDown, SelectField, TextField } from '../components/ui/Field';
import { BottomSheet } from '../components/ui/BottomSheet';
import { cx } from '../lib/cx';
import { emptyDraft, type CompanyDraft } from '../lib/draft';

const COVER = '/covers/vn2.jpeg';
const TABS = ['Jobs', 'Projects', 'Shortlisting', 'Employees', 'Settings', 'Update'] as const;
const SIZES = ['1–10', '11–50', '51–200', '201–500', '501–1,000', '1,001+'] as const;

/**
 * The page the create flow hands off to.
 *
 * Measured and kept: the verification banner and both accordion headers are
 * solid #35a8df with white text (sampled at spread 0); every tab label is
 * blue, the selected one #1d7eae with a 2px #35a8df underline; the tab rail
 * wraps rather than scrolls below 767px.
 *
 * Redesigned: the cover carries a navy legibility wash, the identity block
 * uses the landing page's editorial register, and the success moment is gone
 * from here entirely — the Island already said it before navigating, so
 * repeating it was both redundant and covering the banner.
 */
export const CompanyPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const reduce = useReducedMotion();
  const draft = (state as CompanyDraft | null) ?? emptyDraft;

  const [tab, setTab] = useState<(typeof TABS)[number]>('Jobs');
  const [bannerOpen, setBannerOpen] = useState(true);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [visionOpen, setVisionOpen] = useState(false);
  const [sizeSheet, setSizeSheet] = useState(false);
  const [size, setSize] = useState<string | null>(null);

  const initials = initialsFor(draft.name);
  const parts = [draft.industry, draft.location].filter(Boolean) as string[];

  return (
    <div className="flex min-h-dvh-safe flex-col bg-canvas">
      <AppHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 pb-12 lg:max-w-4xl">
        <AnimatePresence>
          {bannerOpen && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="mx-gutter mt-3 overflow-hidden rounded-md bg-primary"
            >
              <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
                <p className="min-w-0 flex-1 text-meta text-text-on-primary">
                  This platform is based on Trust, let we verify your company in order to Offer any
                  Job
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className={cx(
                      'h-button-sm flex-1 rounded-md bg-surface px-4 text-chip font-bold md:flex-none',
                      'text-primary transition-colors duration-base ease-default hover:bg-surface-tint',
                    )}
                  >
                    Request Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerOpen(false)}
                    className="shrink-0 px-2 py-2 text-chip text-text-on-primary underline-offset-2 hover:underline"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="mx-gutter mt-3 overflow-hidden rounded-md border border-rule border-t-rule border-t-primary bg-surface shadow-card"
        >
          {/* Cover + identity, as one editorial masthead. */}
          <div className="relative h-cover-sm w-full md:h-cover">
            <img src={COVER} alt="" className="h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-cover" />
            {/* pl clears the 104px avatar that rises into this corner
                (16px gutter + 104px + 12px gap). */}
            <div className="absolute inset-x-0 bottom-0 py-4 pl-[8.25rem] pr-4">
              <p className="text-eyebrow font-bold uppercase tracking-eyebrow text-text-on-primary opacity-80">
                Company page
              </p>
              <h1 className="mt-1 break-words text-title font-extrabold tracking-display text-text-on-primary md:text-hero md:leading-hero">
                {draft.name || 'Your company'}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4 pb-4 md:flex-row md:items-end">
            {/* relative + z: the cover above is positioned, so without its own
                stacking context the avatar would paint underneath it. */}
            <Avatar
              initials={initials}
              src={draft.logoUrl}
              size="lg"
              className="relative z-sticky -mt-12 shrink-0 md:-mt-14"
            />
            <div className="min-w-0 flex-1">
              {parts.length > 0 && (
                <p className="flex flex-wrap items-center gap-1.5 text-meta text-text-secondary">
                  {parts.map((part, i) => (
                    <span key={part} className="flex items-center gap-1.5">
                      {i > 0 && (
                        <span aria-hidden="true" className="text-text-placeholder">
                          ·
                        </span>
                      )}
                      <span className="whitespace-nowrap">{part}</span>
                    </span>
                  ))}
                </p>
              )}
            </div>
            <Button variant="primary" size="sm" className="w-full md:w-auto">
              Post a job
            </Button>
          </div>

          {/* Measured: labels all blue, selected #1d7eae + 2px underline, and
              the rail wraps rather than scrolling. */}
          <nav
            aria-label="Company sections"
            className="flex flex-wrap gap-y-1 border-t border-line-cool px-2"
          >
            {TABS.map((t) => {
              const selected = t === tab;
              return (
                <button
                  key={t}
                  type="button"
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => setTab(t)}
                  className={cx(
                    'relative min-h-tap shrink-0 px-3 text-tab font-semibold',
                    'transition-colors duration-base ease-default',
                    selected
                      ? 'font-bold text-primary-text'
                      : 'text-primary hover:text-primary',
                  )}
                >
                  {t}
                  {selected && (
                    <motion.span
                      layoutId="company-tab-underline"
                      className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                      transition={
                        reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }
                      }
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-line-cool p-4">
            {tab === 'Jobs' ? (
              <>
                {draft.description.trim() && (
                  <p className="whitespace-pre-wrap text-body leading-body text-text-body">
                    {draft.description}
                  </p>
                )}
                {draft.slogan.trim() && (
                  <p className="mt-3 border-l-rule border-l-primary pl-3 text-body italic leading-slogan text-primary">
                    {`“${draft.slogan}”`}
                  </p>
                )}
                {!draft.description.trim() && !draft.slogan.trim() && (
                  <p className="py-4 text-meta text-text-muted">
                    Nothing posted yet. Your jobs will show up here.
                  </p>
                )}
              </>
            ) : (
              <p className="py-6 text-center text-meta text-text-muted">{tab} will appear here.</p>
            )}
          </div>
        </motion.section>

        <div className="mx-gutter mt-4 flex flex-col gap-3">
          <Accordion
            index="01"
            title="Company Overview"
            open={overviewOpen}
            onToggle={setOverviewOpen}
          >
            <div className="flex flex-col gap-4">
              <SelectField
                label="Company size"
                value={size}
                placeholder="Select Company size"
                onOpen={() => setSizeSheet(true)}
              />
              <TextField label="Founded in" placeholder="Founded in" />
              <TextField label="Specialities" placeholder="Specialities" />
              <TextField label="Phone Number" placeholder="Phone Number" inputMode="tel" />
              <TextField label="Contact Email" placeholder="Contact Email" inputMode="email" />
              <div>
                <Button size="sm">Save</Button>
              </div>
            </div>
          </Accordion>

          <Accordion index="02" title="Company vision" open={visionOpen} onToggle={setVisionOpen}>
            <p className="text-meta text-text-muted">Describe where your company is heading.</p>
          </Accordion>
        </div>

        <div className="mt-6 px-gutter">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            ← Back to the form
          </Button>
        </div>
      </main>

      <MessagingPebble />

      <BottomSheet
        open={sizeSheet}
        title="Company size"
        options={SIZES}
        value={size}
        onSelect={setSize}
        onClose={() => setSizeSheet(false)}
      />
    </div>
  );
};

/** Measured: solid #35a8df header with a white title, white body beneath. */
const Accordion = ({
  index,
  title,
  open,
  onToggle,
  children,
}: {
  index: string;
  title: string;
  open: boolean;
  onToggle: (next: boolean) => void;
  children: React.ReactNode;
}) => {
  const reduce = useReducedMotion();
  return (
    <section className="overflow-hidden rounded-md bg-surface shadow-sm">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => onToggle(!open)}
          className="flex min-h-tap w-full items-center gap-2.5 bg-primary px-4 text-left"
        >
          <span
            aria-hidden="true"
            className="text-index font-extrabold tracking-index text-text-on-primary opacity-70"
          >
            {index}
          </span>
          <span className="flex-1 text-bar-title font-bold text-text-on-primary">{title}</span>
          <ChevronDown
            className={cx(
              'text-text-on-primary transition-transform duration-base ease-default',
              open ? 'rotate-0' : '-rotate-90',
            )}
          />
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
