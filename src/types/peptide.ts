import { Timestamp } from "firebase/firestore";

// Master Peptides Database
export interface Peptide {
  id: string;
  name: string;
  description: string;
  category: string;
  dosage: string;
  reconstitution_instructions: string;
  storage_requirements: string;
  form: string;
  potency_dosage_range: string[];
  approved: boolean;
  rejected: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PeptideFormData {
  name: string;
  description: string;
  category: string;
  dosage: string;
  reconstitution_instructions: string;
  storage_requirements: string;
  form: string;
  potency_dosage_range: string[];
  approved: boolean;
}

// Educational Peptide Library
export interface PeptideLibraryEntry {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  mechanism: string;
  commonDoses: string;
  protocol: string;
  sideEffects: string;
  warnings: string;
  interactions: string;
  injectionAreas: string;
  isVisible: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface PeptideLibraryFormData {
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  mechanism: string;
  commonDoses: string;
  protocol: string;
  sideEffects: string;
  warnings: string;
  interactions: string;
  injectionAreas: string;
  isVisible: boolean;
}

// Categories
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

export const PEPTIDE_FORMS = [
  'Powder',
  'Liquid',
  'Tablet',
  'Capsule',
  'Injectable'
] as const;

