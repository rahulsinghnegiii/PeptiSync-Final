/**
 * Upload Tab
 * 
 * Interface for uploading CSV/Excel and PDF files with vendor pricing data
 * Phase 3 & 4: CSV/Excel + PDF Upload
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useUploadVendorPrices,
  useBulkImportOffers,
  useUploadHistory,
} from '@/hooks/useVendorPriceUpload';
import { useUploadPdf, useProcessPdfEntries } from '@/hooks/usePdfUpload';
import { downloadCSVTemplate } from '@/lib/csvParser';
import type { VendorTier, CSVParseResult } from '@/types/vendorComparison';
import { UploadPreviewDialog } from './UploadPreviewDialog';
import { UploadHistoryTable } from './UploadHistoryTable';
import { PdfUploadDialog } from './PdfUploadDialog';
import { PdfManualEntryForm } from './PdfManualEntryForm';

export const UploadTab = () => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<VendorTier>('research');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // PDF states
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [showPdfEntryForm, setShowPdfEntryForm] = useState(false);
  const [pdfUploadId, setPdfUploadId] = useState<string | null>(null);
  const [pdfFileUrl, setPdfFileUrl] = useState<string>('');
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfTier, setPdfTier] = useState<VendorTier>('research');

  const { uploadFile, uploading, parsing } = useUploadVendorPrices();
  const { importOffers, importing } = useBulkImportOffers();
  const { uploadPdf, uploading: uploadingPdf } = useUploadPdf();
  const { processEntries, processing: processingPdf } = useProcessPdfEntries();
  const { uploads, loading: loadingHistory, refetch: refetchHistory } = useUploadHistory();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const isValidFile = (file: File): boolean => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(extension)) {
      alert('Please select a CSV or Excel file (.csv, .xlsx, .xls)');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    const result = await uploadFile(selectedFile, selectedTier, user.uid);
    
    if (result) {
      setUploadId(result.uploadId);
      setParseResult(result.parseResult);
      setShowPreview(true);
      refetchHistory();
    }
  };

  const handleImport = async (autoCreateVendors: boolean = false) => {
    if (!uploadId || !parseResult || !user) return;

    const success = await importOffers(uploadId, parseResult, selectedTier, user.uid, autoCreateVendors);
    
    if (success) {
      setShowPreview(false);
      setSelectedFile(null);
      setUploadId(null);
      setParseResult(null);
      refetchHistory();
    }
  };

  const handleDownloadTemplate = () => {
    downloadCSVTemplate(selectedTier);
  };

  // PDF Upload Handlers
  const handlePdfUploadComplete = async (fileUrl: string, fileName: string, tier: VendorTier) => {
    if (!user) return;

    // Create a dummy File object for the upload
    // The actual file has already been uploaded by PdfUploadDialog
    const dummyFile = new File([''], fileName, { type: 'application/pdf' });
    
    const result = await uploadPdf(dummyFile, tier, user.uid);
    
    if (result) {
      setPdfUploadId(result.uploadId);
      setPdfFileUrl(result.fileUrl);
      setPdfFileName(fileName);
      setPdfTier(tier);
      setShowPdfDialog(false);
      setShowPdfEntryForm(true);
      refetchHistory();
    }
  };

  const handlePdfEntriesSubmit = async (entries: any[]) => {
    if (!pdfUploadId || !user) return;

    const success = await processEntries(pdfUploadId, pdfTier, entries, user.uid);
    
    if (success) {
      setShowPdfEntryForm(false);
      setPdfUploadId(null);
      setPdfFileUrl('');
      setPdfFileName('');
      refetchHistory();
    }
  };

  const handlePdfEntriesCancel = () => {
    setShowPdfEntryForm(false);
    setPdfUploadId(null);
    setPdfFileUrl('');
    setPdfFileName('');
  };

  const getTierLabel = (tier: VendorTier) => {
    switch (tier) {
      case 'research':
        return 'Research Peptides';
      case 'telehealth':
        return 'Telehealth & GLP Clinics';
      case 'brand':
        return 'Brand / Originator GLPs';
    }
  };

  const isProcessing = uploading || parsing || importing || uploadingPdf || processingPdf;

  // If showing PDF manual entry form, display it instead of upload interface
  if (showPdfEntryForm) {
    return (
      <PdfManualEntryForm
        tier={pdfTier}
        pdfFileName={pdfFileName}
        pdfFileUrl={pdfFileUrl}
        onSubmit={handlePdfEntriesSubmit}
        onCancel={handlePdfEntriesCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Card with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Vendor Pricing</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload CSV/Excel for automatic parsing or PDF for manual entry
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="csv" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                CSV / Excel
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PDF (Manual Entry)
              </TabsTrigger>
            </TabsList>

            {/* CSV/Excel Upload Tab */}
            <TabsContent value="csv" className="space-y-6">
          {/* Tier Selection */}
          <div className="space-y-2">
            <Label htmlFor="tier">
              Select Tier <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedTier} onValueChange={(value) => setSelectedTier(value as VendorTier)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="research">Research Peptides ($/mg comparison)</SelectItem>
                <SelectItem value="telehealth">Telehealth & GLP Clinics (subscription pricing)</SelectItem>
                <SelectItem value="brand">Brand / Originator GLPs (dose-level pricing)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Download CSV Template</p>
              <p className="text-sm text-muted-foreground">
                Get the correct template for {getTierLabel(selectedTier)}
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleUpload} disabled={isProcessing}>
                    {uploading && 'Uploading...'}
                    {parsing && 'Parsing...'}
                    {!uploading && !parsing && (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload & Parse
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                    disabled={isProcessing}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Drag and drop your file here</p>
                  <p className="text-sm text-muted-foreground">or</p>
                </div>
                <label htmlFor="file-upload">
                  <Button variant="outline" disabled={isProcessing} asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground">
                  Supported formats: CSV, Excel (.xlsx, .xls) • Max size: 10MB
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Upload Instructions:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Select the correct tier for your data</li>
                <li>Download and review the CSV template</li>
                <li>Prepare your file following the template format</li>
                <li>Upload your file - it will be validated automatically</li>
                <li>Review the preview and approve valid rows for import</li>
              </ol>
            </AlertDescription>
          </Alert>
            </TabsContent>

            {/* PDF Upload Tab */}
            <TabsContent value="pdf" className="space-y-6">
              <Alert>
                <FileText className="w-4 h-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">PDF Manual Entry Process:</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Upload a PDF file containing vendor pricing</li>
                    <li>View the PDF and manually extract pricing data</li>
                    <li>Enter data into the form (multiple entries supported)</li>
                    <li>Submit to create vendor offers</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: OCR and automated PDF parsing will be added in V2
                  </p>
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <Button onClick={() => setShowPdfDialog(true)} size="lg">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF File
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <p className="text-sm text-muted-foreground">
            View past uploads and their processing status
          </p>
        </CardHeader>
        <CardContent>
          <UploadHistoryTable uploads={uploads} loading={loadingHistory} onRefresh={refetchHistory} />
        </CardContent>
      </Card>

      {/* CSV Preview Dialog */}
      {showPreview && parseResult && (
        <UploadPreviewDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          parseResult={parseResult}
          tier={selectedTier}
          onImport={handleImport}
          importing={importing}
        />
      )}

      {/* PDF Upload Dialog */}
      <PdfUploadDialog
        open={showPdfDialog}
        onOpenChange={setShowPdfDialog}
        onUploadComplete={handlePdfUploadComplete}
      />
    </div>
  );
};

