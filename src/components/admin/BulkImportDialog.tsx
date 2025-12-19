import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useBulkPeptideImport } from "@/hooks/useBulkPeptideImport";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BulkImportDialog = ({ open, onOpenChange, onSuccess }: BulkImportDialogProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importing, progress, total, importPeptides } = useBulkPeptideImport();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFiles) return;

    const result = await importPeptides(selectedFiles);
    setImportResult(result);
    
    if (result.success > 0) {
      onSuccess();
      // Reset after a delay
      setTimeout(() => {
        setSelectedFiles(null);
        setImportResult(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setSelectedFiles(null);
      setImportResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    }
  };

  const progressPercentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Peptides</DialogTitle>
          <DialogDescription>
            Upload text files containing peptide information to import them into the library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="peptide-files"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Text files containing peptide data (any format)
                  </p>
                </div>
                <input
                  id="peptide-files"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".txt,text/plain,*"
                  onChange={handleFileSelect}
                  disabled={importing}
                />
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Files ({selectedFiles.length}):</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Importing peptides...</span>
                <span className="font-medium">{progress} / {total}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Results */}
          {importResult && !importing && (
            <div className="space-y-3">
              {importResult.success > 0 && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Successfully imported {importResult.success} peptides
                  </AlertDescription>
                </Alert>
              )}

              {importResult.skipped > 0 && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    Skipped {importResult.skipped} duplicate peptides
                  </AlertDescription>
                </Alert>
              )}

              {importResult.failed > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to import {importResult.failed} peptides
                    {importResult.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs">View errors</summary>
                        <div className="mt-2 text-xs max-h-32 overflow-y-auto">
                          {importResult.errors.slice(0, 5).map((error: string, i: number) => (
                            <div key={i} className="mt-1">• {error}</div>
                          ))}
                          {importResult.errors.length > 5 && (
                            <div className="mt-1">... and {importResult.errors.length - 5} more</div>
                          )}
                        </div>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={importing}
            >
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFiles || importing || (importResult && importResult.success > 0)}
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Peptides
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Instructions:</strong> Upload text files containing peptide data (files 1-7 from peptide library).
              Each peptide should have: Name, Category, Description, Dosing Ranges, Protocol, Administration, Notes, and Disclaimers.
              Duplicate peptides (by name) will be automatically skipped.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
};

