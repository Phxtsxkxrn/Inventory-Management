import React, { useState, useEffect } from "react";
import {
  deleteDoc,
  doc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Register from "./Register";
import "./UserList.css";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2
import FilterUser from "./FilterUser"; // เพิ่ม import

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles] = useState(["Employee", "Stock Manager", "Admin"]);

  // ✅ Pagination State
  const [usersPerPage, setUsersPerPage] = useState(10); // จำนวนผู้ใช้ต่อหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const [customInputValue, setCustomInputValue] = useState(""); // เก็บค่าชั่วคราวจากช่อง input
  const [customOptions, setCustomOptions] = useState([10, 20, 30, 50, 100]); // ตัวเลือก dropdown
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // เพิ่ม state สำหรับ filter modal
  const [createdAtFrom, setCreatedAtFrom] = useState(""); // เพิ่ม state สำหรับ filter
  const [createdAtTo, setCreatedAtTo] = useState(""); // เพิ่ม state สำหรับ filter
  const [lastUpdateFrom, setLastUpdateFrom] = useState(""); // เพิ่ม state
  const [lastUpdateTo, setLastUpdateTo] = useState(""); // เพิ่ม state

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
    // ✅ แสดง SweetAlert2 ถามยืนยันก่อนเพิ่มผู้ใช้
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to add this user?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add user!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // ✅ ดึงข้อมูลผู้ใช้ใหม่จาก Firestore หลังจากลงทะเบียนสำเร็จ
        const querySnapshot = await getDocs(collection(db, "users"));
        const updatedUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(updatedUsers); // ✅ อัปเดต state ให้แสดงข้อมูลใหม่
        setShowAddUser(false); // ✅ ปิด modal หลังจากเพิ่มผู้ใช้ใหม่

        // ✅ แจ้งเตือนเมื่อเพิ่มผู้ใช้สำเร็จ
        Swal.fire({
          icon: "success",
          title: "User Added!",
          text: "The user has been successfully registered.",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("🚨 Error updating user list:", error);

        // ✅ แจ้งเตือนเมื่อเกิดข้อผิดพลาด
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "An error occurred while updating the user list.",
          confirmButtonText: "OK",
        });
      }
    }
  };

  // ✅ ฟังก์ชันกรองผู้ใช้ตามคำค้นหา
  const handleFilterChange = ({
    createdAtFrom,
    createdAtTo,
    lastUpdateFrom,
    lastUpdateTo,
  }) => {
    setCreatedAtFrom(createdAtFrom);
    setCreatedAtTo(createdAtTo);
    setLastUpdateFrom(lastUpdateFrom);
    setLastUpdateTo(lastUpdateTo);
  };

  // อัปเดต filteredUsers เพื่อรวมการกรองตามวันที่สร้าง
  const filteredUsers = users.filter((user) => {
    const matchesSearch = Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const createdDate = user.createdAt
      ? new Date(user.createdAt.seconds * 1000)
      : null;

    const lastUpdateDate = user.lastUpdate
      ? new Date(user.lastUpdate.seconds * 1000)
      : null;

    const isInCreatedDateRange =
      (!createdAtFrom ||
        (createdDate && createdDate >= new Date(createdAtFrom))) &&
      (!createdAtTo || (createdDate && createdDate <= new Date(createdAtTo)));

    const isInLastUpdateRange =
      (!lastUpdateFrom ||
        (lastUpdateDate && lastUpdateDate >= new Date(lastUpdateFrom))) &&
      (!lastUpdateTo ||
        (lastUpdateDate && lastUpdateDate <= new Date(lastUpdateTo)));

    return matchesSearch && isInCreatedDateRange && isInLastUpdateRange;
  });

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

  // ✅ ฟังก์ชันลบผู้ใช้
  const handleDeleteUser = async (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "users", userId)); // ลบผู้ใช้จาก Firestore
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== userId)
          ); // อัปเดต state

          Swal.fire("Deleted!", "User has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire("Error!", "Failed to delete user.", "error");
        }
      }
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedAt = new Date(); // ดึงเวลาปัจจุบัน

      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        lastUpdate: updatedAt, // ✅ เพิ่มฟิลด์ lastUpdate
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, role: newRole, lastUpdate: updatedAt }
            : user
        )
      );

      Swal.fire("Success!", "User role updated successfully.", "success");
    } catch (error) {
      console.error("Error updating role:", error);
      Swal.fire("Error!", "Failed to update role.", "error");
    }
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
          <div className="button-group">
            <button
              className="user-add-button"
              onClick={() => setShowAddUser(true)}
            >
              Add User
            </button>
            <button
              className="filter-button"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* เพิ่ม Filter Modal */}
      {isFilterModalOpen && (
        <FilterUser
          onFilterChange={handleFilterChange}
          isOpen={isFilterModalOpen}
          closeModal={() => setIsFilterModalOpen(false)}
        />
      )}

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
            <th>Role</th>
            <th>Created At</th>
            <th>Last Update</th>
            <th>Actions</th>
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
                <td>
                  <select
                    className="role-dropdown"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{formatDate(user.lastUpdate)}</td>
                <td>
                  <button
                    className="delete-user"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ แสดง Register Form */}
      {showAddUser && (
        <Register
          onUserAdded={handleUserAdded}
          onClose={() => setShowAddUser(false)}
        />
      )}
    </div>
  );
};

export default UserList;
