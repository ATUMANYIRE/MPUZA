import { describe, expect, it } from 'vitest';
import {
  activityLabel,
  categoryDots,
  totalUnread,
  unreadRatio,
  type ActivityCounts,
} from './activity';

const counts = (over: Partial<ActivityCounts> = {}): ActivityCounts => ({
  notificationsUnread: 3,
  notificationsTotal: 4,
  jobsNew: 1,
  savedNew: 0,
  ...over,
});

describe('activityLabel', () => {
  it('matches the example from the spec', () => {
    expect(activityLabel(counts())).toBe(
      'Activity: 3 unread notifications, 1 new job, 0 new saved',
    );
  });

  it('singularises one notification and pluralises jobs', () => {
    expect(activityLabel(counts({ notificationsUnread: 1, jobsNew: 2 }))).toBe(
      'Activity: 1 unread notification, 2 new jobs, 0 new saved',
    );
  });

  it('handles an all-clear state', () => {
    expect(activityLabel(counts({ notificationsUnread: 0, jobsNew: 0, savedNew: 0 }))).toBe(
      'Activity: 0 unread notifications, 0 new jobs, 0 new saved',
    );
  });
});

describe('unreadRatio', () => {
  it('is the unread share of the latest batch', () => {
    expect(unreadRatio(counts({ notificationsUnread: 3, notificationsTotal: 4 }))).toBeCloseTo(
      0.75,
    );
  });

  it('is 1 when everything is unread', () => {
    expect(unreadRatio(counts({ notificationsUnread: 4, notificationsTotal: 4 }))).toBe(1);
  });

  it('is 0 when caught up', () => {
    expect(unreadRatio(counts({ notificationsUnread: 0 }))).toBe(0);
  });

  it('does not divide by zero', () => {
    expect(unreadRatio(counts({ notificationsUnread: 0, notificationsTotal: 0 }))).toBe(0);
  });

  it('clamps if unread somehow exceeds the batch', () => {
    expect(unreadRatio(counts({ notificationsUnread: 9, notificationsTotal: 4 }))).toBe(1);
  });
});

describe('categoryDots', () => {
  it('lights one dot per category with something new', () => {
    expect(categoryDots(counts())).toEqual([true, true, false]);
  });

  it('is all dark when nothing is new', () => {
    expect(categoryDots(counts({ notificationsUnread: 0, jobsNew: 0, savedNew: 0 }))).toEqual([
      false,
      false,
      false,
    ]);
  });

  it('is all lit when every category has something', () => {
    expect(categoryDots(counts({ savedNew: 2 }))).toEqual([true, true, true]);
  });
});

describe('totalUnread', () => {
  it('sums the three categories', () => {
    expect(totalUnread(counts())).toBe(4);
    expect(totalUnread(counts({ notificationsUnread: 20, jobsNew: 0, savedNew: 0 }))).toBe(20);
  });
});
