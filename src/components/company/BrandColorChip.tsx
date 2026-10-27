import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';
import { extractLogoColor, type LogoColor } from '../../lib/logoColor';
import { cx } from '../../lib/cx';

interface BrandColorChipProps {
  logoUrl: string | null;
  applied: string | null;
  onApply: (color: LogoColor | null) => void;
}

/**
 * After a logo is uploaded, reads its dominant colour on a canvas and offers
 * it as the page's accent. The file never leaves the browser.
 *
 * PROPOSED. Mpuza's real form has nothing like it. The point is that a company
 * page should be able to look like the company, not only like Mpuza — and the
 * colour is already sitting in the file they just uploaded.
 *
 * The swatch is a runtime value taken from user content, so it is applied as
 * an inline style rather than a token. That is intentional: it is data, not a
 * design decision, which is also why `npm run lint:tokens` does not see it.
 */
export const BrandColorChip = ({ logoUrl, applied, onApply }: BrandColorChipProps) => {
  const reduce = useReducedMotion();
  const [found, setFound] = useState<LogoColor | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let live = true;
    if (!logoUrl) {
      setFound(null);
      return;
    }
    setPending(true);
    extractLogoColor(logoUrl).then((c) => {
      if (!live) return;
      setFound(c);
      setPending(false);
    });
    return () => {
      live = false;
    };
  }, [logoUrl]);

  if (!logoUrl) return null;

  return (
    <AnimatePresence initial={false}>
      {(pending || found) && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex flex-wrap items-center gap-2.5 rounded-md bg-surface-subtle p-3"
        >
          <Palette size={16} className="shrink-0 text-primary" aria-hidden="true" />

          {pending && (
            <span className="text-bar-sub text-text-muted">Reading your logo’s colour…</span>
          )}

          {!pending && found && (
            <>
              <span className="flex-1 text-bar-sub text-text-body">
                Found <span className="font-semibold tabular-nums">{found.hex}</span> in your
                logo. Use it as your page accent?
              </span>

              <span
                aria-hidden="true"
                className="h-6 w-6 shrink-0 rounded-full border border-line"
                style={{ background: found.hex }}
              />

              {applied === found.hex ? (
                <button
                  type="button"
                  onClick={() => onApply(null)}
                  className={cx(
                    'inline-flex min-h-tap items-center gap-1.5 rounded-full border border-primary',
                    'bg-surface-tint px-3 text-bar-sub font-semibold text-primary',
                  )}
                >
                  <Check size={14} aria-hidden="true" />
                  Applied — undo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onApply(found)}
                  className={cx(
                    'inline-flex min-h-tap items-center rounded-full bg-primary px-3',
                    'text-bar-sub font-bold text-text-on-primary',
                    'transition-colors duration-base ease-default hover:bg-primary-hover',
                  )}
                >
                  Use this colour
                </button>
              )}
            </>
          )}

          {!pending && !found && (
            <span className="text-bar-sub text-text-muted">
              No strong colour in that logo — keeping Mpuza blue.
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
