import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../../lib/cx';

export type RingTone = 'primary' | 'brand' | 'neutral';
export type RingSize = 'sm' | 'md' | 'lg';

export interface RingDots {
  total: number;
  active: number;
}

interface RingIconProps {
  icon: LucideIcon;
  /** 0–1. Drawn as an arc starting at 12 o'clock, clockwise, round caps. */
  progress?: number;
  dots?: RingDots;
  /** Count badge in Mpuza red. Capped at 9+ for display. */
  badge?: number;
  size?: RingSize;
  tone?: RingTone;
  /** Required: this component renders no text of its own. */
  label: string;
  className?: string;
}

/**
 * A glyph inside a progress ring, with an optional dot row beneath and a count
 * badge. Pure SVG — no raster, crisp at any size.
 *
 * PROPOSED. Adapted from a reference pattern described by the user; the
 * reference image was not present in reference/inspiration/, so the geometry
 * below is my reading of the description, not a trace of the original.
 * Every colour, radius and shadow comes from src/design/tokens.css.
 */

// Geometry per size. `box` is the visual circle; the hit area is always ≥44px.
const SIZES = {
  sm: { box: 28, stroke: 2.5, glyph: 14, dot: 3, gap: 3, badge: 'text-[0.6rem] min-w-3.5 h-3.5' },
  md: { box: 36, stroke: 3, glyph: 18, dot: 4, gap: 4, badge: 'text-[0.65rem] min-w-4 h-4' },
  lg: { box: 48, stroke: 3.5, glyph: 24, dot: 5, gap: 5, badge: 'text-chip min-w-5 h-5' },
} as const;

const TONE_ARC: Record<RingTone, string> = {
  primary: 'text-primary',
  brand: 'text-brand',
  neutral: 'text-text-secondary',
};

// The glyph matches its own arc. Using the darker --color-primary-text here
// put two different blues inside one icon, which read as a mismatch.
const TONE_GLYPH: Record<RingTone, string> = {
  primary: 'text-primary',
  brand: 'text-brand',
  neutral: 'text-text-secondary',
};

const TONE_DOT: Record<RingTone, string> = {
  primary: 'bg-primary',
  brand: 'bg-brand',
  neutral: 'bg-text-secondary',
};

export const capBadge = (n: number): string => (n > 9 ? '9+' : String(n));

export const RingIcon = ({
  icon: Icon,
  progress = 0,
  dots,
  badge,
  size = 'md',
  tone = 'primary',
  label,
  className,
}: RingIconProps) => {
  const reduce = useReducedMotion();
  const s = SIZES[size];

  const clamped = Math.min(1, Math.max(0, progress));
  const radius = (s.box - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // dashoffset counts down from the full circumference as progress rises.
  const offset = circumference * (1 - clamped);

  return (
    <span
      role="img"
      aria-label={label}
      className={cx('inline-flex flex-col items-center justify-center gap-1', className)}
    >
      <span className="relative inline-flex" style={{ width: s.box, height: s.box }}>
        <svg
          width={s.box}
          height={s.box}
          viewBox={`0 0 ${s.box} ${s.box}`}
          fill="none"
          aria-hidden="true"
          className="absolute inset-0"
        >
          <circle
            cx={s.box / 2}
            cy={s.box / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={s.stroke}
            className="text-line"
          />
          <motion.circle
            data-testid="ring-arc"
            cx={s.box / 2}
            cy={s.box / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={s.stroke}
            strokeLinecap="round"
            className={TONE_ARC[tone]}
            strokeDasharray={circumference}
            // Start at 12 o'clock, travel clockwise.
            transform={`rotate(-90 ${s.box / 2} ${s.box / 2})`}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={
              reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 30 }
            }
          />
        </svg>

        <span className="absolute inset-0 flex items-center justify-center">
          <Icon size={s.glyph} strokeWidth={2} className={TONE_GLYPH[tone]} aria-hidden="true" />
        </span>

        {badge !== undefined && badge > 0 && (
          <motion.span
            data-testid="ring-badge"
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 22 }
            }
            className={cx(
              'absolute -right-1 -top-1 flex items-center justify-center rounded-full px-1',
              'bg-brand font-bold text-text-on-primary ring-2 ring-surface tabular-nums',
              s.badge,
            )}
          >
            {capBadge(badge)}
          </motion.span>
        )}
      </span>

      {dots && dots.total > 0 && (
        <span
          data-testid="ring-dots"
          aria-hidden="true"
          className="flex items-center"
          style={{ gap: s.gap }}
        >
          {Array.from({ length: dots.total }, (_, i) => {
            const on = i < dots.active;
            return (
              <motion.span
                key={i}
                data-testid={on ? 'ring-dot-active' : 'ring-dot-idle'}
                initial={false}
                animate={{ scale: on && !reduce ? 1 : 0.85 }}
                transition={
                  reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 24 }
                }
                className={cx(
                  'block rounded-full transition-colors duration-base ease-default',
                  on ? TONE_DOT[tone] : 'bg-line',
                )}
                style={{ width: s.dot, height: s.dot }}
              />
            );
          })}
        </span>
      )}
    </span>
  );
};
