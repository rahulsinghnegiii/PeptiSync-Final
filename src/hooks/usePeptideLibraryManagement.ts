import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { toast } from "sonner";
import type { PeptideLibraryEntry, PeptideLibraryFormData } from "@/types/peptide";

const COLLECTION_NAME = "peptide_library";

interface UsePeptideLibraryManagementResult {
  libraryEntries: PeptideLibraryEntry[];
  loading: boolean;
  error: string | null;
  fetchLibraryEntries: () => Promise<void>;
  getLibraryEntryById: (id: string) => Promise<PeptideLibraryEntry | null>;
  createLibraryEntry: (data: PeptideLibraryFormData) => Promise<boolean>;
  updateLibraryEntry: (id: string, data: PeptideLibraryFormData) => Promise<boolean>;
  deleteLibraryEntry: (id: string) => Promise<boolean>;
  toggleLibraryVisibility: (id: string, currentVisibility: boolean) => Promise<boolean>;
  deleteAllLibraryEntries: () => Promise<boolean>;
}

export function usePeptideLibraryManagement(): UsePeptideLibraryManagementResult {
  const [libraryEntries, setLibraryEntries] = useState<PeptideLibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLibraryEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const libraryRef = collection(db, COLLECTION_NAME);
      const q = query(libraryRef, orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const libraryData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          category: data.category || '',
          shortDescription: data.shortDescription || '',
          description: data.description || '',
          mechanism: data.mechanism || '',
          commonDoses: data.commonDoses || '',
          protocol: data.protocol || '',
          sideEffects: data.sideEffects || '',
          warnings: data.warnings || '',
          interactions: data.interactions || '',
          injectionAreas: data.injectionAreas || '',
          isVisible: data.isVisible ?? true,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(0, 0),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : new Timestamp(0, 0),
          createdBy: data.createdBy || '',
        } as PeptideLibraryEntry;
      });
      setLibraryEntries(libraryData);
    } catch (err) {
      console.error("Error fetching library entries:", err);
      setError("Failed to load library entries.");
      setLibraryEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryEntries();
  }, []);

  const getLibraryEntryById = async (id: string): Promise<PeptideLibraryEntry | null> => {
    try {
      const entryRef = doc(db, COLLECTION_NAME, id);
      const entrySnap = await getDoc(entryRef);
      if (entrySnap.exists()) {
        const data = entrySnap.data();
        return {
          id: entrySnap.id,
          name: data.name || '',
          category: data.category || '',
          shortDescription: data.shortDescription || '',
          description: data.description || '',
          mechanism: data.mechanism || '',
          commonDoses: data.commonDoses || '',
          protocol: data.protocol || '',
          sideEffects: data.sideEffects || '',
          warnings: data.warnings || '',
          interactions: data.interactions || '',
          injectionAreas: data.injectionAreas || '',
          isVisible: data.isVisible ?? true,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(0, 0),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : new Timestamp(0, 0),
          createdBy: data.createdBy || '',
        } as PeptideLibraryEntry;
      }
      return null;
    } catch (err) {
      console.error("Error getting library entry by ID:", err);
      toast.error("Failed to retrieve library entry.");
      return null;
    }
  };

  const createLibraryEntry = async (data: PeptideLibraryFormData): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to create a library entry.");
      return false;
    }

    try {
      const newEntry = {
        ...data,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, COLLECTION_NAME), newEntry);
      toast.success("Library entry created successfully!");
      fetchLibraryEntries();
      return true;
    } catch (err) {
      console.error("Error creating library entry:", err);
      toast.error("Failed to create library entry.");
      return false;
    }
  };

  const updateLibraryEntry = async (id: string, data: PeptideLibraryFormData): Promise<boolean> => {
    try {
      const entryRef = doc(db, COLLECTION_NAME, id);
      const updatedData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(entryRef, updatedData);
      toast.success("Library entry updated successfully!");
      fetchLibraryEntries();
      return true;
    } catch (err) {
      console.error("Error updating library entry:", err);
      toast.error("Failed to update library entry.");
      return false;
    }
  };

  const deleteLibraryEntry = async (id: string): Promise<boolean> => {
    try {
      const entryRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(entryRef);
      toast.success("Library entry deleted successfully!");
      fetchLibraryEntries();
      return true;
    } catch (err) {
      console.error("Error deleting library entry:", err);
      toast.error("Failed to delete library entry.");
      return false;
    }
  };

  const toggleLibraryVisibility = async (id: string, currentVisibility: boolean): Promise<boolean> => {
    try {
      const entryRef = doc(db, COLLECTION_NAME, id);
      const newVisibility = !currentVisibility;
      await updateDoc(entryRef, {
        isVisible: newVisibility,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Library entry ${newVisibility ? 'visible' : 'hidden'} successfully!`);
      fetchLibraryEntries();
      return true;
    } catch (err) {
      console.error("Error toggling library visibility:", err);
      toast.error("Failed to toggle visibility.");
      return false;
    }
  };

  const deleteAllLibraryEntries = async (): Promise<boolean> => {
    try {
      const libraryRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(libraryRef);
      
      if (snapshot.empty) {
        toast.info("No peptides to delete.");
        return true;
      }

      const totalDocs = snapshot.size;
      let deletedCount = 0;

      // Delete in batches (Firestore batch limit is 500)
      const batchSize = 500;
      const batches: any[] = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      snapshot.docs.forEach((document) => {
        currentBatch.delete(document.ref);
        operationCount++;
        
        if (operationCount === batchSize) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      });

      // Add the last batch if it has operations
      if (operationCount > 0) {
        batches.push(currentBatch);
      }

      // Commit all batches
      for (const batch of batches) {
        await batch.commit();
        deletedCount += Math.min(batchSize, totalDocs - deletedCount);
      }

      toast.success(`Successfully deleted ${totalDocs} peptide library entries!`);
      fetchLibraryEntries();
      return true;
    } catch (err) {
      console.error("Error deleting all library entries:", err);
      toast.error("Failed to delete all library entries.");
      return false;
    }
  };

  return {
    libraryEntries,
    loading,
    error,
    fetchLibraryEntries,
    getLibraryEntryById,
    createLibraryEntry,
    updateLibraryEntry,
    deleteLibraryEntry,
    toggleLibraryVisibility,
    deleteAllLibraryEntries,
  };
}

