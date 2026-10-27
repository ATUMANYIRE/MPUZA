import { motion, useReducedMotion } from 'framer-motion';
import { cx } from '../../lib/cx';

/**
 * Measured from .mpuza-company-avatar:
 *   104px, border-radius 9999px, background #f3f4f6, border 4px solid #fff,
 *   box-shadow 0 8px 20px rgba(15,23,42,.16),
 *   initials 1.65rem/800, letter-spacing .02em, #111827, uppercase.
 * The 72px form variant (.mpuza-create-company-logo-preview) uses #e5e7eb,
 * a 3px white ring and 0 4px 12px rgba(15,23,42,.12), initials 1.2rem/800.
 */
interface AvatarProps {
  initials: string;
  src?: string | null;
  size: 'lg' | 'md' | 'sm' | 'xs';
  className?: string;
  /** Animate the initials when they change. Off for the static style guide. */
  animateInitials?: boolean;
}

const SIZES = {
  lg: {
    box: 'h-avatar-lg w-avatar-lg border-4 bg-surface-sunken shadow-avatar',
    text: 'text-initials',
  },
  md: {
    box: 'h-avatar-md w-avatar-md border-[3px] bg-surface-sunken-strong shadow-avatar-sm',
    text: 'text-initials-sm',
  },
  sm: {
    box: 'h-11 w-11 border-2 bg-surface-sunken-strong shadow-avatar-sm',
    text: 'text-meta',
  },
  // Sits inside the island's progress ring, so it carries no ring of its own.
  xs: {
    box: 'h-9 w-9 border-0 bg-surface-sunken-strong',
    text: 'text-bar-sub',
  },
} as const;

export const Avatar = ({ initials, src, size, className, animateInitials = true }: AvatarProps) => {
  const reduce = useReducedMotion();
  const s = SIZES[size];

  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-surface',
        s.box,
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <motion.span
          key={animateInitials ? initials : undefined}
          initial={animateInitials && !reduce ? { opacity: 0, y: 4, scale: 0.9 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          className={cx(
            'font-extrabold uppercase tracking-initials text-text leading-none',
            s.text,
          )}
        >
          {initials}
        </motion.span>
      )}
    </span>
  );
};

/**
 * Mpuza shows "?" when no name has been typed yet (visible in create-empty.png),
 * and the first letters of each word once it has (IN for INTERNORY).
 */
export const initialsFor = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};
