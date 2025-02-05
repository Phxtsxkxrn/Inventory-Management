import React, { useState, useEffect } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "./Register.css";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ปิด Scroll เมื่ออยู่ใน Register และเปิดกลับเมื่อออกจากหน้า
  useEffect(() => {
    document.body.style.overflow = "hidden"; // ปิด Scroll

    return () => {
      document.body.style.overflow = "auto"; // เปิด Scroll เมื่อออกจากหน้านี้
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // เคลียร์ error ก่อนเริ่ม

    try {
      // สมัครสมาชิก
      const userCredential = await register(email, password);

      if (!userCredential || !userCredential.user) {
        throw new Error("User registration failed.");
      }

      const user = userCredential.user;

      // อัปเดต displayName ใน Firebase Authentication
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // บันทึกข้อมูลลง Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
      });

      // นำทางไปหน้า Login
      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Register</h2>
        {error && <p className="register-error">{error}</p>}
        <form className="register-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="register-input"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="register-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
            required
          />
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
