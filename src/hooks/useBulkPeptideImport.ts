import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";
import type { PeptideLibraryFormData } from "@/types/peptide";

interface ParsedPeptide {
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
}

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export function useBulkPeptideImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const parsePeptideText = (text: string): ParsedPeptide[] => {
    const peptides: ParsedPeptide[] = [];
    
    // Remove document header (first line starting with "PeptiSync –")
    const lines = text.split('\n');
    let contentStart = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('PeptiSync –') || lines[i].trim().startsWith('PeptiSync—')) {
        contentStart = i + 1;
        break;
      }
    }
    const cleanedText = lines.slice(contentStart).join('\n');
    
    // Split by peptide entries (each peptide starts with a name followed by Category:)
    const entries = cleanedText.split(/\n(?=[A-Z][^\n]*\nCategory:)/);
    
    for (const entry of entries) {
      if (!entry.trim()) continue;
      
      const lines = entry.split('\n').filter(line => line.trim());
      if (lines.length < 3) continue;
      
      // Extract name (first line)
      const name = lines[0].trim();
      if (!name) continue;
      
      // Extract category
      const categoryLine = lines.find(l => l.startsWith('Category:'));
      const categoryMatch = categoryLine?.match(/Category:\s*(.+)/);
      const categoryFull = categoryMatch ? categoryMatch[1].trim() : 'General';
      
      // Extract primary category (first part before •)
      const category = categoryFull.split('•')[0].trim();
      
      // Extract description
      const descIndex = lines.findIndex(l => l.startsWith('Description:'));
      let description = '';
      if (descIndex !== -1) {
        const descLines: string[] = [];
        for (let i = descIndex + 1; i < lines.length; i++) {
          if (lines[i].match(/^(Commonly Reported|Typical Protocol|Administration|Notes|Disclaimer|Medical Safety)/)) {
            break;
          }
          descLines.push(lines[i]);
        }
        description = descLines.join(' ').trim();
      }
      
      // Create short description (first 200 chars)
      const shortDescription = description.length > 200 
        ? description.substring(0, 197) + '...' 
        : description;
      
      // Extract common doses
      const dosesIndex = lines.findIndex(l => 
        l.includes('Commonly Reported Dosing') || 
        l.includes('Commonly Reported Dosing')
      );
      let commonDoses = '';
      if (dosesIndex !== -1) {
        const dosesLines: string[] = [];
        for (let i = dosesIndex + 1; i < lines.length; i++) {
          if (lines[i].match(/^(Typical Protocol|Administration|Notes|Disclaimer)/)) {
            break;
          }
          if (lines[i].startsWith('•') || lines[i].startsWith('• ')) {
            dosesLines.push(lines[i].replace(/^•\s*/, '').trim());
          }
        }
        commonDoses = dosesLines.join('\n');
      }
      
      // Extract protocol
      const protocolIndex = lines.findIndex(l => 
        l.includes('Typical Protocol') || 
        l.includes('Typical Protocol')
      );
      let protocol = '';
      if (protocolIndex !== -1) {
        const protocolLines: string[] = [];
        for (let i = protocolIndex + 1; i < lines.length; i++) {
          if (lines[i].match(/^(Administration|Notes|Disclaimer)/)) {
            break;
          }
          if (lines[i].startsWith('•') || lines[i].startsWith('• ')) {
            protocolLines.push(lines[i].replace(/^•\s*/, '').trim());
          }
        }
        protocol = protocolLines.join('\n');
      }
      
      // Extract administration/injection areas
      const adminIndex = lines.findIndex(l => 
        l.startsWith('Administration:') || 
        l.startsWith('Administration:')
      );
      let injectionAreas = '';
      if (adminIndex !== -1) {
        const adminLines: string[] = [];
        for (let i = adminIndex + 1; i < lines.length; i++) {
          if (lines[i].match(/^(Notes|Disclaimer|Medical Safety)/)) {
            break;
          }
          if (lines[i].startsWith('•') || lines[i].startsWith('• ')) {
            adminLines.push(lines[i].replace(/^•\s*/, '').trim());
          }
        }
        injectionAreas = adminLines.join('\n');
      }
      
      // Extract notes (for side effects and interactions)
      const notesIndex = lines.findIndex(l => 
        l.startsWith('Notes:') || 
        l.startsWith('Notes:')
      );
      let sideEffects = '';
      let interactions = '';
      if (notesIndex !== -1) {
        const notesLines: string[] = [];
        for (let i = notesIndex + 1; i < lines.length; i++) {
          if (lines[i].match(/^(Disclaimer|Medical Safety)/)) {
            break;
          }
          if (lines[i].startsWith('•') || lines[i].startsWith('• ')) {
            const note = lines[i].replace(/^•\s*/, '').trim();
            notesLines.push(note);
            
            // Categorize notes
            if (note.toLowerCase().includes('side effect') || 
                note.toLowerCase().includes('nausea') || 
                note.toLowerCase().includes('discomfort') ||
                note.toLowerCase().includes('sensitivity')) {
              sideEffects += (sideEffects ? '\n' : '') + note;
            }
            if (note.toLowerCase().includes('paired with') || 
                note.toLowerCase().includes('combined') || 
                note.toLowerCase().includes('stacked')) {
              interactions += (interactions ? '\n' : '') + note;
            }
          }
        }
        
        // If no specific categorization, use all notes as general info
        if (!sideEffects) {
          sideEffects = notesLines.slice(0, 2).join('\n');
        }
        if (!interactions) {
          interactions = notesLines.filter(n => 
            n.toLowerCase().includes('with') || 
            n.toLowerCase().includes('during')
          ).join('\n');
        }
      }
      
      // Extract warnings (disclaimer + medical safety)
      const disclaimerIndex = lines.findIndex(l => l.startsWith('Disclaimer:'));
      const medicalIndex = lines.findIndex(l => l.startsWith('Medical Safety'));
      let warnings = '';
      
      if (disclaimerIndex !== -1) {
        for (let i = disclaimerIndex + 1; i < lines.length; i++) {
          if (lines[i].startsWith('Medical Safety')) break;
          warnings += lines[i] + ' ';
        }
      }
      
      if (medicalIndex !== -1 && medicalIndex + 1 < lines.length) {
        warnings += '\n\n' + lines[medicalIndex + 1];
      }
      
      warnings = warnings.trim();
      
      // Extract mechanism from description
      let mechanism = '';
      const mechanismKeywords = ['acts on', 'interacts with', 'targets', 'stimulates', 'promotes', 'encourages', 'derived from', 'fragment of'];
      const descSentences = description.split('. ');
      for (const sentence of descSentences) {
        if (mechanismKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
          mechanism = sentence.trim();
          break;
        }
      }
      
      if (!mechanism && descSentences.length > 1) {
        mechanism = descSentences[1].trim();
      }
      
      peptides.push({
        name,
        category,
        shortDescription,
        description,
        mechanism: mechanism || description.split('.')[0] + '.',
        commonDoses: commonDoses || 'Consult healthcare provider for appropriate dosing.',
        protocol: protocol || 'Follow healthcare provider guidance.',
        sideEffects: sideEffects || 'Varies by individual. Consult healthcare provider.',
        warnings: warnings || 'This information is for educational purposes only. Always consult a licensed healthcare professional.',
        interactions: interactions || 'May interact with other peptides or medications. Consult healthcare provider.',
        injectionAreas: injectionAreas || 'Subcutaneous injection. Consult healthcare provider for proper administration.',
      });
    }
    
    return peptides;
  };

  const importPeptides = async (files: FileList): Promise<ImportResult> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to import peptides.");
      return { success: 0, failed: 0, skipped: 0, errors: ["Not authenticated"] };
    }

    setImporting(true);
    const result: ImportResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    try {
      // Read all files
      const allPeptides: ParsedPeptide[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();
        const parsed = parsePeptideText(text);
        allPeptides.push(...parsed);
      }

      setTotal(allPeptides.length);
      
      // Check for existing peptides to avoid duplicates
      const existingNames = new Set<string>();
      const peptidesRef = collection(db, "peptide_library");
      const existingSnapshot = await getDocs(peptidesRef);
      existingSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.name) {
          existingNames.add(data.name.toLowerCase());
        }
      });

      // Import peptides in batches
      for (let i = 0; i < allPeptides.length; i++) {
        const peptide = allPeptides[i];
        setProgress(i + 1);

        // Skip if already exists
        if (existingNames.has(peptide.name.toLowerCase())) {
          result.skipped++;
          continue;
        }

        try {
          const peptideData: PeptideLibraryFormData & { createdBy: string; createdAt: any; updatedAt: any } = {
            ...peptide,
            isVisible: true,
            createdBy: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          await addDoc(peptidesRef, peptideData);
          result.success++;
        } catch (error: any) {
          console.error(`Failed to import ${peptide.name}:`, error);
          result.failed++;
          result.errors.push(`${peptide.name}: ${error.message}`);
        }

        // Small delay to avoid rate limiting
        if (i % 10 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Show results
      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} peptides!`);
      }
      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} duplicate peptides.`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} peptides.`);
      }

    } catch (error: any) {
      console.error("Import error:", error);
      toast.error("Failed to import peptides: " + error.message);
      result.errors.push(error.message);
    } finally {
      setImporting(false);
      setProgress(0);
      setTotal(0);
    }

    return result;
  };

  return {
    importing,
    progress,
    total,
    importPeptides,
  };
}

