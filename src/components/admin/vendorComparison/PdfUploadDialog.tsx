/**
 * PDF Upload Dialog
 * 
 * Allows admins to upload PDF files and manually map pricing data
 * Phase 4: PDF Upload + Manual Entry
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Trash2, AlertCircle } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import type { VendorTier } from '@/types/vendorComparison';

interface PdfUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (fileUrl: string, fileName: string, tier: VendorTier) => void;
}

export const PdfUploadDialog = ({
  open,
  onOpenChange,
  onUploadComplete,
}: PdfUploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTier, setSelectedTier] = useState<VendorTier>('research');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidPDF(file)) {
        setSelectedFile(file);
      }
    }
  };

  const isValidPDF = (file: File): boolean => {
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    
    if (!isPDF) {
      toast.error('Please select a PDF file');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error('PDF file size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Upload PDF to Firebase Storage
      const timestamp = Date.now();
      const storageRef = ref(storage, `vendor_uploads/${timestamp}_${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const fileUrl = await getDownloadURL(storageRef);
      
      // Notify parent component
      onUploadComplete(fileUrl, selectedFile.name, selectedTier);
      
      // Reset state
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload PDF for Manual Entry</DialogTitle>
          <DialogDescription>
            Upload a PDF file containing vendor pricing. You'll manually extract and enter the data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tier Selection */}
          <div className="space-y-2">
            <Label htmlFor="pdf-tier">
              Select Tier <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedTier} onValueChange={(value) => setSelectedTier(value as VendorTier)}>
              <SelectTrigger id="pdf-tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="research">Research Peptides</SelectItem>
                <SelectItem value="telehealth">Telehealth & GLP Clinics</SelectItem>
                <SelectItem value="brand">Brand / Originator GLPs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="pdf-file">PDF File</Label>
            <input
              type="file"
              id="pdf-file"
              className="hidden"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            
            {selectedFile ? (
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <FileText className="w-8 h-8 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="pdf-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <FileText className="w-10 h-10 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to select PDF file</p>
                <p className="text-xs text-muted-foreground">Max size: 10MB</p>
              </label>
            )}
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <p className="text-sm font-medium mb-1">Manual Entry Process:</p>
              <ol className="text-xs space-y-1 list-decimal list-inside">
                <li>Upload the PDF file</li>
                <li>View the PDF in your browser or PDF viewer</li>
                <li>Manually enter pricing data into the form</li>
                <li>Submit entries to create vendor offers</li>
              </ol>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

