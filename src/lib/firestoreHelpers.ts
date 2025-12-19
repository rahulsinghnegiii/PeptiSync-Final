// Firestore helper utilities
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  DocumentSnapshot,
  writeBatch,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  USER_ROLES: "userRoles",
  PRODUCTS: "products",
  CART_ITEMS: "cartItems",
  ORDERS: "orders",
  ORDER_ITEMS: "orderItems",
  REVIEWS: "reviews",
  ANALYTICS: "analytics",
  EMAIL_PREFERENCES: "emailPreferences",
} as const;

// Helper to get a document reference
export const getDocRef = (collectionName: string, docId: string) => {
  return doc(db, collectionName, docId);
};

// Helper to get a collection reference
export const getCollectionRef = (collectionName: string) => {
  return collection(db, collectionName);
};

// Helper to get a subcollection reference
export const getSubcollectionRef = (
  parentCollection: string,
  parentId: string,
  subcollection: string
) => {
  return collection(db, parentCollection, parentId, subcollection);
};

// Helper to create a document with auto-generated ID
export const createDocument = async <T extends Record<string, any>>(
  collectionName: string,
  data: T
) => {
  const collectionRef = getCollectionRef(collectionName);
  const docRef = doc(collectionRef);
  const now = Timestamp.now();
  
  const docData = {
    ...data,
    id: docRef.id,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(docRef, docData);
  return { id: docRef.id, ...docData };
};

// Helper to create a document with specific ID
export const createDocumentWithId = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
) => {
  const docRef = getDocRef(collectionName, docId);
  const now = Timestamp.now();
  
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(docRef, docData);
  return docData;
};

// Helper to update a document
export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: Partial<T>
) => {
  const docRef = getDocRef(collectionName, docId);
  const updateData = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  
  await updateDoc(docRef, updateData);
  return updateData;
};

// Helper to delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = getDocRef(collectionName, docId);
  await deleteDoc(docRef);
};

// Helper to get a single document
export const getDocument = async <T>(collectionName: string, docId: string) => {
  const docRef = getDocRef(collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as T;
};

// Helper to query documents
export const queryDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[]
) => {
  const collectionRef = getCollectionRef(collectionName);
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

// Helper to get all documents in a collection
export const getAllDocuments = async <T>(collectionName: string) => {
  const collectionRef = getCollectionRef(collectionName);
  const querySnapshot = await getDocs(collectionRef);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

// Helper for batch writes
export const batchWrite = async (
  operations: Array<{
    type: "set" | "update" | "delete";
    collection: string;
    docId: string;
    data?: any;
  }>
) => {
  const batch = writeBatch(db);
  
  operations.forEach((op) => {
    const docRef = getDocRef(op.collection, op.docId);
    
    switch (op.type) {
      case "set":
        batch.set(docRef, {
          ...op.data,
          updatedAt: Timestamp.now(),
        });
        break;
      case "update":
        batch.update(docRef, {
          ...op.data,
          updatedAt: Timestamp.now(),
        });
        break;
      case "delete":
        batch.delete(docRef);
        break;
    }
  });
  
  await batch.commit();
};

// Helper to increment a field
export const incrementField = (value: number) => increment(value);

// Helper to get server timestamp
export const getServerTimestamp = () => serverTimestamp();

// Helper to convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: Timestamp) => {
  return timestamp.toDate();
};

// Helper to convert Date to Firestore Timestamp
export const dateToTimestamp = (date: Date) => {
  return Timestamp.fromDate(date);
};

// Pagination helper
export interface PaginationOptions {
  pageSize: number;
  lastDoc?: DocumentSnapshot;
}

export const paginateQuery = (
  collectionName: string,
  constraints: QueryConstraint[],
  options: PaginationOptions
) => {
  const collectionRef = getCollectionRef(collectionName);
  const queryConstraints = [...constraints, limit(options.pageSize)];
  
  if (options.lastDoc) {
    queryConstraints.push(startAfter(options.lastDoc));
  }
  
  return query(collectionRef, ...queryConstraints);
};

// Export query builders
export { query, where, orderBy, limit, startAfter, Timestamp };

