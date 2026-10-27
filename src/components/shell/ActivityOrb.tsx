import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bell, Briefcase, Star, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { RingIcon } from '../ui/RingIcon';
import { PebbleButton } from '../ui/PebbleButton';
import { Segmented } from '../ui/Segmented';
import { cx } from '../../lib/cx';
import { useRegisterOverlay } from '../../lib/overlay';
import {
  CATEGORY_LABEL,
  DEMO_ITEMS,
  EMPTY_COPY,
  activityLabel,
  categoryDots,
  totalUnread,
  unreadRatio,
  type ActivityCategory,
  type ActivityCounts,
  type ActivityItem,
} from '../../mocks/activity';

const GLYPH: Record<ActivityCategory, typeof Bell> = {
  notifications: Bell,
  jobs: Briefcase,
  saved: Star,
};

/**
 * Merges the header's three separate icons — Notifications, Jobs, Saved —
 * into one orb below 1024px.
 *
 *   centre glyph : Bell
 *   ring arc     : share of the latest notification batch still unread
 *   dots         : one per category, lit when that category has something new
 *   badge        : total unread, capped at 9+
 *
 * PROPOSED. All counts come from src/mocks/activity.ts — demo data, not an API.
 */
export const ActivityOrb = ({
  counts,
  items = DEMO_ITEMS,
}: {
  counts: ActivityCounts;
  items?: ActivityItem[];
}) => {
  const [open, setOpen] = useState(false);
  const label = activityLabel(counts);
  const dots = categoryDots(counts);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={label}
        className={cx(
          'flex h-tap w-tap items-center justify-center rounded-full',
          'transition-colors duration-base ease-default hover:bg-surface-subtle',
        )}
      >
        <RingIcon
          icon={Bell}
          progress={unreadRatio(counts)}
          dots={{ total: dots.length, active: dots.filter(Boolean).length }}
          badge={totalUnread(counts)}
          size="md"
          tone="primary"
          label=""
        />
      </button>

      {/* Announced separately so screen readers hear count changes without
          the button itself stealing focus or being re-read on every render. */}
      <span aria-live="polite" className="sr-only">
        {label}
      </span>

      <ActivitySheet open={open} onClose={() => setOpen(false)} counts={counts} items={items} />
    </>
  );
};

/** Desktop (≥1024px): the three icons stay separate, but each is a RingIcon. */
export const ActivityIcons = ({ counts }: { counts: ActivityCounts }) => {
  const dots = categoryDots(counts);
  const each: Array<{ cat: ActivityCategory; progress: number; badge: number }> = [
    {
      cat: 'notifications',
      progress: unreadRatio(counts),
      badge: counts.notificationsUnread,
    },
    { cat: 'jobs', progress: counts.jobsNew > 0 ? 1 : 0, badge: counts.jobsNew },
    { cat: 'saved', progress: counts.savedNew > 0 ? 1 : 0, badge: counts.savedNew },
  ];

  return (
    <div className="flex items-center gap-1">
      {each.map(({ cat, progress, badge }, i) => (
        <button
          key={cat}
          type="button"
          aria-label={`${CATEGORY_LABEL[cat]}: ${badge} new`}
          className={cx(
            'flex h-tap w-tap items-center justify-center rounded-full',
            'transition-colors duration-base ease-default hover:bg-surface-subtle',
          )}
        >
          <RingIcon
            icon={GLYPH[cat]}
            progress={progress}
            badge={badge}
            size="sm"
            tone={dots[i] ? 'primary' : 'neutral'}
            label=""
          />
        </button>
      ))}
    </div>
  );
};

const ActivitySheet = ({
  open,
  onClose,
  counts,
  items,
}: {
  open: boolean;
  onClose: () => void;
  counts: ActivityCounts;
  items: ActivityItem[];
}) => {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<ActivityCategory>('notifications');
  useRegisterOverlay(open);

  useEffect(() => {
    if (!open) return;
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

  const shown = useMemo(() => items.filter((i) => i.category === tab), [items, tab]);

  const newFor: Record<ActivityCategory, number> = {
    notifications: counts.notificationsUnread,
    jobs: counts.jobsNew,
    saved: counts.savedNew,
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-sheet-scrim bg-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Activity"
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
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="flex shrink-0 cursor-grab justify-center py-3 active:cursor-grabbing">
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-surface-sunken-strong" />
            </div>

            <div className="flex shrink-0 items-center gap-3 px-gutter pb-3">
              <h2 className="flex-1 text-bar-title font-bold text-text">Activity</h2>
              <PebbleButton label="Close activity" onClick={onClose}>
                <X size={18} aria-hidden="true" />
              </PebbleButton>
            </div>

            <div className="shrink-0 px-gutter pb-3">
              <Segmented
                aria-label="Activity category"
                value={tab}
                onChange={setTab}
                options={[
                  { value: 'notifications', label: 'Notifications' },
                  { value: 'jobs', label: 'Jobs' },
                  { value: 'saved', label: 'Saved' },
                ]}
              />
            </div>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-gutter pb-safe">
              <p className="pb-2 text-bar-sub text-text-placeholder">
                Demo data — not a live feed.
              </p>
              {shown.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <RingIcon
                    icon={GLYPH[tab]}
                    progress={0}
                    size="lg"
                    tone="neutral"
                    label=""
                    className="opacity-60"
                  />
                  <p className="max-w-xs text-meta text-text-muted">{EMPTY_COPY[tab]}</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2 pb-4">
                  {shown.map((item) => (
                    <li
                      key={item.id}
                      className={cx(
                        'flex items-start gap-3 rounded-md border border-rule p-3',
                        item.unread ? 'bg-surface-tint' : 'bg-surface',
                      )}
                    >
                      <span className="mt-0.5 shrink-0">
                        <RingIcon
                          icon={GLYPH[item.category]}
                          progress={item.unread ? 1 : 0}
                          size="sm"
                          tone={item.unread ? 'primary' : 'neutral'}
                          label=""
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cx(
                            'block text-meta text-text',
                            item.unread && 'font-semibold',
                          )}
                        >
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-bar-sub text-text-muted">
                          {item.meta}
                        </span>
                      </span>
                      {item.unread && (
                        <span
                          aria-label="Unread"
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <p className="pb-4 text-center text-bar-sub text-text-placeholder">
                {newFor[tab]} new in {CATEGORY_LABEL[tab]}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
