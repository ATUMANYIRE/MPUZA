import { motion, useReducedMotion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  // Dropped because Framer Motion redefines these with its own signatures.
  'children' | 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'style'
>;

interface PebbleButtonProps extends NativeButtonProps {
  /** Required: a pebble carries an icon, never text. */
  label: string;
  children: ReactNode;
  size?: 'md' | 'lg';
  tone?: 'surface' | 'accent';
}

/**
 * A round, soft-shadowed button on a white surface with a 1px hairline.
 * Used for Back, sheet Close and the floating Messaging toggle.
 *
 * PROPOSED. Always at least 44×44px, whatever the visual size.
 */
const SIZES = {
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
} as const;

const TONES = {
  surface: 'bg-surface text-text-secondary border-line hover:text-primary',
  accent: 'bg-accent text-text-on-primary border-transparent',
} as const;

export const PebbleButton = ({
  label,
  children,
  size = 'md',
  tone = 'surface',
  className,
  ...rest
}: PebbleButtonProps) => {
  const reduce = useReducedMotion();
  return (
    <motion.button
      {...rest}
      type={rest.type ?? 'button'}
      aria-label={label}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full border shadow-raised',
        'transition-colors duration-base ease-default',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        SIZES[size],
        TONES[tone],
        className,
      )}
    >
      {children}
    </motion.button>
  );
};
