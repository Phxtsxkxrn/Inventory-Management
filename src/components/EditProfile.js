import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Swal from "sweetalert2";
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";

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
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your profile?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    });

    if (result.isConfirmed) {
      try {
        const userRef = doc(db, "users", userEmail);
        await updateDoc(userRef, data);

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
            <label>Password:</label>
            <input type="password" {...register("password")} />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
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
