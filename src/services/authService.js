import { db } from "./firebaseConfig"; // นำเข้า Firestore
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";

// ฟังก์ชันลงทะเบียนผู้ใช้ใหม่
export const registerUser = async (firstName, lastName, email, password) => {
  try {
    // สร้างข้อมูลผู้ใช้ใหม่
    const newUser = {
      firstName,
      lastName,
      email,
      password, // เก็บรหัสผ่านเป็นข้อความธรรมดา (ไม่แฮช)
      createdAt: serverTimestamp(),
      lastUpdate: serverTimestamp(),
    };

    // บันทึกข้อมูลใน Firestore
    await setDoc(doc(db, "users", email), newUser); // ใช้ email เป็น document ID

    return { success: true }; // คืนค่าผลลัพธ์สำเร็จ
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, message: error.message }; // ถ้ามีข้อผิดพลาดให้แสดงข้อความ
  }
};

// ฟังก์ชันเข้าสู่ระบบผู้ใช้
export const loginUser = async (email, password) => {
  try {
    const docRef = doc(db, "users", email); // ใช้ email เป็น document ID
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const user = docSnap.data();
      // ตรวจสอบรหัสผ่านที่กรอกมาตรงกับรหัสผ่านใน Firestore หรือไม่
      if (password === user.password) {
        // เปรียบเทียบรหัสผ่าน
        return { success: true, user }; // คืนข้อมูลผู้ใช้
      } else {
        return { success: false, message: "Invalid password" }; // ถ้ารหัสผ่านไม่ตรง
      }
    } else {
      return { success: false, message: "User not found" }; // ถ้าไม่พบผู้ใช้
    }
  } catch (error) {
    console.error("Login Error: ", error);
    return { success: false, message: error.message };
  }
};
