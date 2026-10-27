import type { CompanyDraft } from './draft';

/**
 * Page strength.
 *
 * The first build counted filled fields — "4 of 6" — which treats a one-word
 * description as finished work. This scores *quality*: fields are weighted by
 * how much they do for the page, and the description scores on its length
 * rather than on merely existing.
 *
 * The tips are plain guidance. They deliberately quote no statistics, because
 * this project has no access to Mpuza's analytics and inventing a "pages with
 * a logo get 3× more views" number would be making something up.
 */

export interface StrengthFactor {
  key: keyof CompanyDraft | 'handle';
  label: string;
  /** Points this factor contributes when fully satisfied. */
  weight: number;
  /** 0–1. Partial credit is possible (description length). */
  score: number;
  /** Shown when score < 1. */
  tip: string;
  required: boolean;
}

export type StrengthBand = 'empty' | 'basic' | 'good' | 'strong';

export interface Strength {
  /** 0–100, rounded. */
  score: number;
  /** 0–1, for the ring. */
  ratio: number;
  band: StrengthBand;
  bandLabel: string;
  factors: StrengthFactor[];
  /** Highest-value unfinished factor, or null when everything is done. */
  nextBest: StrengthFactor | null;
  /** Required fields that are still missing. */
  blocking: StrengthFactor[];
}

const DESCRIPTION_FULL = 120;
const DESCRIPTION_MIN = 40;

/** 0 below the floor, ramping to 1 at the target length. */
const lengthScore = (text: string): number => {
  const n = text.trim().length;
  if (n === 0) return 0;
  if (n >= DESCRIPTION_FULL) return 1;
  if (n <= DESCRIPTION_MIN) return 0.35;
  return 0.35 + (0.65 * (n - DESCRIPTION_MIN)) / (DESCRIPTION_FULL - DESCRIPTION_MIN);
};

export const computeStrength = (d: CompanyDraft, handle: string): Strength => {
  const factors: StrengthFactor[] = [
    {
      key: 'name',
      label: 'Company name',
      weight: 15,
      score: d.name.trim() ? 1 : 0,
      tip: 'Your name is what people search for. Add it first.',
      required: true,
    },
    {
      key: 'industry',
      label: 'Industry',
      weight: 12,
      score: d.industry ? 1 : 0,
      tip: 'Industry decides which searches your page turns up in.',
      required: true,
    },
    {
      key: 'location',
      label: 'Location',
      weight: 12,
      score: d.location ? 1 : 0,
      tip: 'Location helps nearby candidates find you.',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      weight: 22,
      score: lengthScore(d.description),
      tip:
        d.description.trim().length === 0
          ? 'Say what your company does, in a sentence or two.'
          : `Add a little more — ${DESCRIPTION_FULL} characters reads as a real introduction.`,
      required: false,
    },
    {
      key: 'logoUrl',
      label: 'Logo',
      weight: 14,
      score: d.logoUrl ? 1 : 0,
      tip: 'A logo makes your page recognisable in lists and search results.',
      required: false,
    },
    {
      key: 'handle',
      label: 'Page address',
      weight: 10,
      score: handle.trim().length >= 3 ? 1 : 0,
      tip: 'Claim a short mpuza.com address you can share.',
      required: false,
    },
    {
      key: 'website',
      label: 'Website',
      weight: 8,
      score: d.noWebsite || d.website.trim() ? 1 : 0,
      tip: 'Link your site, or tick “No website” so the page stops asking.',
      required: false,
    },
    {
      key: 'slogan',
      label: 'Slogan',
      weight: 7,
      score: d.slogan.trim() ? 1 : 0,
      tip: 'One line that says what you stand for.',
      required: false,
    },
  ];

  const total = factors.reduce((t, f) => t + f.weight, 0);
  const earned = factors.reduce((t, f) => t + f.weight * f.score, 0);
  const ratio = total === 0 ? 0 : earned / total;
  const score = Math.round(ratio * 100);

  const unfinished = factors
    .filter((f) => f.score < 1)
    .sort((a, b) => b.weight * (1 - b.score) - a.weight * (1 - a.score));

  const band: StrengthBand =
    score === 0 ? 'empty' : score < 45 ? 'basic' : score < 80 ? 'good' : 'strong';

  return {
    score,
    ratio,
    band,
    bandLabel: { empty: 'Empty', basic: 'Basic', good: 'Good', strong: 'Strong' }[band],
    factors,
    nextBest: unfinished[0] ?? null,
    blocking: factors.filter((f) => f.required && f.score < 1),
  };
};

/**
 * Slug from a company name: lowercase, accents stripped, non-alphanumerics
 * collapsed to single hyphens.
 */
export const slugify = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
