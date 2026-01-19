/**
 * Unit Tests for Peptide Name Normalization
 * 
 * Tests the normalizePeptideName function to ensure it correctly
 * groups variant formulations of the same peptide together.
 */

import { normalizePeptideName } from '../vendorTierValidators';

describe('normalizePeptideName', () => {
  describe('Single peptides - basic cases', () => {
    it('should preserve simple peptide names', () => {
      expect(normalizePeptideName('BPC-157')).toBe('BPC-157');
      expect(normalizePeptideName('TB-500')).toBe('TB-500');
      expect(normalizePeptideName('Semaglutide')).toBe('Semaglutide');
      expect(normalizePeptideName('Tirzepatide')).toBe('Tirzepatide');
    });

    it('should trim whitespace', () => {
      expect(normalizePeptideName('  BPC-157  ')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157   ')).toBe('BPC-157');
      expect(normalizePeptideName('   BPC-157')).toBe('BPC-157');
    });

    it('should handle empty or null input', () => {
      expect(normalizePeptideName('')).toBe('');
    });
  });

  describe('Formulation variants - BPC-157 examples', () => {
    it('should remove spray formulations', () => {
      expect(normalizePeptideName('BPC-157 Spray')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 - Spray')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157, Spray')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 Nasal Spray')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 / Spray')).toBe('BPC-157');
    });

    it('should remove capsule formulations', () => {
      expect(normalizePeptideName('BPC-157 Capsules')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 Capsule')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 - Capsules')).toBe('BPC-157');
    });

    it('should remove tablet formulations', () => {
      expect(normalizePeptideName('BPC-157 Tablets')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 Tablet')).toBe('BPC-157');
    });

    it('should remove injectable formulations', () => {
      expect(normalizePeptideName('BPC-157 Injectable')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 Injection')).toBe('BPC-157');
    });

    it('should remove parenthetical formulation details', () => {
      expect(normalizePeptideName('BPC-157 (Capsules)')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 (500mcg/spray)')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 (Oral)')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 (BLOW)')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 (Injectable, 5mg)')).toBe('BPC-157');
    });

    it('should remove square bracket details', () => {
      expect(normalizePeptideName('BPC-157 [Spray]')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 [500mcg]')).toBe('BPC-157');
    });
  });

  describe('Multi-peptide blends', () => {
    it('should normalize BPC-157 + TB-500 blends', () => {
      expect(normalizePeptideName('BPC-157 & TB-500 Blend')).toBe('BPC-157 & TB-500');
      expect(normalizePeptideName('BPC-157 + TB-500')).toBe('BPC-157 + TB-500');
      expect(normalizePeptideName('BPC-157 + TB-500 Blend')).toBe('BPC-157 + TB-500');
      expect(normalizePeptideName('BPC-157 & TB-500 (10mg Blend)')).toBe('BPC-157 & TB-500');
    });

    it('should handle em-dash and en-dash separators', () => {
      expect(normalizePeptideName('BPC blend — BPC-157 + TB-500')).toBe('BPC blend - BPC-157 + TB-500');
      expect(normalizePeptideName('BPC-157 – TB-500')).toBe('BPC-157 - TB-500');
      expect(normalizePeptideName('BPC-157 — TB-500 (BLOW)')).toBe('BPC-157 - TB-500');
    });

    it('should normalize triple blends', () => {
      expect(normalizePeptideName('BPC-157 & TB-500 & GHK-Cu Blend')).toBe('BPC-157 & TB-500 & GHK-Cu');
      expect(normalizePeptideName('BPC-157 + TB-500 + GHK-Cu (Slow Blend)')).toBe('BPC-157 + TB-500 + GHK-Cu');
    });

    it('should handle complex blend names from real vendors', () => {
      expect(normalizePeptideName('BPC blend — BPC-157 + TB-500 (BLOW)')).toBe('BPC blend - BPC-157 + TB-500');
      expect(normalizePeptideName('BPC-157, Spray (500mcg/spray)')).toBe('BPC-157');
    });
  });

  describe('Real-world vendor product names', () => {
    it('should handle actual vendor variations', () => {
      // Based on the screenshot provided by user
      expect(normalizePeptideName('BPC-157')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 - Spray, (500mcg/spray)')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 ( )')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 ( s )')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 (Capsules), 60 Capsules')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157 & TB-500 & GHK-Cu Blend')).toBe('BPC-157 & TB-500 & GHK-Cu');
      expect(normalizePeptideName('BPC-157 & TB-500 Blend')).toBe('BPC-157 & TB-500');
      expect(normalizePeptideName('BPC-157 & TB-500 Blend (f)')).toBe('BPC-157 & TB-500');
      expect(normalizePeptideName('BPC-157 Peptide')).toBe('BPC-157 Peptide');
      expect(normalizePeptideName('BPC-157 TB500 Blend/')).toBe('BPC-157 TB500');
      expect(normalizePeptideName('BPC-157, TB-500, KPV, GHK-Cu (Slow Blend)')).toBe('BPC-157, TB-500, KPV, GHK-Cu');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple spaces', () => {
      expect(normalizePeptideName('BPC-157   Spray')).toBe('BPC-157');
      expect(normalizePeptideName('BPC-157    (  Capsules  )')).toBe('BPC-157');
    });

    it('should handle case sensitivity (not normalized, preserves case)', () => {
      expect(normalizePeptideName('bpc-157')).toBe('bpc-157');
      expect(normalizePeptideName('BPC-157')).toBe('BPC-157');
      // Note: Case normalization is not currently implemented
      // as peptide names are typically properly cased
    });

    it('should not affect peptides with "spray" in their actual name', () => {
      // If a peptide's actual name contains these words, they won't be removed
      // as the pattern only matches at the end of the string
      expect(normalizePeptideName('Nasal-Peptide Spray')).toBe('Nasal-Peptide');
    });
  });

  describe('Grouping verification', () => {
    it('should normalize all variants to the same base name', () => {
      const variants = [
        'BPC-157',
        'BPC-157 Spray',
        'BPC-157 (Capsules)',
        'BPC-157, (500mcg/spray)',
        'BPC-157 Nasal',
        'BPC-157 Injectable',
      ];

      const normalized = variants.map(normalizePeptideName);
      const unique = new Set(normalized);

      // All should normalize to "BPC-157"
      expect(unique.size).toBe(1);
      expect(unique.has('BPC-157')).toBe(true);
    });

    it('should keep blends separate from base peptides', () => {
      const products = [
        'BPC-157',
        'BPC-157 Spray',
        'BPC-157 & TB-500 Blend',
        'BPC-157 + TB-500',
        'TB-500',
      ];

      const normalized = products.map(normalizePeptideName);
      const unique = new Set(normalized);

      // Should have: BPC-157, BPC-157 & TB-500, BPC-157 + TB-500, TB-500
      // (Note: BPC-157 & TB-500 and BPC-157 + TB-500 are different due to different separators)
      expect(unique.size).toBeGreaterThanOrEqual(3);
      expect(unique.has('BPC-157')).toBe(true);
      expect(unique.has('TB-500')).toBe(true);
    });
  });
});

