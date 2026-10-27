import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface ActionBarProps {
  /** 0–1. Drives the hairline above the bar. */
  progress: number;
  progressLabel: string;
  children: ReactNode;
}

/**
 * PROPOSED. Sticky commit bar. Mpuza's own "Create page" button is a plain
 * left-aligned button at the end of a long desktop form; on a phone that
 * means scrolling to the bottom to find out whether you can submit at all.
 *
 * Uses dvh-safe layout and env(safe-area-inset-bottom) so it clears the
 * home indicator on iOS.
 */
export const ActionBar = ({ progress, progressLabel, children }: ActionBarProps) => {
  const reduce = useReducedMotion();
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div
      className={cx(
        'sticky bottom-0 z-actionbar border-t border-line-cool bg-surface shadow-bar pb-safe',
      )}
    >
      <div
        className="h-1 w-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={progressLabel}
      >
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 32 }}
        />
      </div>
      <div className="flex items-center gap-3 px-gutter py-3">
        <span className="shrink-0 text-bar-sub text-text-muted">{progressLabel}</span>
        <div className="ml-auto flex min-w-0 flex-1 justify-end">{children}</div>
      </div>
    </div>
  );
};
