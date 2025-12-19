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
} from "firebase/firestore";
import { toast } from "sonner";
import type { Peptide, PeptideFormData } from "@/types/peptide";

const COLLECTION_NAME = "peptides";

interface UsePeptideManagementResult {
  peptides: Peptide[];
  loading: boolean;
  error: string | null;
  fetchPeptides: () => Promise<void>;
  getPeptideById: (id: string) => Promise<Peptide | null>;
  createPeptide: (data: PeptideFormData) => Promise<boolean>;
  updatePeptide: (id: string, data: PeptideFormData) => Promise<boolean>;
  deletePeptide: (id: string) => Promise<boolean>;
  togglePeptideApproval: (id: string, currentApproved: boolean) => Promise<boolean>;
}

export function usePeptideManagement(): UsePeptideManagementResult {
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeptides = async () => {
    setLoading(true);
    setError(null);
    try {
      const peptidesRef = collection(db, COLLECTION_NAME);
      const q = query(peptidesRef, orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const peptidesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at instanceof Timestamp ? doc.data().created_at : new Timestamp(0, 0),
        updated_at: doc.data().updated_at instanceof Timestamp ? doc.data().updated_at : new Timestamp(0, 0),
      })) as Peptide[];
      setPeptides(peptidesData);
    } catch (err) {
      console.error("Error fetching peptides:", err);
      setError("Failed to load peptides.");
      setPeptides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeptides();
  }, []);

  const getPeptideById = async (id: string): Promise<Peptide | null> => {
    try {
      const peptideRef = doc(db, COLLECTION_NAME, id);
      const peptideSnap = await getDoc(peptideRef);
      if (peptideSnap.exists()) {
        const data = peptideSnap.data();
        return {
          id: peptideSnap.id,
          ...data,
          created_at: data.created_at instanceof Timestamp ? data.created_at : new Timestamp(0, 0),
          updated_at: data.updated_at instanceof Timestamp ? data.updated_at : new Timestamp(0, 0),
        } as Peptide;
      }
      return null;
    } catch (err) {
      console.error("Error getting peptide by ID:", err);
      toast.error("Failed to retrieve peptide.");
      return null;
    }
  };

  const createPeptide = async (data: PeptideFormData): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to create a peptide.");
      return false;
    }

    try {
      const newPeptide = {
        ...data,
        rejected: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      await addDoc(collection(db, COLLECTION_NAME), newPeptide);
      toast.success("Peptide created successfully!");
      fetchPeptides();
      return true;
    } catch (err) {
      console.error("Error creating peptide:", err);
      toast.error("Failed to create peptide.");
      return false;
    }
  };

  const updatePeptide = async (id: string, data: PeptideFormData): Promise<boolean> => {
    try {
      const peptideRef = doc(db, COLLECTION_NAME, id);
      const updatedData = {
        ...data,
        updated_at: serverTimestamp(),
      };
      await updateDoc(peptideRef, updatedData);
      toast.success("Peptide updated successfully!");
      fetchPeptides();
      return true;
    } catch (err) {
      console.error("Error updating peptide:", err);
      toast.error("Failed to update peptide.");
      return false;
    }
  };

  const deletePeptide = async (id: string): Promise<boolean> => {
    try {
      const peptideRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(peptideRef);
      toast.success("Peptide deleted successfully!");
      fetchPeptides();
      return true;
    } catch (err) {
      console.error("Error deleting peptide:", err);
      toast.error("Failed to delete peptide.");
      return false;
    }
  };

  const togglePeptideApproval = async (id: string, currentApproved: boolean): Promise<boolean> => {
    try {
      const peptideRef = doc(db, COLLECTION_NAME, id);
      const newApproved = !currentApproved;
      await updateDoc(peptideRef, {
        approved: newApproved,
        rejected: false, // Reset rejected when toggling approval
        updated_at: serverTimestamp(),
      });
      toast.success(`Peptide ${newApproved ? 'approved' : 'unapproved'} successfully!`);
      fetchPeptides();
      return true;
    } catch (err) {
      console.error("Error toggling peptide approval:", err);
      toast.error("Failed to toggle approval status.");
      return false;
    }
  };

  return {
    peptides,
    loading,
    error,
    fetchPeptides,
    getPeptideById,
    createPeptide,
    updatePeptide,
    deletePeptide,
    togglePeptideApproval,
  };
}

