import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Eye,
  Clock
} from "lucide-react";
import { 
  useAllVendorSubmissions,
  useApproveSubmission,
  useRejectSubmission,
  useDeleteSubmission,
  useToggleVendorVerification
} from "@/hooks/useVendorSubmissions";
import { useAuth } from "@/contexts/AuthContext";
import type { VendorPriceSubmission } from "@/types/vendor";

export const AdminVendorModeration = () => {
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<VendorPriceSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { submissions: pendingSubmissions, loading: loadingPending } = useAllVendorSubmissions('pending');
  const { submissions: approvedSubmissions, loading: loadingApproved } = useAllVendorSubmissions('approved');
  const { submissions: rejectedSubmissions, loading: loadingRejected } = useAllVendorSubmissions('rejected');

  const { approve, approving } = useApproveSubmission();
  const { reject, rejecting } = useRejectSubmission();
  const { deleteSubmission, deleting } = useDeleteSubmission();
  const { toggleVerification, toggling } = useToggleVendorVerification();

  const handleApprove = async (submission: VendorPriceSubmission) => {
    if (!user) return;
    const success = await approve(submission.id, user.uid);
    if (success) {
      // Refetch will happen automatically due to Firebase listeners
    }
  };

  const handleReject = async () => {
    if (!user || !selectedSubmission) return;
    const success = await reject(selectedSubmission.id, rejectReason, user.uid);
    if (success) {
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedSubmission(null);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      await deleteSubmission(submissionId);
    }
  };

  const handleToggleVerification = async (submission: VendorPriceSubmission) => {
    await toggleVerification(submission.id, submission.verifiedVendor || false);
  };

  const openRejectDialog = (submission: VendorPriceSubmission) => {
    setSelectedSubmission(submission);
    setShowRejectDialog(true);
  };

  const openDetailDialog = (submission: VendorPriceSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailDialog(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "N/A";
    return timestamp.toDate().toLocaleDateString();
  };

  const SubmissionRow = ({ 
    submission, 
    showActions = true 
  }: { 
    submission: VendorPriceSubmission; 
    showActions?: boolean;
  }) => (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {submission.peptideName}
          {submission.verifiedVendor && (
            <Shield className="w-4 h-4 text-primary" title="Verified Vendor" />
          )}
        </div>
      </TableCell>
      <TableCell className="text-primary font-semibold">
        ${submission.priceUsd.toFixed(2)}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{submission.shippingOrigin}</Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(submission.submittedAt)}
      </TableCell>
      {showActions && (
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDetailDialog(submission)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {submission.approvalStatus === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprove(submission)}
                  disabled={approving}
                >
                  <CheckCircle className="w-4 h-4 text-success" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openRejectDialog(submission)}
                  disabled={rejecting}
                >
                  <XCircle className="w-4 h-4 text-destructive" />
                </Button>
              </>
            )}
            {submission.approvalStatus === 'approved' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleVerification(submission)}
                disabled={toggling}
                title={submission.verifiedVendor ? "Unverify vendor" : "Verify vendor"}
              >
                {submission.verifiedVendor ? (
                  <ShieldOff className="w-4 h-4" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(submission.id)}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Pending Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : pendingSubmissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending submissions
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Peptide</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSubmissions.map((submission) => (
                        <SubmissionRow key={submission.id} submission={submission} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Approved Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingApproved ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : approvedSubmissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No approved submissions
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Peptide</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Approved</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedSubmissions.map((submission) => (
                        <SubmissionRow key={submission.id} submission={submission} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle>Rejected Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRejected ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : rejectedSubmissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No rejected submissions
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Peptide</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Rejected</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedSubmissions.map((submission) => (
                        <SubmissionRow key={submission.id} submission={submission} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason || rejecting}
            >
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Peptide Name</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.peptideName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Price (USD)</p>
                  <p className="text-sm text-primary font-semibold">${selectedSubmission.priceUsd.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Shipping Origin</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.shippingOrigin}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Status</p>
                  <Badge variant={
                    selectedSubmission.approvalStatus === 'approved' ? 'default' :
                    selectedSubmission.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {selectedSubmission.approvalStatus}
                  </Badge>
                </div>
                {selectedSubmission.vendorName && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Vendor Name</p>
                    <p className="text-sm text-muted-foreground">{selectedSubmission.vendorName}</p>
                  </div>
                )}
                {selectedSubmission.vendorUrl && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Vendor URL</p>
                    <a 
                      href={selectedSubmission.vendorUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {selectedSubmission.vendorUrl}
                    </a>
                  </div>
                )}
                {selectedSubmission.discountCode && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Discount Code</p>
                    <p className="text-sm text-muted-foreground">{selectedSubmission.discountCode}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold mb-1">Submitted</p>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedSubmission.submittedAt)}</p>
                </div>
                {selectedSubmission.reviewedAt && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Reviewed</p>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedSubmission.reviewedAt)}</p>
                  </div>
                )}
                {selectedSubmission.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-sm font-semibold mb-1">Rejection Reason</p>
                    <p className="text-sm text-muted-foreground">{selectedSubmission.rejectionReason}</p>
                  </div>
                )}
              </div>
              {selectedSubmission.screenshotUrl && (
                <div>
                  <p className="text-sm font-semibold mb-2">Screenshot</p>
                  <img 
                    src={selectedSubmission.screenshotUrl} 
                    alt="Submission screenshot"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

