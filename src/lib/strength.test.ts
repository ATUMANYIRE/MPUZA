import { describe, expect, it } from 'vitest';
import { computeStrength, slugify } from './strength';
import { emptyDraft, type CompanyDraft } from './draft';

const draft = (over: Partial<CompanyDraft> = {}): CompanyDraft => ({ ...emptyDraft, ...over });

const FULL_DESCRIPTION =
  'Internory is the enterprise platform where ambitious students meet the world’s top ' +
  'companies, with pipelines, interviews and analytics.';

describe('computeStrength', () => {
  it('scores an empty draft at zero', () => {
    const s = computeStrength(draft(), '');
    expect(s.score).toBe(0);
    expect(s.band).toBe('empty');
  });

  it('scores a complete draft at 100', () => {
    const s = computeStrength(
      draft({
        name: 'INTERNORY',
        industry: 'Computer Software',
        location: 'Rwanda',
        description: FULL_DESCRIPTION,
        logoUrl: 'blob:x',
        website: 'https://intern-ory.com',
        slogan: 'Internships, rebuilt for the best.',
      }),
      'internory',
    );
    expect(s.score).toBe(100);
    expect(s.band).toBe('strong');
    expect(s.nextBest).toBeNull();
  });

  it('gives a short description partial credit, not full', () => {
    const short = computeStrength(draft({ description: 'We hire.' }), '');
    const long = computeStrength(draft({ description: FULL_DESCRIPTION }), '');
    const shortFactor = short.factors.find((f) => f.key === 'description');
    const longFactor = long.factors.find((f) => f.key === 'description');
    expect(shortFactor!.score).toBeGreaterThan(0);
    expect(shortFactor!.score).toBeLessThan(1);
    expect(longFactor!.score).toBe(1);
  });

  it('names the highest-value unfinished factor as nextBest', () => {
    // Everything missing: description carries the most weight (22).
    expect(computeStrength(draft(), '').nextBest?.key).toBe('description');
  });

  it('reports required fields that are still missing', () => {
    const s = computeStrength(draft({ name: 'INTERNORY' }), '');
    expect(s.blocking.map((f) => f.key)).toEqual(['industry', 'location']);
  });

  it('counts "no website" as satisfying the website factor', () => {
    const s = computeStrength(draft({ noWebsite: true }), '');
    expect(s.factors.find((f) => f.key === 'website')!.score).toBe(1);
  });

  it('moves through the bands as the draft fills in', () => {
    expect(computeStrength(draft({ name: 'X' }), '').band).toBe('basic');
    expect(
      computeStrength(
        draft({ name: 'X', industry: 'Retail', location: 'Rwanda', logoUrl: 'blob:x' }),
        'x-co',
      ).band,
    ).toBe('good');
  });

  it('keeps the ratio and the percentage in step', () => {
    const s = computeStrength(draft({ name: 'X', industry: 'Retail' }), '');
    expect(s.score).toBe(Math.round(s.ratio * 100));
    expect(s.ratio).toBeGreaterThan(0);
    expect(s.ratio).toBeLessThan(1);
  });
});

describe('slugify', () => {
  it.each([
    ['INTERNORY', 'internory'],
    ['Côte Group', 'cote-group'],
    ['  Mpuza   Inc. ', 'mpuza-inc'],
    ['A&B / C', 'a-b-c'],
    ['---', ''],
  ])('%s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it('caps length at 30 characters', () => {
    expect(slugify('a'.repeat(80))).toHaveLength(30);
  });
});
