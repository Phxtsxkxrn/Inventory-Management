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

      Swal.fire({
        icon: "success",
        title: "User Registered!",
        text: "The user has been successfully added.",
        confirmButtonText: "OK",
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");

      if (onClose) onClose();
    } catch (error) {
      console.error("Registration Error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="register-modal" onClick={onClose}>
      <div
        className="register-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="register-title">Register</h3>
        {error && <p className="register-error">{error}</p>}
        <form className="register-form" onSubmit={handleRegister}>
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
