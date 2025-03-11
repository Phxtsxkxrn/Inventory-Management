import { db } from "./firebaseConfig";
import {
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { hashPassword, verifyPassword } from "./cryptoutils.service"; // ใช้ฟังก์ชันแฮชจาก cryptoUtils.js

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
      isFirstLogin: true, // Add this field
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
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userEmail", user.email);

        return {
          success: true,
          user,
          requirePasswordChange: user.isFirstLogin || false,
        };
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

// Add new function for changing password
export const changePassword = async (email, newPassword) => {
  try {
    const hashedPassword = await hashPassword(newPassword);
    const userRef = doc(db, "users", email);

    await updateDoc(userRef, {
      password: hashedPassword,
      isFirstLogin: false,
      lastUpdate: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { success: false, message: error.message };
  }
};
