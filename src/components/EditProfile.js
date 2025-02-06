import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Swal from "sweetalert2";
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return;
      try {
        const userRef = doc(db, "users", userEmail);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userEmail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, "users", userEmail);
      await updateDoc(userRef, userData);

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been updated successfully.",
        confirmButtonText: "OK",
      });

      navigate("/"); // ✅ กลับไปหน้า Home หลังแก้ไขเสร็จ
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h3>Edit Profile</h3>
        <form onSubmit={handleUpdate}>
          <div className="edit-profile-input-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="edit-profile-input-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="edit-profile-input-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="edit-profile-input-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleInputChange}
              required
            />
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
