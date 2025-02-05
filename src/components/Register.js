import React, { useState } from "react";
import { register } from "../services/authService";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Swal from "sweetalert2";
import "./Register.css";

const Register = ({ onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await register(email, password);
      if (!userCredential || !userCredential.user) {
        throw new Error("User registration failed.");
      }
      const user = userCredential.user;

      await updateProfile(user, { displayName: `${firstName} ${lastName}` });

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
      });

      // ✅ แจ้งเตือนเมื่อสมัครสำเร็จ
      Swal.fire({
        icon: "success",
        title: "User Registered!",
        text: "The user has been successfully added.",
        confirmButtonText: "OK",
      });

      // ✅ รีเซ็ตฟอร์ม
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");

      // ✅ ปิด Modal หลังจากสมัครเสร็จ
      if (onClose) onClose();
    } catch (error) {
      console.error("Registration Error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="register-title">Register</h3>
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

          {/* ✅ ปุ่ม Register และ Close อยู่ข้างกัน */}
          <div className="modal-buttons">
            <button
              type="button"
              className="close-modal-button"
              onClick={onClose}
            >
              Close
            </button>
            <button type="submit" className="register-button">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
