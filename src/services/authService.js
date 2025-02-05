// services/authService.js
import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential; // ต้อง return ค่าออกมา
  } catch (error) {
    console.error("Registration Error:", error);
    throw error; // ส่ง error กลับไปให้ handleRegister ใช้งาน
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth); // ✅ เรียกใช้งาน Logout
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
