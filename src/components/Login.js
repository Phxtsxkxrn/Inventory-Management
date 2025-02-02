import React, { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // ✅ Import CSS ที่แยกไว้

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    <div className="container">
      <div className="card">
        <h2 className="title">Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin} className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
