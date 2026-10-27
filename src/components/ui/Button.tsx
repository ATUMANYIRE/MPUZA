import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
}

/**
 * Measured: .btn_dark_blue is 42px tall, 14px/700, radius 6px, padding 0 2rem.
 *
 * Fills use --color-primary (#35a8df), matching mpuza.com exactly, by explicit
 * request. Note that white on #35a8df is 2.69:1 and does not meet WCAG AA for
 * normal text; the darker --color-primary-text (#1d7eae, 4.52:1) is still used
 * for blue *text on light surfaces*, which is what Mpuza itself does for the
 * selected tab label. See docs/design-language.md §6.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-text-on-primary hover:bg-primary-hover shadow-sm',
  secondary: 'bg-surface text-primary border border-line-input hover:bg-surface-tint',
  outline: 'bg-surface text-primary border border-primary hover:bg-surface-tint',
  destructive: 'bg-danger text-text-on-primary hover:bg-danger-hover',
  ghost: 'bg-transparent text-primary hover:bg-surface-tint',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'h-button px-8 text-button',
  sm: 'h-button-sm px-4 text-chip',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) => (
  <button
    {...rest}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={cx(
      'inline-flex items-center justify-center gap-2 rounded-md font-bold tracking-base',
      'transition-colors duration-base ease-default',
      'disabled:cursor-not-allowed disabled:opacity-50',
      VARIANTS[variant],
      SIZES[size],
      fullWidth && 'w-full',
      className,
    )}
  >
    {loading ? <Spinner /> : icon}
    {children}
  </button>
);

/** Mirrors antd's Spin, which is what Mpuza's Loading modal actually uses. */
const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);
