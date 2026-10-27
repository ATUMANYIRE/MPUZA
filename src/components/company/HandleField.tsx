import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Loader2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { slugify } from '../../lib/strength';

/**
 * DEMO ONLY — there is no availability API. These names stand in for taken
 * ones so the checked / taken / suggestion states are reachable.
 */
const DEMO_TAKEN = new Set(['mpuza', 'internory', 'google', 'mozilla', 'gitlab', 'admin', 'jobs']);

export type HandleStatus = 'idle' | 'checking' | 'free' | 'taken' | 'short';

export const checkHandle = (handle: string): HandleStatus => {
  const h = handle.trim();
  if (h.length === 0) return 'idle';
  if (h.length < 3) return 'short';
  return DEMO_TAKEN.has(h) ? 'taken' : 'free';
};

export const suggestionsFor = (handle: string): string[] =>
  [`${handle}-hq`, `${handle}-team`, `join-${handle}`].filter((s) => !DEMO_TAKEN.has(s)).slice(0, 3);

interface HandleFieldProps {
  value: string;
  /** Used to prefill the handle until the user edits it themselves. */
  companyName: string;
  onChange: (next: string) => void;
}

/**
 * The page's public address. PROPOSED — Mpuza's real form has no such field.
 *
 * It is here because the address is the one asset on this form the company
 * actually keeps and shares, and because leaving it to be auto-generated later
 * means somebody else can take the good one first.
 */
export const HandleField = ({ value, companyName, onChange }: HandleFieldProps) => {
  const id = useId();
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<HandleStatus>('idle');
  const [touched, setTouched] = useState(false);
  const timer = useRef<number>();

  // Track the name until the user takes the field over.
  useEffect(() => {
    if (touched) return;
    const next = slugify(companyName);
    if (next !== value) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName, touched]);

  // Debounced "lookup".
  useEffect(() => {
    window.clearTimeout(timer.current);
    if (!value.trim()) {
      setStatus('idle');
      return;
    }
    setStatus('checking');
    timer.current = window.setTimeout(() => setStatus(checkHandle(value)), 450);
    return () => window.clearTimeout(timer.current);
  }, [value]);

  const tone =
    status === 'free'
      ? 'border-success'
      : status === 'taken' || status === 'short'
        ? 'border-danger'
        : 'border-line-input';

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-meta font-medium text-text-body">
        Page address
      </label>

      <div
        className={cx(
          'flex h-control items-center rounded-md border bg-surface pr-3',
          'transition-colors duration-base ease-default focus-within:border-primary',
          tone,
        )}
      >
        <span className="shrink-0 select-none pl-3 text-button text-text-placeholder">
          mpuza.com/c/
        </span>
        <input
          id={id}
          value={value}
          onChange={(e) => {
            setTouched(true);
            onChange(slugify(e.target.value));
          }}
          placeholder="your-company"
          aria-describedby={`${id}-status`}
          className={cx(
            // self-stretch, not py-*: the input should fill the 45px row so its
            // hit area matches what the control looks like.
            'min-w-0 flex-1 self-stretch bg-transparent text-button text-text outline-none',
            'placeholder:text-text-placeholder',
          )}
        />
        <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {status === 'checking' && (
              <motion.span
                key="checking"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2
                  size={16}
                  aria-hidden="true"
                  className="text-text-placeholder motion-safe:animate-spin"
                />
              </motion.span>
            )}
            {status === 'free' && (
              <motion.span
                key="free"
                initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-success"
              >
                <Check size={12} className="text-text-on-primary" aria-hidden="true" />
              </motion.span>
            )}
            {(status === 'taken' || status === 'short') && (
              <motion.span
                key="bad"
                initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-danger"
              >
                <X size={12} className="text-text-on-primary" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>

      <p id={`${id}-status`} aria-live="polite" className="text-bar-sub">
        {status === 'free' && <span className="text-success">mpuza.com/c/{value} is available.</span>}
        {status === 'short' && <span className="text-danger">Use at least 3 characters.</span>}
        {status === 'taken' && <span className="text-danger">That address is taken.</span>}
        {(status === 'idle' || status === 'checking') && (
          <span className="text-text-muted">Checked against demo data, not a live registry.</span>
        )}
      </p>

      {status === 'taken' && (
        <div className="flex flex-wrap gap-2 pt-1">
          {suggestionsFor(value).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setTouched(true);
                onChange(s);
              }}
              className={cx(
                'min-h-tap rounded-full border border-primary bg-surface px-3 text-bar-sub',
                'font-semibold text-primary transition-colors duration-base ease-default',
                'hover:bg-surface-tint',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
