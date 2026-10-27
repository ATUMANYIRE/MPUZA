import { motion, useReducedMotion } from 'framer-motion';
import { cx } from '../../lib/cx';

interface SegmentedProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
  'aria-label': string;
}

/**
 * PROPOSED. Mpuza has no segmented control, and ships no spring easing at all —
 * every transition on the real site is plain `ease`. The sliding pill is a
 * mobile affordance we are adding, built from brand tokens only.
 */
export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedProps<T>) => {
  const reduce = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="relative flex rounded-full bg-surface-sunken p-1"
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className={cx(
              // min-h-tap, not py-2: 44px is the minimum touch target, and it
              // is a figure Mpuza already honours on its own mobile tab rail.
              'relative z-sticky min-h-tap flex-1 rounded-full px-4 text-button font-bold',
              'transition-colors duration-base ease-default',
              selected ? 'text-text-on-primary' : 'text-text-muted hover:text-primary',
            )}
          >
            {selected && (
              <motion.span
                layoutId="segmented-pill"
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                }
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
