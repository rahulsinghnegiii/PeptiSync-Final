/**
 * Application constants and configuration
 */

export const COMPANY_INFO = {
  name: "Daymon Group LLC",
  legalName: "Daymon Group LLC",
  email: "support@peptisync.com",
  supportEmail: "support@peptisync.com",
  privacyEmail: "privacy@peptisync.com",
  responseTime: "24-48 hours",
  address: "United States",
  foundedYear: 2024,
};

export const CONTACT_INFO = {
  SUPPORT_EMAIL: "support@peptisync.com",
  PRIVACY_EMAIL: "privacy@peptisync.com",
  RESPONSE_TIME: "24-48 hours",
};

export const APP_LINKS = {
  appStore: "https://apps.apple.com/app/peptisync",
  googlePlay: "https://play.google.com/store/apps/details?id=com.peptisync",
  website: "https://peptisync.com",
};

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/peptisync",
  facebook: "https://facebook.com/peptisync",
  instagram: "https://instagram.com/peptisync",
  github: "https://github.com/peptisync",
};

export const MEDICAL_DISCLAIMER = {
  short: "PeptiSync is not medical advice. Consult your healthcare provider.",
  medium: "PeptiSync is not medical advice and is not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare provider.",
  full: `PeptiSync is designed for tracking and informational purposes only. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals regarding your health and wellness decisions.`,
};

// Approved vendors list (matches app)
export const APPROVED_VENDORS = [
  'Peptide Sciences',
  'Limitless Life',
  'Xpeptides',
  'Peptide Pros',
  'Core Peptides',
  'Tailor Made Compounding',
  'Empower Pharmacy',
  'Hallandale Pharmacy',
  'Wells Pharmacy Network',
];

// Plan tiers (matches app)
export const PLAN_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  PRO_PLUS: 'pro_plus',
  ELITE: 'elite',
} as const;

export const PLAN_HIERARCHY = ['free', 'basic', 'pro', 'pro_plus', 'elite'] as const;

export const BLOG_CATEGORIES = [
  'Tracking Tips',
  'Organization',
  'Recovery',
  'App Updates',
  'Vendor Insights',
  'Research',
  'Wellness',
  'Community'
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

export const CONTACT_SUBJECTS = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "feature", label: "Feature Request" },
  { value: "other", label: "Other" },
];

// Peptide categories (matches app)
export const PEPTIDE_CATEGORIES = [
  'Weight Loss',
  'Recovery',
  'Anti-aging',
  'Performance',
  'Growth',
  'Immunity',
  'Cognitive',
  'GH Axis',
  'Metabolic',
  'Sexual Wellness'
] as const;

export type PeptideCategory = typeof PEPTIDE_CATEGORIES[number];

// Peptide forms
export const PEPTIDE_FORMS = [
  'Powder',
  'Liquid',
  'Tablet',
  'Capsule',
  'Injectable'
] as const;

export type PeptideForm = typeof PEPTIDE_FORMS[number];

