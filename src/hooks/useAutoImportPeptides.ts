/**
 * Auto Import Peptides Hook
 * 
 * Automatically imports new peptides from vendor_offers collection
 * into the peptide_library collection. Handles:
 * - Peptide name normalization
 * - Duplicate detection
 * - AI-powered detail fetching with fallback to placeholders
 * - Category inference
 */

import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { normalizePeptideName } from '@/lib/vendorTierValidators';
import type { PeptideLibraryFormData } from '@/types/peptide';

// Category inference patterns
const CATEGORY_PATTERNS: Record<string, string[]> = {
  'Recovery': ['bpc', 'tb-500', 'thymosin beta', 'ghk-cu', 'ghk'],
  'Growth': ['igf', 'cjc', 'ipamorelin', 'ghrp', 'hexarelin', 'sermorelin', 'follistatin'],
  'Weight Loss': ['aod', 'tesamorelin', 'semaglutide', 'tirzepatide'],
  'Immunity': ['thymosin alpha'],
  'Performance': ['melanotan', 'pt-141', 'mots-c', 'bremelanotide'],
  'Anti-aging': ['epitalon', 'epithalon'],
};

// Default placeholder data
const PLACEHOLDER_DATA = {
  shortDescription: 'Peptide information pending review',
  description: 'Detailed information for this peptide is being compiled. Please check back later.',
  mechanism: 'Mechanism of action to be documented',
  commonDoses: 'Consult healthcare provider for appropriate dosing',
  protocol: 'Follow healthcare provider guidance',
  sideEffects: 'Side effects profile under review',
  warnings: 'This information is for educational purposes only. Always consult a licensed healthcare professional.',
  interactions: 'Potential interactions to be documented',
  injectionAreas: 'Administration method to be documented',
};

export interface AutoImportResult {
  success: number;
  failed: number;
  skipped: number;
  totalFound: number;
  newPeptides: string[];
  errors: { peptide: string; error: string }[];
}

export interface PeptideCandidate {
  normalizedName: string;
  originalNames: string[];
  category: string;
  data: PeptideLibraryFormData;
}

interface PeptideCandidateInternal {
  normalizedName: string;
  originalNames: string[];
  category: string;
}

