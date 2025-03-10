import { db } from "./firebaseConfig"; // เชื่อมต่อ Firebase
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

// แปลงเวลาเป็น UTC ก่อนบันทึกลง Firestore
const convertToUTC = (date, time) => {
  const localDateTime = new Date(`${date}T${time}`);
  return localDateTime.toISOString(); // บันทึกเป็น ISO String (UTC)
};

// เพิ่มโปรโมชั่นใน Firestore
export const addPromotion = async (promotion) => {
  const promotionData = {
    ...promotion,
    startDateTime: convertToUTC(promotion.startDate, promotion.startTime),
    endDateTime: convertToUTC(promotion.endDate, promotion.endTime),
  };

  const docRef = await addDoc(collection(db, "promotions"), promotionData);
  return { id: docRef.id, ...promotionData };
};

// ดึงข้อมูลโปรโมชั่นจาก Firestore
export const getPromotions = async () => {
  const querySnapshot = await getDocs(collection(db, "promotions"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: new Date(data.startDateTime).toLocaleDateString(),
      startTime: new Date(data.startDateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      endDate: new Date(data.endDateTime).toLocaleDateString(),
      endTime: new Date(data.endDateTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });
};

// ลบโปรโมชั่น
export const deletePromotion = async (id) => {
  await deleteDoc(doc(db, "promotions", id));
};
