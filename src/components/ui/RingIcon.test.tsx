import { render, screen } from '@testing-library/react';
import { Bell } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { RingIcon, capBadge } from './RingIcon';

/** md size: box 36, stroke 3 → r = (36-3)/2 = 16.5 */
const MD_CIRCUMFERENCE = 2 * Math.PI * 16.5;

const arc = () => screen.getByTestId('ring-arc');

/**
 * Motion writes the animated value to the SVG attribute on mount and to the
 * inline style once it animates, so read both.
 */
const arcOffset = (): number => {
  const el = arc();
  return Number(el.style.strokeDashoffset || el.getAttribute('stroke-dashoffset') || NaN);
};

describe('RingIcon — arc length matches progress', () => {
  it('draws a full-circle dasharray at md', () => {
    render(<RingIcon icon={Bell} progress={0} label="Test" />);
    expect(Number(arc().getAttribute('stroke-dasharray'))).toBeCloseTo(MD_CIRCUMFERENCE, 3);
  });

  it.each([
    [0, 1],
    [0.25, 0.75],
    [0.5, 0.5],
    [0.75, 0.25],
    [1, 0],
  ])('progress %s leaves %s of the circumference as offset', (progress, remaining) => {
    render(<RingIcon icon={Bell} progress={progress} label="Test" />);
    expect(arcOffset()).toBeCloseTo(MD_CIRCUMFERENCE * remaining, 1);
  });

  // Each clamp case gets its own mount: with `initial={false}` Motion commits
  // the value on mount, whereas a rerender animates and would be read mid-tween.
  it('clamps progress above 1 to a full arc', () => {
    render(<RingIcon icon={Bell} progress={5} label="Test" />);
    expect(arcOffset()).toBeCloseTo(0, 1);
  });

  it('clamps negative progress to an empty arc', () => {
    render(<RingIcon icon={Bell} progress={-3} label="Test" />);
    expect(arcOffset()).toBeCloseTo(MD_CIRCUMFERENCE, 1);
  });

  it('starts the arc at 12 o’clock', () => {
    render(<RingIcon icon={Bell} progress={0.5} label="Test" />);
    expect(arc().getAttribute('transform')).toBe('rotate(-90 18 18)');
  });
});

describe('RingIcon — dots', () => {
  it('renders the right number of active and idle dots', () => {
    render(<RingIcon icon={Bell} dots={{ total: 3, active: 2 }} label="Test" />);
    expect(screen.getAllByTestId('ring-dot-active')).toHaveLength(2);
    expect(screen.getAllByTestId('ring-dot-idle')).toHaveLength(1);
  });

  it('renders 0 of 3', () => {
    render(<RingIcon icon={Bell} dots={{ total: 3, active: 0 }} label="Test" />);
    expect(screen.queryAllByTestId('ring-dot-active')).toHaveLength(0);
    expect(screen.getAllByTestId('ring-dot-idle')).toHaveLength(3);
  });

  it('renders 3 of 3', () => {
    render(<RingIcon icon={Bell} dots={{ total: 3, active: 3 }} label="Test" />);
    expect(screen.getAllByTestId('ring-dot-active')).toHaveLength(3);
    expect(screen.queryAllByTestId('ring-dot-idle')).toHaveLength(0);
  });

  it('omits the dot row when total is 0', () => {
    render(<RingIcon icon={Bell} dots={{ total: 0, active: 0 }} label="Test" />);
    expect(screen.queryByTestId('ring-dots')).not.toBeInTheDocument();
  });
});

describe('RingIcon — badge caps at 9+', () => {
  it.each([
    [1, '1'],
    [9, '9'],
    [10, '9+'],
    [250, '9+'],
  ])('badge %i renders as %s', (n, text) => {
    render(<RingIcon icon={Bell} badge={n} label="Test" />);
    expect(screen.getByTestId('ring-badge')).toHaveTextContent(text);
  });

  it('hides the badge at zero', () => {
    render(<RingIcon icon={Bell} badge={0} label="Test" />);
    expect(screen.queryByTestId('ring-badge')).not.toBeInTheDocument();
  });

  it('capBadge is pure', () => {
    expect(capBadge(0)).toBe('0');
    expect(capBadge(9)).toBe('9');
    expect(capBadge(10)).toBe('9+');
  });
});

describe('RingIcon — accessible name', () => {
  it('exposes the label on an img role', () => {
    render(<RingIcon icon={Bell} label="Activity: 3 unread notifications" />);
    expect(screen.getByRole('img', { name: 'Activity: 3 unread notifications' })).toBeVisible();
  });
});
