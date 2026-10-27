/**
 * DEMO DATA ONLY.
 *
 * There is no notifications API behind any of this. Every item below is
 * hand-written sample content so the Activity Orb has something to animate
 * and the bottom sheet has something to list. Nothing here talks to mpuza.com,
 * and none of it should be read as how Mpuza's real activity feed is shaped.
 */

export type ActivityCategory = 'notifications' | 'jobs' | 'saved';

export interface ActivityItem {
  id: string;
  category: ActivityCategory;
  title: string;
  meta: string;
  unread: boolean;
}

export interface ActivityCounts {
  /** Unread notifications. Drives the badge and the ring arc numerator. */
  notificationsUnread: number;
  /** Total notifications in the latest batch. Ring arc denominator. */
  notificationsTotal: number;
  jobsNew: number;
  savedNew: number;
}

export const DEMO_ITEMS: ActivityItem[] = [
  {
    id: 'n1',
    category: 'notifications',
    title: 'Your company page was viewed 24 times',
    meta: 'Demo data · 2 hours ago',
    unread: true,
  },
  {
    id: 'n2',
    category: 'notifications',
    title: 'A. Mukamana followed INTERNORY',
    meta: 'Demo data · 5 hours ago',
    unread: true,
  },
  {
    id: 'n3',
    category: 'notifications',
    title: 'Verification request received',
    meta: 'Demo data · yesterday',
    unread: true,
  },
  {
    id: 'n4',
    category: 'notifications',
    title: 'Your page is now searchable',
    meta: 'Demo data · 2 days ago',
    unread: false,
  },
  {
    id: 'j1',
    category: 'jobs',
    title: 'Frontend Engineer · Full time',
    meta: 'Demo data · Kigali, Rwanda',
    unread: true,
  },
  {
    id: 'j2',
    category: 'jobs',
    title: 'Product Designer · Contract',
    meta: 'Demo data · Remote',
    unread: false,
  },
  {
    id: 's1',
    category: 'saved',
    title: 'Senior Data Analyst',
    meta: 'Demo data · saved last week',
    unread: false,
  },
];

export const DEMO_COUNTS: ActivityCounts = {
  notificationsUnread: 3,
  notificationsTotal: 4,
  jobsNew: 1,
  savedNew: 0,
};

/** Ring arc: the share of the latest batch still unread. */
export const unreadRatio = (c: ActivityCounts): number => {
  if (c.notificationsTotal <= 0) return 0;
  return Math.min(1, Math.max(0, c.notificationsUnread / c.notificationsTotal));
};

/** One dot per category, lit when that category has something new. */
export const categoryDots = (c: ActivityCounts): boolean[] => [
  c.notificationsUnread > 0,
  c.jobsNew > 0,
  c.savedNew > 0,
];

export const totalUnread = (c: ActivityCounts): number =>
  c.notificationsUnread + c.jobsNew + c.savedNew;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** e.g. "Activity: 3 unread notifications, 1 new job, 0 new saved" */
export const activityLabel = (c: ActivityCounts): string =>
  `Activity: ${plural(c.notificationsUnread, 'unread notification', 'unread notifications')}, ` +
  `${plural(c.jobsNew, 'new job', 'new jobs')}, ` +
  `${c.savedNew} new saved`;

export const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  notifications: 'Notifications',
  jobs: 'Jobs',
  saved: 'Saved',
};

export const EMPTY_COPY: Record<ActivityCategory, string> = {
  notifications: 'Nothing new. You are all caught up.',
  jobs: 'No new jobs yet. Post one and it will show up here.',
  saved: 'Nothing saved yet. Star a job or a company to keep it here.',
};
