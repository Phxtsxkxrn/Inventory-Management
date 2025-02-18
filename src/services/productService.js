import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

// คอลเลกชันสินค้าและโปรโมชั่น
const productsCollection = collection(db, "products");

// ดึงข้อมูลสินค้า พร้อมเช็คโปรโมชั่น
export const getProducts = async () => {
  const [productsSnapshot, promotionsSnapshot] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(collection(db, "promotions")),
  ]);

  const promotions = promotionsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return productsSnapshot.docs.map((doc) => {
    const data = doc.data();
    const now = new Date(); // เวลาปัจจุบัน

    let finalPrice = data.NormalPrice || 0;
    let appliedPromotion = null;

    // ตรวจสอบว่าสินค้ามีโปรโมชั่นที่ยังใช้งานอยู่หรือไม่
    if (data.promotionId) {
      const promo = promotions.find((p) => p.id === data.promotionId);
      if (promo) {
        const start = new Date(promo.startDateTime);
        const end = new Date(promo.endDateTime);

        if (now >= start && now <= end) {
          finalPrice = finalPrice - (finalPrice * promo.discount) / 100;
          appliedPromotion = promo;
        }
      }
    }

    return {
      id: doc.id,
      ...data,
      FinalPrice: finalPrice,
      AppliedPromotion: appliedPromotion,
      CreatedAt: data.CreatedAt?.toDate
        ? data.CreatedAt.toDate()
        : data.CreatedAt
        ? new Date(data.CreatedAt)
        : null, // ✅ รองรับทั้ง Firestore Timestamp และ string
      LastUpdate: data.LastUpdate?.toDate
        ? data.LastUpdate.toDate()
        : data.LastUpdate
        ? new Date(data.LastUpdate)
        : null, // ✅ รองรับทั้ง Firestore Timestamp และ string
    };
  });
};

// เพิ่มสินค้า
export const addProduct = async (product) => {
  const docRef = await addDoc(productsCollection, {
    ...product,
    Image: product.Image || "",
    CreatedAt: serverTimestamp(),
    LastUpdate: serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...product,
    CreatedAt: new Date(),
    LastUpdate: new Date(),
  };
};

// อัปเดตสินค้า
export const updateProduct = async (id, updatedProduct) => {
  console.log("📢 อัปเดตสินค้าใน Firestore:", id, updatedProduct); // ✅ Debug

  const productDoc = doc(db, "products", id);
  await updateDoc(productDoc, {
    ...updatedProduct,
    promotionId: updatedProduct.promotionId
      ? String(updatedProduct.promotionId)
      : null, // ✅ แปลงเป็น string
    startDateTime: updatedProduct.startDateTime
      ? new Date(updatedProduct.startDateTime).toISOString()
      : null,
    endDateTime: updatedProduct.endDateTime
      ? new Date(updatedProduct.endDateTime).toISOString()
      : null,
    LastUpdate: serverTimestamp(),
  });
};

// ลบสินค้า
export const deleteProduct = async (id) => {
  const productDoc = doc(db, "products", id);
  await deleteDoc(productDoc);
};

export const updateProductStatus = async (productId, newStatus) => {
  const productRef = doc(db, "products", productId);
  try {
    await updateDoc(productRef, {
      Status: newStatus,
      LastUpdate: serverTimestamp(), // ✅ ใช้ serverTimestamp() ให้ Firestore อัปเดตเอง
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    throw error;
  }
};
