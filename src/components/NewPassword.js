import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { showToast } from "../utils/toast";
import { hashPassword } from "../services/cryptoutils.service";
import "./NewPassword.css";

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast.error("Invalid session. Please try again");
      navigate("/reset-password");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showToast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const hashedPassword = await hashPassword(newPassword);
      const userRef = doc(db, "users", email);
      await updateDoc(userRef, {
        password: hashedPassword,
        lastUpdate: new Date(),
      });

      showToast.success("Password updated successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error updating password:", error);
      showToast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="np-container">
      <div className="np-card">
        <h2>Set New Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="np-form-group">
            <label>New Password</label>
            <input
              type="password"
              className="np-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          <div className="np-form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="np-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          <div className="np-button-group">
            <button type="submit" className="np-button" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
