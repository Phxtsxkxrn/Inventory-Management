import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import emailjs from "emailjs-com";

// Initialize EmailJS with your public key (จาก Account > API Keys)
emailjs.init("p5dOAkZrg_xcJNSvq");

// ขั้นตอนการตั้งค่า EmailJS:
// 1. ไปที่ https://dashboard.emailjs.com/
// 2. Email Services > Add New Service
// 3. ใส่ข้อมูลดังนี้:
//    - Name: ตั้งชื่อบริการ (เช่น "OTP Service")
//    - Service Provider: Gmail
//    - Gmail: ใส่อีเมลที่จะใช้ส่ง OTP
// 4. คัดลอก Service ID ที่ได้มาใส่ตรงนี้

const EMAILJS_SERVICE_ID = "service_mgg59sy"; // Service ID จากหน้า Email Services
const EMAILJS_TEMPLATE_ID = "template_n6aar0w"; // Template ID จาก Email Templates

// ใส่ App Password ที่ได้จาก Gmail ในการตั้งค่า EmailJS Service
// ที่ https://dashboard.emailjs.com/admin/
// เลือก Email Services -> Add New Service -> Gmail
// ใส่ Gmail และ App Password ที่ได้มา

const sendOTPEmail = async (email, otp) => {
  try {
    const templateParams = {
      to_name: email,
      to_email: email, // อีเมลผู้รับ (ต้องตรงกับ To Email ใน template)
      reply_to: email, // เพิ่ม reply_to field
      message: `Your OTP code is: ${otp}`,
      otp_code: otp,
    };

    console.log("Sending email with params:", templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log("Email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// สร้าง OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// สร้างและบันทึก OTP
export const createOTP = async (email) => {
  try {
    // ตรวจสอบว่ามีอีเมลในระบบหรือไม่
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error("Email not found in system");
    }

    // สร้าง OTP และบันทึกลง Firestore
    const otp = generateOTP();
    const otpRef = collection(db, "otps");
    await addDoc(otpRef, {
      email,
      otp,
      createdAt: new Date(),
      used: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP หมดอายุใน 5 นาที
    });

    // ส่ง OTP ทางอีเมล
    await sendOTPEmail(email, otp);

    return true;
  } catch (error) {
    console.error("Error in createOTP:", error);
    throw error;
  }
};

// ตรวจสอบ OTP
export const verifyOTP = async (email, enteredOTP) => {
  try {
    // เปลี่ยนวิธีการค้นหา OTP
    const otpsRef = collection(db, "otps");
    const q = query(
      otpsRef,
      where("email", "==", email),
      where("used", "==", false)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false;
    }

    // ใช้ OTP ล่าสุด
    const otpDoc = querySnapshot.docs[0];
    const otpData = otpDoc.data();
    const now = new Date();

    if (now.getTime() > otpData.expiresAt.toDate().getTime()) {
      await deleteDoc(doc(db, "otps", otpDoc.id));
      throw new Error("OTP has expired");
    }

    if (otpData.otp === enteredOTP) {
      // ลบ OTP หลังจากใช้งานสำเร็จ
      await deleteDoc(doc(db, "otps", otpDoc.id));
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};
