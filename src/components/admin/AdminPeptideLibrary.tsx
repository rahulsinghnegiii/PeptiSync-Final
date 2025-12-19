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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff, Search, Upload, Trash } from "lucide-react";
import { usePeptideLibraryManagement } from "@/hooks/usePeptideLibraryManagement";
import { PeptideLibraryForm } from "./PeptideLibraryForm";
import { BulkImportDialog } from "./BulkImportDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from "lucide-react";
import { PEPTIDE_CATEGORIES } from "@/lib/constants";
import type { PeptideLibraryEntry } from "@/types/peptide";

export const AdminPeptideLibrary = () => {
  const { libraryEntries, loading, error, createLibraryEntry, updateLibraryEntry, deleteLibraryEntry, toggleLibraryVisibility, deleteAllLibraryEntries } = usePeptideLibraryManagement();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PeptideLibraryEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (entry: PeptideLibraryEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this library entry? This action cannot be undone.")) {
      const success = await deleteLibraryEntry(entryId);
      if (success) {
        toast.success("Library entry deleted successfully.");
      } else {
        toast.error("Failed to delete library entry.");
      }
    }
  };

  const handleToggleVisibility = async (entryId: string, currentVisibility: boolean) => {
    await toggleLibraryVisibility(entryId, currentVisibility);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleSubmitData = async (data: any) => {
    if (editingEntry) {
      return await updateLibraryEntry(editingEntry.id, data);
    } else {
      return await createLibraryEntry(data);
    }
  };

  const handleBulkImportSuccess = () => {
    // Refresh will happen automatically via the hook
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    const success = await deleteAllLibraryEntries();
    setIsDeleting(false);
    setIsDeleteAllDialogOpen(false);
  };

  // Filter library entries
  const filteredEntries = libraryEntries.filter((entry) => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
    const matchesVisibility = 
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && entry.is_visible) ||
      (visibilityFilter === "hidden" && !entry.is_visible);
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  if (loading) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading library entries...</p>
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
    <>
      <Card className="glass border-glass-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Educational Peptide Library</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBulkImportOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Bulk Import
              </Button>
              <Dialog open={isFormOpen} onOpenChange={(open) => {
                setIsFormOpen(open);
                if (!open) setEditingEntry(null);
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingEntry(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEntry ? "Edit Library Entry" : "Create New Library Entry"}</DialogTitle>
                  </DialogHeader>
                  <PeptideLibraryForm 
                    initialData={editingEntry} 
                    onSuccess={handleFormSuccess}
                    onSubmitData={handleSubmitData}
                  />
                </DialogContent>
              </Dialog>
              {libraryEntries.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteAllDialogOpen(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search library entries..."
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
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No library entries found. {searchQuery || categoryFilter !== "all" || visibilityFilter !== "all" ? "Try adjusting your filters." : "Start by creating a new one!"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Short Description</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry, index) => (
                  <TableRow key={`library-${entry.id}-${index}`}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{entry.short_description}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(entry.id, entry.is_visible)}
                        className={`flex items-center gap-1 ${entry.is_visible ? 'text-green-500' : 'text-gray-500'}`}
                      >
                        {entry.is_visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        {entry.is_visible ? 'Visible' : 'Hidden'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(entry.id)}>
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

    {/* Bulk Import Dialog */}
    <BulkImportDialog
      open={isBulkImportOpen}
      onOpenChange={setIsBulkImportOpen}
      onSuccess={handleBulkImportSuccess}
    />

    {/* Delete All Confirmation Dialog */}
    <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete All Peptides?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all <strong>{libraryEntries.length}</strong> peptide library entries.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAll}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete All'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};

