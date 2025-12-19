import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, CheckCircle, XCircle, Search } from "lucide-react";
import { usePeptideManagement } from "@/hooks/usePeptideManagement";
import { PeptideForm } from "./PeptideForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PEPTIDE_CATEGORIES } from "@/lib/constants";
import type { Peptide } from "@/types/peptide";

export const AdminPeptides = () => {
  const { peptides, loading, error, createPeptide, updatePeptide, deletePeptide, togglePeptideApproval } = usePeptideManagement();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPeptide, setEditingPeptide] = useState<Peptide | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleEdit = (peptide: Peptide) => {
    setEditingPeptide(peptide);
    setIsFormOpen(true);
  };

  const handleDelete = async (peptideId: string) => {
    if (window.confirm("Are you sure you want to delete this peptide? This action cannot be undone.")) {
      const success = await deletePeptide(peptideId);
      if (success) {
        toast.success("Peptide deleted successfully.");
      } else {
        toast.error("Failed to delete peptide.");
      }
    }
  };

  const handleToggleApproval = async (peptideId: string, currentApproved: boolean) => {
    await togglePeptideApproval(peptideId, currentApproved);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPeptide(null);
  };

  const handleSubmitData = async (data: any) => {
    if (editingPeptide) {
      return await updatePeptide(editingPeptide.id, data);
    } else {
      return await createPeptide(data);
    }
  };

  // Filter peptides
  const filteredPeptides = peptides.filter((peptide) => {
    const matchesSearch = peptide.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || peptide.category === categoryFilter;
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "approved" && peptide.approved) ||
      (statusFilter === "unapproved" && !peptide.approved);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading peptides...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="glass border-glass-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Master Peptides Database</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingPeptide(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPeptide(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Peptide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPeptide ? "Edit Peptide" : "Create New Peptide"}</DialogTitle>
            </DialogHeader>
            <PeptideForm 
              initialData={editingPeptide} 
              onSuccess={handleFormSuccess}
              onSubmitData={handleSubmitData}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search peptides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PEPTIDE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="unapproved">Unapproved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredPeptides.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No peptides found. {searchQuery || categoryFilter !== "all" || statusFilter !== "all" ? "Try adjusting your filters." : "Start by creating a new one!"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeptides.map((peptide, index) => (
                  <TableRow key={`peptide-${peptide.id}-${index}`}>
                    <TableCell className="font-medium">{peptide.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{peptide.category}</Badge>
                    </TableCell>
                    <TableCell>{peptide.form}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleApproval(peptide.id, peptide.approved)}
                        className={`flex items-center gap-1 ${peptide.approved ? 'text-green-500' : 'text-yellow-500'}`}
                      >
                        {peptide.approved ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {peptide.approved ? 'Approved' : 'Unapproved'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(peptide)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(peptide.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