export function useAutoImportPeptides() {
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentPeptide, setCurrentPeptide] = useState('');

  /**
   * Infer category from peptide name
   */
  const inferCategory = (peptideName: string): string => {
    const lowerName = peptideName.toLowerCase();
    
    for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerName.includes(pattern)) {
          return category;
        }
      }
    }
    
    return 'General';
  };

  /**
   * Attempt to fetch peptide details from AI/external API
   * Returns null if fetch fails (will use placeholders)
   */
  const fetchPeptideDetails = async (peptideName: string): Promise<Partial<PeptideLibraryFormData> | null> => {
    try {
      // TODO: In future, integrate with AI API (OpenAI, Anthropic, etc.)
      // For now, return null to use placeholders
      // Example integration point:
      // const response = await fetch('/api/peptide-details', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ peptideName })
      // });
      // if (response.ok) {
      //   return await response.json();
      // }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch details for ${peptideName}:`, error);
      return null;
    }
  };

  /**
   * Extract unique peptides from vendor offers
   */
  const extractUniquePeptides = async (): Promise<PeptideCandidateInternal[]> => {
    const offersRef = collection(db, 'vendor_offers');
    const offersSnapshot = await getDocs(offersRef);
    
    // Map to store normalized name -> original names
    const peptideMap = new Map<string, string[]>();
    
    offersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.peptide_name) {
        const normalized = normalizePeptideName(data.peptide_name);
        if (normalized) {
          const existing = peptideMap.get(normalized) || [];
          if (!existing.includes(data.peptide_name)) {
            existing.push(data.peptide_name);
          }
          peptideMap.set(normalized, existing);
        }
      }
    });
    
    // Convert to array of candidates
    const candidates: PeptideCandidateInternal[] = [];
    peptideMap.forEach((originalNames, normalizedName) => {
      candidates.push({
        normalizedName,
        originalNames,
        category: inferCategory(normalizedName),
      });
    });
    
    return candidates;
  };

  /**
   * Check which peptides already exist in the library
   */
  const checkExistingPeptides = async (candidates: PeptideCandidateInternal[]): Promise<Set<string>> => {
    const libraryRef = collection(db, 'peptide_library');
    const librarySnapshot = await getDocs(libraryRef);
    
    const existingNormalized = new Set<string>();
    librarySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        const normalized = normalizePeptideName(data.name);
        if (normalized) {
          existingNormalized.add(normalized.toLowerCase());
        }
      }
    });
    
    return existingNormalized;
  };

  /**
   * Prepare peptide data (without saving)
   */
  const preparePeptideData = async (
    candidate: PeptideCandidateInternal
  ): Promise<PeptideLibraryFormData> => {
    // Try to fetch details
    const fetchedDetails = await fetchPeptideDetails(candidate.normalizedName);
    
    // Build peptide data
    const peptideData: PeptideLibraryFormData = {
      name: candidate.normalizedName,
      category: fetchedDetails?.category || candidate.category,
      shortDescription: fetchedDetails?.shortDescription || PLACEHOLDER_DATA.shortDescription,
      description: fetchedDetails?.description || PLACEHOLDER_DATA.description,
      mechanism: fetchedDetails?.mechanism || PLACEHOLDER_DATA.mechanism,
      commonDoses: fetchedDetails?.commonDoses || PLACEHOLDER_DATA.commonDoses,
      protocol: fetchedDetails?.protocol || PLACEHOLDER_DATA.protocol,
      sideEffects: fetchedDetails?.sideEffects || PLACEHOLDER_DATA.sideEffects,
      warnings: fetchedDetails?.warnings || PLACEHOLDER_DATA.warnings,
      interactions: fetchedDetails?.interactions || PLACEHOLDER_DATA.interactions,
      injectionAreas: fetchedDetails?.injectionAreas || PLACEHOLDER_DATA.injectionAreas,
      isVisible: false, // Hidden by default for admin review
    };
    
    return peptideData;
  };

  /**
   * Save selected peptides to the database
   */
  const saveSelectedPeptides = async (
    selectedCandidates: PeptideCandidate[],
    userId: string
  ): Promise<AutoImportResult> => {
    setImporting(true);
    setProgress(0);
    setTotal(selectedCandidates.length);

    const result: AutoImportResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      totalFound: selectedCandidates.length,
      newPeptides: [],
      errors: [],
    };

    try {
      for (let i = 0; i < selectedCandidates.length; i++) {
        const candidate = selectedCandidates[i];
        setProgress(i + 1);
        setCurrentPeptide(candidate.normalizedName);

        try {
          const peptideData = {
            ...candidate.data,
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          const libraryRef = collection(db, 'peptide_library');
          await addDoc(libraryRef, peptideData);
          result.success++;
          result.newPeptides.push(candidate.normalizedName);
        } catch (error: any) {
          console.error(`Failed to import ${candidate.normalizedName}:`, error);
          result.failed++;
          result.errors.push({
            peptide: candidate.normalizedName,
            error: error.message,
          });
        }

        // Small delay to avoid rate limiting
        if (i % 10 === 0 && i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Show results
      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} peptides!`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} peptides.`);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Failed to import peptides: ' + error.message);
      result.errors.push({ peptide: '', error: error.message });
    } finally {
      setImporting(false);
      setProgress(0);
      setTotal(0);
      setCurrentPeptide('');
    }

    return result;
  };

  /**
   * Scan and prepare peptides for review (doesn't save yet)
   */
  const scanForNewPeptides = async (): Promise<{ candidates: PeptideCandidate[]; skipped: number }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('You must be logged in to scan peptides.');
      return { candidates: [], skipped: 0 };
    }

    setScanning(true);
    setProgress(0);
    setTotal(0);
    setCurrentPeptide('');

    try {
      // Step 1: Extract unique peptides from vendor offers
      toast.info('Scanning vendor offers for peptides...');
      const internalCandidates = await extractUniquePeptides();
      setTotal(internalCandidates.length);

      if (internalCandidates.length === 0) {
        toast.info('No peptides found in vendor offers.');
        setScanning(false);
        return { candidates: [], skipped: 0 };
      }

      // Step 2: Check which ones already exist
      toast.info('Checking for existing peptides...');
      const existingPeptides = await checkExistingPeptides(internalCandidates);

      // Step 3: Filter out existing peptides
      const newInternalCandidates = internalCandidates.filter(
        (candidate) => !existingPeptides.has(candidate.normalizedName.toLowerCase())
      );

      const skipped = internalCandidates.length - newInternalCandidates.length;

      if (newInternalCandidates.length === 0) {
        toast.info('All peptides already exist in the library.');
        setScanning(false);
        return { candidates: [], skipped };
      }

      // Step 4: Prepare data for each new peptide
      toast.info(`Preparing ${newInternalCandidates.length} new peptides...`);
      const candidates: PeptideCandidate[] = [];
      
      for (let i = 0; i < newInternalCandidates.length; i++) {
        const internalCandidate = newInternalCandidates[i];
        setProgress(i + 1);
        setCurrentPeptide(internalCandidate.normalizedName);

        const data = await preparePeptideData(internalCandidate);
        candidates.push({
          normalizedName: internalCandidate.normalizedName,
          originalNames: internalCandidate.originalNames,
          category: internalCandidate.category,
          data,
        });
      }

      toast.success(`Found ${candidates.length} new peptides ready for review!`);
      return { candidates, skipped };
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error('Failed to scan peptides: ' + error.message);
      return { candidates: [], skipped: 0 };
    } finally {
      setScanning(false);
      setProgress(0);
      setTotal(0);
      setCurrentPeptide('');
    }
  };

  return {
    scanning,
    importing,
    progress,
    total,
    currentPeptide,
    scanForNewPeptides,
    saveSelectedPeptides,
  };
}

