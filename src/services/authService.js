import { db } from "./firebaseConfig";
import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { hashPassword, verifyPassword } from "./cryptoUtils"; // ใช้ฟังก์ชันแฮชจาก cryptoUtils.js

// ✅ ฟังก์ชันลงทะเบียน
export const registerUser = async (
  firstName,
  lastName,
  email,
  password,
  role
) => {
  try {
    const hashedPassword = await hashPassword(password); // แฮชรหัสผ่าน

    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword, // บันทึกเป็นค่าแฮช
      role, // ✅ เพิ่ม role เข้าไปที่ Firestore
      createdAt: serverTimestamp(),
      lastUpdate: serverTimestamp(),
    };

    await setDoc(doc(db, "users", email), newUser); // ใช้ email เป็น document ID

    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, message: error.message };
  }
};

// ✅ ฟังก์ชันเข้าสู่ระบบ
export const loginUser = async (email, password) => {
  try {
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const user = docSnap.data();

      const isPasswordValid = await verifyPassword(password, user.password);
      if (isPasswordValid) {
        return { success: true, user };
      } else {
        return { success: false, message: "Invalid password" };
      }
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error) {
    console.error("Login Error: ", error);
    return { success: false, message: error.message };
  }
};
