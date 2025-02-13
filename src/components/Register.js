import React, { useState } from "react";
import { registerUser } from "../services/authService"; // นำเข้า registerUser
import Swal from "sweetalert2"; // ใช้ในการแจ้งเตือน
import "./Register.css"; // นำเข้าไฟล์ CSS

const Register = ({ onUserAdded, onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("Employee");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // รีเซ็ตข้อผิดพลาดก่อน

    const { success, message, userId } = await registerUser(
      firstName,
      lastName,
      email,
      password,
      role // ✅ ส่ง role ไปด้วย
    );

    if (success) {
      Swal.fire({
        icon: "success",
        title: "User Registered!",
        text: "The user has been successfully added.",
        confirmButtonText: "OK",
      });

      // ✅ ส่งข้อมูลใหม่ไปยัง `UserList.js`
      if (onUserAdded) {
        onUserAdded({
          id: userId, // ใช้ ID จาก Firestore
          firstName,
          lastName,
          email,
          role, // ✅ รวม role
          createdAt: new Date(),
          lastUpdate: new Date(),
        });
      }

      onClose(); // ✅ ปิด modal หลังจากลงทะเบียนเสร็จ
    } else {
      setError(message); // ✅ แสดงข้อความผิดพลาด
    }
  };

  return (
    <div className="register-modal" onClick={onClose}>
      <div
        className="register-modal-content"
        onClick={(e) => e.stopPropagation()} // ป้องกัน Modal ปิดเมื่อคลิกข้างใน
      >
        <h3 className="register-title">Register</h3>
        {error && <p className="register-error">{error}</p>}{" "}
        {/* แสดงข้อผิดพลาด */}
        <form className="register-form" onSubmit={handleRegister}>
          {/* First Name */}
          <div className="register-input-group">
            <label className="register-label">First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="register-input"
              required
            />
          </div>

          {/* Last Name */}
          <div className="register-input-group">
            <label className="register-label">Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="register-input"
              required
            />
          </div>

          {/* Email */}
          <div className="register-input-group">
            <label className="register-label">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register-input"
              required
            />
          </div>

          {/* Password */}
          <div className="register-input-group">
            <label className="register-label">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-input"
              required
            />
          </div>

          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Employee">Employee</option>
            <option value="Stock Manager">Stock Manager</option>
            <option value="Admin">Admin</option>
          </select>

          {/* ปุ่ม Register และ Close */}
          <div className="register-button-group">
            <button type="submit" className="register-button save">
              Register
            </button>
            <button
              type="button"
              className="register-button cancel"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
