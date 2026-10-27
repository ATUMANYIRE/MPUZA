import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

/**
 * Measured from .mpz-lp-mosaic__card on mpuza.com's landing page:
 *   background #fff, border-radius .375rem, border 1px rgba(14,49,76,.1),
 *   border-top 3px solid #35a8df, cycling to #0e314c on every 2nd card and
 *   #e9432f on every 3rd.
 * Paired with .mpz-lp-eyebrow (.74rem / 700 / .14em / uppercase / #35a8df)
 * and .mpz-lp-spine__index (.9rem / 800 / .04em).
 *
 * Mpuza uses all of this on its marketing pages and none of it in the product.
 * Bringing it inside is what makes this redesign louder without inventing
 * anything that is not already theirs.
 */
export type RuleTone = 'primary' | 'accent' | 'brand';

const RULE: Record<RuleTone, string> = {
  primary: 'border-t-primary',
  accent: 'border-t-accent',
  brand: 'border-t-brand',
};

const EYEBROW: Record<RuleTone, string> = {
  primary: 'text-primary',
  accent: 'text-accent',
  brand: 'text-brand',
};

interface SectionCardProps {
  index: string;
  eyebrow: string;
  title: string;
  tone: RuleTone;
  children: ReactNode;
}

export const SectionCard = ({ index, eyebrow, title, tone, children }: SectionCardProps) => (
  <section
    className={cx(
      'rounded-md border border-rule border-t-rule bg-surface p-4 shadow-sm',
      RULE[tone],
    )}
  >
    <div className="mb-4 flex items-baseline gap-2.5">
      <span
        aria-hidden="true"
        className={cx('shrink-0 text-index font-extrabold tracking-index', EYEBROW[tone])}
      >
        {index}
      </span>
      <div className="min-w-0">
        <p
          className={cx(
            'text-eyebrow font-bold uppercase tracking-eyebrow',
            EYEBROW[tone],
          )}
        >
          {eyebrow}
        </p>
        <h2 className="text-section font-bold tracking-heading text-text">{title}</h2>
      </div>
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);
