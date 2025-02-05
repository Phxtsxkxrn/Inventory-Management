import React, { useState, useEffect } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // ✅ Import CSS ที่แยกไว้

const Login = () => {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/"); // เปลี่ยนไปที่ Home.js
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
