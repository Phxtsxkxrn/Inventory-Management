import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth.service";
import ChangePasswordModal from "./ChangePasswordModal";
import Swal from "sweetalert2";
import Logo from "../images/Logo.png"; // เพิ่มการ import Logo
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const result = await loginUser(email, password);

    if (result.success) {
      if (result.requirePasswordChange) {
        setTempUser(result.user);
        setShowChangePassword(true);
      } else {
        onLoginSuccess(result.user);
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${result.user.firstName}!`,
          confirmButtonText: "OK",
        });
      }
    } else {
      setError(result.message);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePassword(false);
    onLoginSuccess(tempUser);
    Swal.fire({
      icon: "success",
      title: "Login Successful!",
      text: `Welcome, ${tempUser.firstName}!`,
      confirmButtonText: "OK",
    });
  };

  return (
    <div className="login-container">
      {showChangePassword ? (
        <ChangePasswordModal onSuccess={handlePasswordChangeSuccess} />
      ) : (
        <div className="login-card">
          <div className="login-logo">
            <img src={Logo} alt="Logo" />
          </div>
          <h3 className="login-title">Sign in</h3>
          {error && <p className="login-error">{error}</p>}
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

            <div className="forgot-password-link">
              <span onClick={() => navigate("/reset-password")}>
                Forgot your password?
              </span>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
