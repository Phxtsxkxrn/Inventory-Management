import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Register from "./Register";
import "./UserList.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Pagination State
  const [usersPerPage, setUsersPerPage] = useState(10); // จำนวนผู้ใช้ต่อหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const [customInputValue, setCustomInputValue] = useState(""); // เก็บค่าชั่วคราวจากช่อง input
  const [customOptions, setCustomOptions] = useState([10, 20, 30, 50, 100]); // ตัวเลือก dropdown

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

  // ✅ ฟังก์ชันอัปเดตรายการผู้ใช้ทันทีเมื่อเพิ่มผู้ใช้ใหม่
  const handleUserAdded = async (newUser) => {
    try {
      // ✅ ดึงข้อมูลผู้ใช้ใหม่จาก Firestore หลังจากลงทะเบียนสำเร็จ
      const querySnapshot = await getDocs(collection(db, "users"));
      const updatedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(updatedUsers); // ✅ อัปเดต state ให้แสดงข้อมูลใหม่
      setShowAddUser(false); // ✅ ปิด modal หลังจากเพิ่มผู้ใช้ใหม่
    } catch (error) {
      console.error("Error updating user list:", error);
    }
  };

  // ✅ ฟังก์ชันกรองผู้ใช้ตามคำค้นหา
  const filteredUsers = users.filter((user) =>
    Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // ✅ คำนวณ Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // ✅ ฟังก์ชันเปลี่ยนจำนวนผู้ใช้ต่อหน้า
  const handleUsersPerPageChange = (e) => {
    const value =
      e.target.value === "custom" ? 0 : parseInt(e.target.value, 10);
    setUsersPerPage(value);
    setCurrentPage(1); // กลับไปหน้าแรก
  };

  // ✅ ฟังก์ชันเพิ่มค่า Custom
  const handleCustomInputChange = (e) => {
    setCustomInputValue(e.target.value);
  };

  const handleCustomUsersPerPageSubmit = () => {
    const value = parseInt(customInputValue, 10);
    if (!isNaN(value) && value > 0) {
      setCustomOptions((prevOptions) =>
        prevOptions.includes(value)
          ? prevOptions
          : [...prevOptions, value].sort((a, b) => a - b)
      );
      setUsersPerPage(value);
      setCurrentPage(1);
      setCustomInputValue(""); // รีเซ็ตค่าช่อง input
    }
  };

  // ฟังก์ชันแปลง timestamp เป็นวันที่อ่านง่าย
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="user-list-container">
      {/* ✅ Header: ค้นหา และปุ่ม Add User */}
      <div className="user-header">
        <h2 className="user-title">User List</h2>
        <div className="header-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="user-add-button"
            onClick={() => setShowAddUser(true)}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* ✅ Pagination Controls */}
      <div className="pagination-container">
        <div className="records-found">
          {filteredUsers.length}{" "}
          {filteredUsers.length === 1 ? "record" : "records"} found
        </div>
        <div
          className={`pagination-controls ${
            usersPerPage === 0
              ? "user-pagination-custom"
              : "user-pagination-default"
          }`}
        >
          <label htmlFor="users-per-page">Users per page:</label>
          <select
            id="users-per-page"
            value={usersPerPage === 0 ? "custom" : usersPerPage}
            onChange={handleUsersPerPageChange}
          >
            {customOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
          {usersPerPage === 0 && (
            <div className="custom-users-per-page">
              <input
                type="number"
                min="1"
                className="custom-input"
                placeholder="Enter number"
                value={customInputValue}
                onChange={handleCustomInputChange}
              />
              <button
                className="custom-submit-button"
                onClick={handleCustomUsersPerPageSubmit}
              >
                Submit
              </button>
            </div>
          )}
          <div className="page-navigation">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ✅ ตารางแสดงผู้ใช้ */}
      <table className="user-table">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Last Update</th>
          </tr>
        </thead>
        <tbody>
          {displayedUsers.length > 0 ? (
            displayedUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{formatDate(user.lastUpdate)}</td>
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
            <Register
              onUserAdded={handleUserAdded}
              onClose={() => setShowAddUser(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
