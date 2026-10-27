import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { useRegisterOverlay } from '../../lib/overlay';
import { PebbleButton } from './PebbleButton';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  title: string;
  options: readonly string[];
  value: string | null;
  searchPlaceholder?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

/**
 * PROPOSED. Mobile picker with search, 44px rows (Mpuza's own measured mobile
 * tap target) and a snap-to-dismiss drag. Scrim, radius, shadow and the blue
 * selected state all come from tokens.
 *
 * Reduced motion: no slide, no drag — the sheet cross-fades in place.
 */
export const BottomSheet = ({
  open,
  title,
  options,
  value,
  searchPlaceholder = 'Search…',
  onSelect,
  onClose,
}: BottomSheetProps) => {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  useRegisterOverlay(open);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-sheet-scrim bg-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cx(
              'fixed inset-x-0 bottom-0 z-sheet flex max-h-[85dvh] flex-col',
              'rounded-t-2xl bg-surface shadow-sheet',
            )}
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={
              reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 360, damping: 36 }
            }
            drag={reduce ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              // Snap to dismiss: past 120px, or a fast flick.
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="flex shrink-0 cursor-grab justify-center py-3 active:cursor-grabbing">
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-surface-sunken-strong" />
            </div>

            <div className="flex shrink-0 items-center gap-3 px-gutter pb-3">
              <h2 className="flex-1 text-bar-title font-bold text-text">{title}</h2>
              <PebbleButton label={`Close ${title.toLowerCase()}`} onClick={onClose}>
                <X size={18} aria-hidden="true" />
              </PebbleButton>
            </div>

            <div className="shrink-0 px-gutter pb-3">
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={`Search ${title.toLowerCase()}`}
                className={cx(
                  'h-control w-full rounded-md border border-line-input bg-surface px-3',
                  'text-button text-text placeholder:text-text-placeholder',
                  'transition-colors duration-base ease-default',
                  'hover:border-primary focus:border-primary focus:outline-none',
                )}
              />
            </div>

            <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-safe">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-meta text-text-muted">
                  Nothing matches “{query}”.
                </li>
              )}
              {filtered.map((opt) => {
                const selected = opt === value;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(opt);
                        onClose();
                      }}
                      className={cx(
                        'flex min-h-tap w-full items-center justify-between gap-3 rounded-md',
                        'px-3 text-left text-meta',
                        'transition-colors duration-base ease-default',
                        selected
                          ? 'bg-surface-tint font-bold text-primary'
                          : 'text-text-body hover:bg-surface-subtle',
                      )}
                    >
                      <span className="truncate">{opt}</span>
                      {selected && <Check />}
                    </button>
                  </li>
                );
              })}
              <li className="h-4" aria-hidden="true" />
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Check = () => (
  <svg className="h-4 w-4 shrink-0 text-primary" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="m3.5 8.5 3 3 6-6.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
