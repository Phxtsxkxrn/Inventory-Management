import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Register from "./Register";
import "./UserList.css"; // ✅ สไตล์แยกไฟล์

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);

  // ✅ ดึงข้อมูล Users จาก Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2 className="user-list-title">User List</h2>
        <button
          className="add-user-button"
          onClick={() => setShowAddUser(true)}
        >
          + Add User
        </button>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Registered Date</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ แสดง Register Form เป็น Modal */}
      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowAddUser(false)}
            >
              ×
            </button>
            <Register onRegisterSuccess={() => setShowAddUser(false)} />
            <Register onClose={() => setShowAddUser(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
