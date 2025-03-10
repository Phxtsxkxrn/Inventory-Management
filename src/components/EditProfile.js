import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Swal from "sweetalert2";
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";
import { hashPassword, verifyPassword } from "../services/cryptoutils.service";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  passwordConfirmation: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

const EditProfile = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return;
      try {
        const userRef = doc(db, "users", userEmail);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          reset(userSnap.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userEmail, reset]);

  const onSubmit = async (data) => {
    // Ask for current password verification first
    const { value: currentPassword } = await Swal.fire({
      title: "Verify Your Identity",
      text: "Please enter your current password to continue",
      input: "password",
      inputPlaceholder: "Enter your current password",
      showCancelButton: true,
      confirmButtonText: "Verify and Update",
      showLoaderOnConfirm: true,
      inputValidator: (value) => {
        if (!value) {
          return "Please enter your current password";
        }
      },
    });

    if (!currentPassword) return; // ถ้าผู้ใช้กด cancel

    try {
      // ตรวจสอบรหัสผ่านปัจจุบัน
      const userRef = doc(db, "users", userEmail);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const isValid = await verifyPassword(currentPassword, userData.password);
      if (!isValid) {
        Swal.fire({
          icon: "error",
          title: "Invalid Password",
          text: "Current password is incorrect",
        });
        return;
      }

      // สร้างข้อมูลที่จะอัพเดท
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      };

      // เพิ่มรหัสผ่านใหม่ถ้ามีการกรอก
      if (data.newPassword) {
        updateData.password = await hashPassword(data.newPassword);
      }

      // อัพเดทข้อมูล
      await updateDoc(userRef, updateData);

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been updated successfully.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while updating your profile.",
      });
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h3>Edit Profile</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="edit-profile-input-group">
            <label>First Name:</label>
            <input type="text" {...register("firstName")} />
            {errors.firstName && (
              <span className="error-message">{errors.firstName.message}</span>
            )}
          </div>

          <div className="edit-profile-input-group">
            <label>Last Name:</label>
            <input type="text" {...register("lastName")} />
            {errors.lastName && (
              <span className="error-message">{errors.lastName.message}</span>
            )}
          </div>

          <div className="edit-profile-input-group">
            <label>Email:</label>
            <input type="email" {...register("email")} />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="edit-profile-input-group">
            <label>New Password (optional):</label>
            <input
              type="password"
              {...register("newPassword")}
              placeholder="Leave blank to keep current password"
            />
            {errors.newPassword && (
              <span className="error-message">
                {errors.newPassword.message}
              </span>
            )}
          </div>

          <div className="edit-profile-input-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              {...register("passwordConfirmation")}
              placeholder="Confirm new password"
            />
            {errors.passwordConfirmation && (
              <span className="error-message">
                {errors.passwordConfirmation.message}
              </span>
            )}
          </div>

          <button type="submit" className="save-profile-button">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
