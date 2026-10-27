import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { cx } from '../../lib/cx';
import { Avatar } from './Avatar';
import { useOverlayOpen } from '../../lib/overlay';

export type IslandState = 'idle' | 'working' | 'done';

export interface IslandCheck {
  label: string;
  done: boolean;
  /** 0–1. Partial credit shows as a partly-filled dot. */
  score?: number;
  /** Shown under the label when this factor is unfinished. */
  tip?: string;
}

interface IslandProps {
  state: IslandState;
  expanded: boolean;
  onToggle: () => void;
  initials: string;
  logoUrl: string | null;
  checks: IslandCheck[];
  /** 0–1 for the ring. Defaults to the share of checks done. */
  ratio?: number;
  /** Replaces the "n of m" counter, e.g. "68% · Good". */
  headline?: string;
  nextHint: string | null;
  canSubmit: boolean;
  onSubmit: () => void;
  doneLabel: string;
  /** Renders in normal flow instead of pinned to the viewport, for the style guide. */
  inline?: boolean;
}

/**
 * The Mpuza Island.
 *
 * PROPOSED — Mpuza has nothing like this. The idea is borrowed from the way
 * the iPhone's Dynamic Island fused two separate hardware cutouts into one
 * surface that changes shape to suit what it is saying.
 *
 * Here it fuses *six* separate pieces of this page into one object:
 *   the logo avatar · the completion progress ring · the "4 of 6" counter ·
 *   the next-step hint · the Create page button · and both transient states
 *   (the full-screen Loading overlay and the success toast).
 *
 * It lives at the bottom because that is where a thumb is, and it grows
 * upward rather than pushing the page around. Reduced motion gets the same
 * state changes with no geometry animation.
 */
export const Island = ({
  state,
  expanded,
  onToggle,
  initials,
  logoUrl,
  checks,
  ratio,
  headline,
  nextHint,
  canSubmit,
  onSubmit,
  doneLabel,
  inline = false,
}: IslandProps) => {
  const reduce = useReducedMotion();
  const done = checks.filter((c) => c.done).length;
  const fill = ratio ?? (checks.length ? done / checks.length : 0);
  const title = headline ?? `${done} of ${checks.length}`;

  const spring = reduce
    ? { duration: 0 }
    : ({ type: 'spring', stiffness: 400, damping: 36, mass: 0.8 } as const);

  // Collapse the panel whenever the island leaves its resting state.
  useEffect(() => {
    if (!inline && state !== 'idle' && expanded) onToggle();
  }, [inline, state, expanded, onToggle]);

  const compact = state !== 'idle';

  // A sheet comes up from the same edge the island lives on, so rather than
  // stacking on top of it the island drops away while one is open.
  const overlayOpen = useOverlayOpen();
  const hidden = !inline && overlayOpen;

  return (
    <motion.div
      aria-hidden={hidden || undefined}
      initial={false}
      animate={
        hidden
          ? { y: '130%', opacity: 0, pointerEvents: 'none' }
          : { y: 0, opacity: 1, pointerEvents: 'auto' }
      }
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 38 }}
      className={cx(
        'pointer-events-none flex justify-center px-gutter',
        inline
          ? 'absolute inset-x-0 bottom-0'
          : 'fixed inset-x-0 bottom-0 z-actionbar pb-safe',
      )}
    >
      <motion.div
        layout
        transition={spring}
        className={cx(
          'pointer-events-auto mb-3 overflow-hidden bg-primary text-text-on-primary shadow-sheet',
          compact ? 'rounded-full' : 'w-full max-w-xl rounded-2xl',
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {state === 'working' && (
            <motion.div
              key="working"
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={spring}
              role="status"
              aria-live="polite"
              className="flex items-center gap-2.5 px-5 py-3.5"
            >
              <Pulse />
              <span className="whitespace-nowrap text-meta font-semibold">
                Creating your page…
              </span>
            </motion.div>
          )}

          {state === 'done' && (
            <motion.div
              key="done"
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={spring}
              role="status"
              aria-live="polite"
              className="flex items-center gap-2.5 px-5 py-3.5"
            >
              <motion.span
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-primary"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path
                    d="m3.5 8.5 3 3 6-6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.span>
              <span className="whitespace-nowrap text-meta font-semibold">{doneLabel}</span>
            </motion.div>
          )}

          {state === 'idle' && (
            <motion.div key="idle" layout transition={spring}>
              {/* The checklist, which grows the island upward. */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pt-3 text-eyebrow font-bold uppercase tracking-eyebrow opacity-60">
                      Page strength
                    </p>
                    <ul className="flex flex-col gap-0.5 px-3 pb-1 pt-2">
                      {checks.map((c) => {
                        const partial = !c.done && (c.score ?? 0) > 0;
                        return (
                          <li
                            key={c.label}
                            className="flex items-start gap-2.5 rounded-md px-2 py-1.5"
                          >
                            <span
                              aria-hidden="true"
                              className={cx(
                                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                                c.done
                                  ? 'bg-surface text-primary'
                                  : partial
                                    ? 'border-2 border-surface'
                                    : 'border border-on-accent-line',
                              )}
                            >
                              {c.done && (
                                <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5">
                                  <path
                                    d="m3.5 8.5 3 3 6-6.5"
                                    stroke="currentColor"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={cx(
                                  'block text-meta',
                                  c.done ? 'font-semibold' : 'opacity-80',
                                )}
                              >
                                {c.label}
                              </span>
                              {!c.done && c.tip && (
                                <span className="mt-0.5 block text-bar-sub opacity-55">
                                  {c.tip}
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The resting bar. */}
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={onToggle}
                  aria-expanded={expanded}
                  aria-label={`Page strength ${title}. Show what is left.`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-full text-left"
                >
                  <ProgressRing ratio={fill} reduce={Boolean(reduce)}>
                    <Avatar
                      initials={initials}
                      src={logoUrl}
                      size="xs"
                      className="border-0 shadow-none"
                    />
                  </ProgressRing>

                  {/* flex-1 matters: without a basis this column gets squeezed
                      to zero width inside a narrow container. */}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-index font-extrabold tracking-index tabular-nums">
                      {title}
                    </span>
                    <span className="truncate text-bar-sub opacity-70">
                      {nextHint ?? 'Ready to publish'}
                    </span>
                  </span>

                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={spring}
                    className="ml-1 shrink-0 opacity-70"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                      <path
                        d="m4 10 4-4 4 4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.span>
                </button>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className={cx(
                    'h-button shrink-0 rounded-full px-4 text-button font-bold sm:px-5',
                    'transition-colors duration-base ease-default',
                    canSubmit
                      ? 'bg-surface text-primary hover:bg-surface-tint'
                      : 'cursor-not-allowed bg-on-accent-faint text-on-accent-muted',
                  )}
                >
                  Create page
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/** Completion ring drawn around the logo avatar, fusing the two into one mark. */
const ProgressRing = ({
  ratio,
  reduce,
  children,
}: {
  ratio: number;
  reduce: boolean;
  children: React.ReactNode;
}) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="opacity-20"
        />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          className="text-surface"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - ratio) }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 30 }}
        />
      </svg>
      {children}
    </span>
  );
};

const Pulse = () => (
  <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden="true">
    <span className="absolute h-full w-full rounded-full bg-surface opacity-60 motion-safe:animate-ping" />
    <span className="relative h-2.5 w-2.5 rounded-full bg-surface" />
  </span>
);
