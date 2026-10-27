import { Search } from 'lucide-react';
import { ActivityIcons, ActivityOrb } from './ActivityOrb';
import { DEMO_COUNTS, type ActivityCounts } from '../../mocks/activity';
import { cx } from '../../lib/cx';

/**
 * Measured from the screenshots: white bar, the red-orange gradient logo mark
 * beside a bold red "Mpuza" wordmark, a search pill, and the "Any feedback?"
 * button (#e9432f, radius 6px, 36px tall, .82rem/600).
 *
 * Below 1024px the three separate status icons (Notifications, Jobs, Saved)
 * collapse into a single ActivityOrb; above it they stay separate but are
 * drawn as small RingIcons so the family reads as one system. The desktop
 * search pill collapses to an icon on mobile. All PROPOSED adaptations.
 */
export const AppHeader = ({
  title,
  counts = DEMO_COUNTS,
}: {
  title?: string;
  counts?: ActivityCounts;
}) => (
  <header className="sticky top-0 z-header border-b border-line-cool bg-surface">
    <div className="flex h-14 items-center gap-2 px-gutter">
      <a href="/" className="flex min-h-tap shrink-0 items-center gap-2">
        <img src="/logo.png" alt="" className="h-7 w-auto" />
        <span className="text-title-sm font-extrabold tracking-heading text-brand">Mpuza</span>
      </a>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          aria-label="Search"
          className={cx(
            'flex h-tap w-tap items-center justify-center rounded-full text-text-secondary',
            'transition-colors duration-base ease-default hover:bg-surface-subtle',
            'hover:text-primary',
          )}
        >
          <Search size={20} aria-hidden="true" />
        </button>

        <div className="lg:hidden">
          <ActivityOrb counts={counts} />
        </div>
        <div className="hidden lg:block">
          <ActivityIcons counts={counts} />
        </div>

        <button
          type="button"
          className={cx(
            'ml-1 h-button-sm shrink-0 rounded-md bg-brand px-3 text-chip font-semibold',
            'text-text-on-primary transition-colors duration-base ease-default hover:bg-brand-hover',
          )}
        >
          Any feedback?
        </button>
      </div>
    </div>

    {title && (
      <div className="border-t border-line-cool px-gutter py-2.5">
        <h1 className="text-bar-title font-bold tracking-heading text-text">{title}</h1>
      </div>
    )}
  </header>
);
