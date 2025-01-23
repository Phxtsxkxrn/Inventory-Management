import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

// คอลเลกชันสินค้า
const productsCollection = collection(db, "products");

// ดึงข้อมูลสินค้า
export const getProducts = async () => {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      CreatedAt: data.CreatedAt?.toDate(), // แปลงเป็น Date ถ้ามีค่า
      LastUpdate: data.LastUpdate?.toDate(), // แปลงเป็น Date ถ้ามีค่า
    };
  });
};


// เพิ่มสินค้า
export const addProduct = async (product) => {
  const docRef = await addDoc(productsCollection, {
    ...product,
    CreatedAt: serverTimestamp(),
    LastUpdate: serverTimestamp(),
  });

  return { id: docRef.id, ...product, CreatedAt: new Date(), LastUpdate: new Date() };
};

// อัปเดตสินค้า
export const updateProduct = async (id, updatedProduct) => {
  const productDoc = doc(db, "products", id);
  await updateDoc(productDoc, {
    ...updatedProduct,
    LastUpdate: serverTimestamp(), // อัปเดตเฉพาะ LastUpdate
  });
};

// ลบสินค้า
export const deleteProduct = async (id) => {
  const productDoc = doc(db, "products", id);
  await deleteDoc(productDoc);
};
