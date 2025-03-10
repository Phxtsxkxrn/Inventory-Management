import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const categoriesCollection = collection(db, "Categories");

// Get all categories
export const getCategories = async () => {
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      Name: data.Name,
      CreatedAt: data.CreatedAt
        ? new Date(data.CreatedAt.seconds * 1000).toLocaleString()
        : "N/A",
      LastUpdate: data.LastUpdate
        ? new Date(data.LastUpdate.seconds * 1000).toLocaleString()
        : "N/A",
    };
  });
};

// Add a new category
export const addCategories = async (categories) => {
  const docRef = await addDoc(categoriesCollection, {
    ...categories,
    CreatedAt: serverTimestamp(),
    LastUpdate: serverTimestamp(),
  });
  const newDoc = await getDoc(doc(db, "Categories", docRef.id));
  return {
    id: newDoc.id,
    ...newDoc.data(),
  };
};

// Delete a category
export const deleteCategories = async (id) => {
  const categoriesDoc = doc(db, "Categories", id);
  await deleteDoc(categoriesDoc);
};
