import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Avatar, initialsFor } from '../ui/Avatar';
import { cx } from '../../lib/cx';
import type { CompanyDraft } from '../../lib/draft';

const COVER = '/covers/vn2.jpeg';

/**
 * The live preview from the real page. Measured:
 *   .mpuza-company-preview  white, radius .375rem, 0 4px 18px rgba(15,23,42,.08)
 *   .mpuza-company-preview-bar  linear-gradient(180deg,#f8fafc,#fff), 1px #e5e7eb
 *   .mpuza-company-cover  min-height 200px (160px ≤767px)
 *   .mpuza-company-identity  margin-top -3.25rem
 *   .mpuza-company-title  1.25rem/800 (1.05rem ≤768px), #111827
 *   .mpuza-company-meta  .875rem #4b5563, placeholder dot #9ca3af
 *   .mpuza-company-tagline  .9rem/1.45 #374151
 *   .mpuza-company-slogan  .9rem italic #35a8df, shown in curly quotes
 *   .mpuza-company-website-btn  #35a8df, radius .375rem, min-height 2.5rem
 *
 */

interface PreviewProps {
  draft: CompanyDraft;
  /** 'strip' is the pinned hero in Create view; 'full' is the Preview tab. */
  variant: 'strip' | 'full';
}

export const CompanyPreview = ({ draft, variant }: PreviewProps) => {
  const reduce = useReducedMotion();
  const initials = initialsFor(draft.name);
  const hasName = draft.name.trim().length > 0;
  const full = variant === 'full';

  const spring = reduce
    ? { duration: 0 }
    : ({ type: 'spring', stiffness: 300, damping: 34, mass: 0.8 } as const);

  return (
    <motion.article
      layout
      transition={spring}
      className="overflow-hidden rounded-md bg-surface shadow-card"
      aria-label="Company page preview"
    >
      {full && (
        <motion.header
          layout="position"
          transition={spring}
          className="flex items-center gap-3 border-b border-line bg-gradient-to-b from-surface-subtle to-surface px-4 py-3.5"
        >
          <PreviewGlyph />
          <span className="flex min-w-0 flex-col">
            <span className="text-bar-title font-bold leading-tight text-text">Page preview</span>
            <span className="truncate text-bar-sub text-text-muted">
              {hasName ? draft.name : 'Fill the form to see it live'}
            </span>
          </span>
        </motion.header>
      )}

      {/* Cover. Grows 64 → 160px between strip and full. When a brand colour
          has been pulled from the logo, it washes the cover so the preview
          reads as the company's rather than as Mpuza's. */}
      <motion.div
        layout
        transition={spring}
        className="relative w-full bg-surface-sunken"
        style={{ height: full ? 160 : 64 }}
      >
        <img src={COVER} alt="" className="h-full w-full object-cover" />
        {draft.brandColor && (
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 mix-blend-multiply"
            style={{ background: draft.brandColor, opacity: 0.45 }}
          />
        )}
      </motion.div>

      {/*
        Measured: at ≤768px Mpuza stacks this block —
          .mpuza-company-identity { flex-direction: column; align-items: flex-start }
          .mpuza-company-identity-main, .mpuza-company-website-btn
            { padding-top: 0; margin-top: .75rem }
        so the avatar gets its own line and the text runs full width beneath it.
        Above 768px it returns to a row with the text offset past the avatar.
      */}
      <div
        className={cx(
          'relative px-4 pb-4',
          full ? '-mt-12 flex flex-col md:flex-row md:gap-4' : '-mt-6 flex gap-3',
        )}
      >
        <motion.div layout transition={spring} className="z-sticky shrink-0">
          <Avatar initials={initials} src={draft.logoUrl} size={full ? 'lg' : 'sm'} />
        </motion.div>

        <motion.div
          layout="position"
          transition={spring}
          className={cx(
            'flex min-w-0 flex-1 flex-col',
            full ? 'mt-3 md:mt-0 md:pt-14' : 'pt-7',
          )}
        >
          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <PreviewTitle name={draft.name} full={full} />
              <PreviewMeta industry={draft.industry} location={draft.location} />
            </div>

            {full && draft.website && !draft.noWebsite && (
              <motion.a
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={spring}
                href={draft.website}
                onClick={(e) => e.preventDefault()}
                className={cx(
                  'inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 md:w-auto',
                  'rounded-md px-4 text-meta font-semibold',
                  'transition-colors duration-fast ease-default',
                  !draft.brandColor && 'bg-primary text-text-on-primary hover:bg-primary-hover',
                )}
                style={
                  draft.brandColor
                    ? { background: draft.brandColor, color: draft.brandOnColor ?? undefined }
                    : undefined
                }
              >
                <GlobeGlyph />
                Visit website
              </motion.a>
            )}
          </div>

          {full && (
            <>
              <AnimatePresence mode="popLayout">
                {draft.description.trim() && (
                  <motion.p
                    key="desc"
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={spring}
                    className="mt-2.5 whitespace-pre-wrap text-body leading-body text-text-body"
                  >
                    {draft.description}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {draft.slogan.trim() && (
                  <motion.p
                    key="slogan"
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={spring}
                    className="mt-1.5 text-body italic leading-slogan text-primary"
                  >
                    {`“${draft.slogan}”`}
                  </motion.p>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </motion.article>
  );
};

/** Crossfades placeholder → real value as the field fills in. */
const PreviewTitle = ({ name, full }: { name: string; full: boolean }) => {
  const reduce = useReducedMotion();
  const has = name.trim().length > 0;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.h3
        key={has ? 'real' : 'placeholder'}
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className={cx(
          'font-extrabold leading-title tracking-heading',
          // The strip is one line and may ellipsise; the full card must never
          // clip the company's own name.
          full ? 'text-title break-words' : 'text-title-sm truncate',
          has ? 'text-text' : 'text-text-placeholder',
        )}
      >
        {has ? name : 'Your company name'}
      </motion.h3>
    </AnimatePresence>
  );
};

const PreviewMeta = ({
  industry,
  location,
}: {
  industry: string | null;
  location: string | null;
}) => {
  const reduce = useReducedMotion();
  const parts = [industry, location].filter(Boolean) as string[];
  const empty = parts.length === 0;
  return (
    <p
      className={cx(
        'mt-1 flex flex-wrap items-center gap-1.5 text-meta',
        empty ? 'text-text-placeholder' : 'text-text-secondary',
      )}
    >
      {empty ? (
        <span>Industry · Location</span>
      ) : (
        parts.map((part, i) => (
          <motion.span
            key={part}
            initial={reduce ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5"
          >
            {/* Keep the separator glued to the value it follows, so a wrap
                never strands a lone "·" at the start of a line. */}
            {i > 0 && <span aria-hidden="true" className="text-text-placeholder">·</span>}
            <span className="whitespace-nowrap">{part}</span>
          </motion.span>
        ))
      )}
    </p>
  );
};

const PreviewGlyph = () => (
  <svg className="h-6 w-6 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 9h18M9 9v11" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const GlobeGlyph = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M3 12h18M12 3c2.5 2.8 2.5 15.2 0 18-2.5-2.8-2.5-15.2 0-18Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);
