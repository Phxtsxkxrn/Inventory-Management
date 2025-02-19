import React, { useState } from "react";
import { loginUser } from "../services/authService"; // นำเข้า loginUser
import Swal from "sweetalert2"; // ใช้ในการแจ้งเตือน
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // รีเซ็ตข้อผิดพลาดก่อน

    const { success, message, user } = await loginUser(email, password);

    if (success) {
      // เรียกใช้งาน onLoginSuccess ที่ส่งมาจาก parent (App.js)
      onLoginSuccess(user); // ส่งข้อมูลผู้ใช้ที่เข้าสู่ระบบ
      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: `Welcome back, ${user.firstName}!`,
        confirmButtonText: "OK",
      });
    } else {
      setError(message); // ถ้ามีข้อผิดพลาดให้แสดงข้อความ
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h3 className="login-title">Sign in</h3>
        {error && <p className="login-error">{error}</p>} {/* แสดงข้อผิดพลาด */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-input-group">
            <label className="login-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <div className="login-input-group">
            <label className="login-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
