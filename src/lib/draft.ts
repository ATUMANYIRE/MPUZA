export interface CompanyDraft {
  name: string;
  website: string;
  noWebsite: boolean;
  industry: string | null;
  location: string | null;
  slogan: string;
  companyType: string | null;
  description: string;
  logoUrl: string | null;
  /** The page's public address: mpuza.com/c/<handle>. */
  handle: string;
  /** Dominant colour pulled from the uploaded logo, once accepted. */
  brandColor: string | null;
  /** A readable text colour to pair with brandColor. */
  brandOnColor: string | null;
}

export const emptyDraft: CompanyDraft = {
  name: '',
  website: '',
  noWebsite: false,
  industry: null,
  location: null,
  slogan: '',
  companyType: null,
  description: '',
  logoUrl: null,
  handle: '',
  brandColor: null,
  brandOnColor: null,
};

/**
 * The three sections the real page shows, in its order:
 * Company logo → Company Identification → Profile Details.
 * Progress tracks sections completed, which is what the sticky bar reports.
 */
export const sectionProgress = (d: CompanyDraft) => {
  const checks = [
    { label: 'Logo', done: d.logoUrl !== null },
    { label: 'Name', done: d.name.trim().length > 0 },
    { label: 'Website', done: d.noWebsite || d.website.trim().length > 0 },
    { label: 'Industry', done: d.industry !== null },
    { label: 'Location', done: d.location !== null },
    { label: 'Description', done: d.description.trim().length > 0 },
  ];
  const done = checks.filter((c) => c.done).length;
  return { done, total: checks.length, ratio: done / checks.length, checks };
};

/** The minimum the real form needs before "Create page" can do anything. */
export const canSubmit = (d: CompanyDraft) =>
  d.name.trim().length > 0 && d.industry !== null && d.location !== null;

// Option lists. OBSERVED values from the screenshots are first in each list;
// the rest are plausible fillers so the sheets have something to search.
export const INDUSTRIES = [
  'Computer Software',
  'Accounting',
  'Agriculture',
  'Architecture & Planning',
  'Banking',
  'Biotechnology',
  'Civil Engineering',
  'Construction',
  'Consumer Goods',
  'Education Management',
  'Financial Services',
  'Government Administration',
  'Health, Wellness & Fitness',
  'Higher Education',
  'Hospital & Health Care',
  'Information Technology & Services',
  'Insurance',
  'Internet',
  'Legal Services',
  'Logistics & Supply Chain',
  'Management Consulting',
  'Marketing & Advertising',
  'Mining & Metals',
  'Non-profit Organization Management',
  'Pharmaceuticals',
  'Real Estate',
  'Renewables & Environment',
  'Research',
  'Retail',
  'Telecommunications',
  'Transportation',
  'Utilities',
] as const;

export const LOCATIONS = [
  'Rwanda',
  'Burundi',
  'Cameroon',
  'Côte d’Ivoire',
  'Democratic Republic of the Congo',
  'Egypt',
  'Ethiopia',
  'Ghana',
  'Kenya',
  'Morocco',
  'Mozambique',
  'Nigeria',
  'Senegal',
  'South Africa',
  'Tanzania',
  'Togo',
  'Uganda',
  'Zambia',
  'Zimbabwe',
] as const;

export const COMPANY_TYPES = [
  'no profit',
  'Public company',
  'Private company',
  'Government agency',
  'Partnership',
  'Sole proprietorship',
  'Self-employed',
  'Educational institution',
] as const;
