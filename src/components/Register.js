import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { registerUser } from "../services/auth.service";
import Swal from "sweetalert2";
import { doc, getDoc } from "firebase/firestore"; // Added for duplicate check
import { db } from "../services/firebaseConfig"; // Added for duplicate check
import { showToast } from "../utils/toast"; // Added for toast notifications
import "./Register.css";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: yup.string().required("Role is required"),
});

const Register = ({ onUserAdded, onClose, currentUserRole }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "Employee",
    },
  });

  // เพิ่มฟังก์ชันสำหรับกำหนดตัวเลือก role
  const getAvailableRoles = () => {
    if (currentUserRole === "Manager") {
      return ["Employee"];
    }
    return ["Employee", "Manager", "Admin"];
  };

  const onSubmit = async (data) => {
    // Check if email already exists in the document
    const userDocRef = doc(db, "users", data.email);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      showToast.error("User already exists");
      return;
    }

    try {
      const { success, message, userId } = await registerUser(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.role
      );

      if (success) {
        Swal.fire({
          icon: "success",
          title: "User Registered!",
          text: "The user has been successfully added.",
          confirmButtonText: "OK",
        });

        if (onUserAdded) {
          onUserAdded({
            id: userId,
            ...data,
            createdAt: new Date(),
            lastUpdate: new Date(),
          });
        }
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: message,
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred during registration",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="register-modal">
      <div className="register-modal-content">
        <h3 className="register-title">Register</h3>
        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="register-input-group">
            <label className="register-label">First Name:</label>
            <input
              type="text"
              className="register-input"
              {...register("firstName")}
            />
            {errors.firstName && (
              <span className="error-message">{errors.firstName.message}</span>
            )}
          </div>

          <div className="register-input-group">
            <label className="register-label">Last Name:</label>
            <input
              type="text"
              className="register-input"
              {...register("lastName")}
            />
            {errors.lastName && (
              <span className="error-message">{errors.lastName.message}</span>
            )}
          </div>

          <div className="register-input-group">
            <label className="register-label">Email:</label>
            <input
              type="email"
              className="register-input"
              {...register("email")}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="register-input-group">
            <label className="register-label">Password:</label>
            <input
              type="password"
              className="register-input"
              {...register("password")}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="register-select-group">
            <label className="register-label">Role:</label>
            <select className="register-select" {...register("role")}>
              {getAvailableRoles().map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && (
              <span className="error-message">{errors.role.message}</span>
            )}
          </div>

          <div className="register-button-group">
            <button type="submit" className="register-button register-submit">
              Register
            </button>
            <button
              type="button"
              className="register-button register-close"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
