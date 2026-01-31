/**
 * Auto Import Progress Dialog
 * 
 * Shows real-time progress during auto-import of peptides
 * from vendor offers to peptide library
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, AlertCircle, Loader2, CheckCheck, X } from 'lucide-react';
import type { AutoImportResult, PeptideCandidate } from '@/hooks/useAutoImportPeptides';

interface AutoImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanning: boolean;
  importing: boolean;
  progress: number;
  total: number;
  currentPeptide: string;
  candidates: PeptideCandidate[];
  skippedCount: number;
  result: AutoImportResult | null;
  onImportSelected: (selected: PeptideCandidate[]) => void;
}

export const AutoImportDialog = ({
  open,
  onOpenChange,
  scanning,
  importing,
  progress,
  total,
  currentPeptide,
  candidates,
  skippedCount,
  result,
  onImportSelected,
}: AutoImportDialogProps) => {
  const progressPercent = total > 0 ? (progress / total) * 100 : 0;
  const [selectedPeptides, setSelectedPeptides] = useState<Set<string>>(new Set());

  // Initialize all peptides as selected when candidates change
  useEffect(() => {
    if (candidates.length > 0) {
      setSelectedPeptides(new Set(candidates.map(c => c.normalizedName)));
    }
  }, [candidates]);

  const togglePeptide = (peptideName: string) => {
    const newSelected = new Set(selectedPeptides);
    if (newSelected.has(peptideName)) {
      newSelected.delete(peptideName);
    } else {
      newSelected.add(peptideName);
    }
    setSelectedPeptides(newSelected);
  };

  const selectAll = () => {
    setSelectedPeptides(new Set(candidates.map(c => c.normalizedName)));
  };

  const deselectAll = () => {
    setSelectedPeptides(new Set());
  };

  const handleImport = () => {
    const selected = candidates.filter(c => selectedPeptides.has(c.normalizedName));
    onImportSelected(selected);
  };

  const isScanning = scanning && !importing && !result;
  const isReviewing = !scanning && !importing && !result && candidates.length > 0;
  const isImporting = importing;
  const isDone = !scanning && !importing && result !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {importing && <Loader2 className="w-5 h-5 animate-spin" />}
            Auto Import Peptides
          </DialogTitle>
          <DialogDescription>
            Importing new peptides from vendor offers into the educational library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Scanning Progress */}
          {isScanning && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Scanning</span>
                <span className="font-medium">
                  {progress} / {total}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              {currentPeptide && (
                <div className="text-sm text-muted-foreground">
                  Processing: <span className="font-medium text-foreground">{currentPeptide}</span>
                </div>
              )}
            </div>
          )}

          {/* Review Stage - Select peptides to import */}
          {isReviewing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Found {candidates.length} New Peptides</h4>
                  {skippedCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {skippedCount} peptides already exist (skipped)
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Keep All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Discard All
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-3">
                  {candidates.map((candidate) => {
                    const isSelected = selectedPeptides.has(candidate.normalizedName);
                    return (
                      <div
                        key={candidate.normalizedName}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                            : 'bg-muted/30 border-muted'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => togglePeptide(candidate.normalizedName)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-sm">{candidate.normalizedName}</h5>
                            <Badge variant="secondary" className="text-xs">
                              {candidate.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {candidate.data.shortDescription}
                          </p>
                          {candidate.originalNames.length > 1 && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Variants found:</span>{' '}
                              {candidate.originalNames.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="text-muted-foreground">
                  {selectedPeptides.size} of {candidates.length} selected
                </span>
              </div>
            </div>
          )}

          {/* Importing Progress */}
          {isImporting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Importing</span>
                <span className="font-medium">
                  {progress} / {total}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              {currentPeptide && (
                <div className="text-sm text-muted-foreground">
                  Saving: <span className="font-medium text-foreground">{currentPeptide}</span>
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          {isDone && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Total Found</div>
                  <div className="text-2xl font-bold">{result.totalFound}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Already Exist</div>
                  <div className="text-2xl font-bold text-blue-600">{result.skipped}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">
                      Successfully Imported
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{result.success}</div>
                </div>

                {result.failed > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900 dark:text-red-100">
                        Failed to Import
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                  </div>
                )}
              </div>

              {/* New Peptides List */}
              {result.newPeptides.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Newly Imported Peptides (Hidden for Review)
                  </div>
                  <ScrollArea className="h-[150px] rounded-md border p-3">
                    <div className="space-y-2">
                      {result.newPeptides.map((peptide, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <span>{peptide}</span>
                          <Badge variant="outline" className="text-xs">
                            Hidden
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Errors List */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <XCircle className="w-4 h-4" />
                    Errors
                  </div>
                  <ScrollArea className="h-[120px] rounded-md border border-red-200 bg-red-50/50 dark:bg-red-950/10 p-3">
                    <div className="space-y-2">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-900 dark:text-red-100">
                          {error.peptide && <span className="font-medium">{error.peptide}: </span>}
                          <span className="text-red-700 dark:text-red-300">{error.error}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Next Steps */}
              {result.success > 0 && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 p-4">
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Next Steps:
                    </div>
                    <ul className="text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                      <li>Review imported peptides in the table below</li>
                      <li>Edit entries to add detailed information</li>
                      <li>Toggle visibility to make them public when ready</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!isScanning && !isReviewing && !isImporting && !isDone && (
            <div className="text-center text-muted-foreground py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Scanning vendor offers for new peptides...</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isReviewing && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedPeptides.size === 0}
            >
              Import {selectedPeptides.size} Selected
            </Button>
          </DialogFooter>
        )}

        {isDone && result && (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

