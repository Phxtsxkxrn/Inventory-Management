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
import UserColumnSelector from "./UserColumnSelector";
import { showToast } from "../utils/toast"; // เพิ่ม import

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles] = useState(["Employee", "Manager", "Admin"]);

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
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "index",
    "firstName",
    "lastName",
    "email",
    "role",
    "createdAt",
    "lastUpdate",
    "actions",
  ]);
  const [selectedRole, setSelectedRole] = useState(""); // เพิ่ม state สำหรับ filter role

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
        const querySnapshot = await getDocs(collection(db, "users"));
        const updatedUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(updatedUsers);
        setShowAddUser(false);

        showToast.success("User has been successfully registered");
      } catch (error) {
        console.error("🚨 Error updating user list:", error);
        showToast.error("Failed to register user");
      }
    }
  };

  // ✅ ฟังก์ชันกรองผู้ใช้ตามคำค้นหา
  const handleFilterChange = ({
    createdAtFrom,
    createdAtTo,
    lastUpdateFrom,
    lastUpdateTo,
    role, // เพิ่ม parameter role
  }) => {
    try {
      setCreatedAtFrom(createdAtFrom);
      setCreatedAtTo(createdAtTo);
      setLastUpdateFrom(lastUpdateFrom);
      setLastUpdateTo(lastUpdateTo);
      setSelectedRole(role); // เก็บค่า role ที่เลือก
      showToast.success("Filter applied successfully");
    } catch (error) {
      console.error("Error applying filter:", error);
      showToast.error("Failed to apply filter");
    }
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

    const matchesRole = !selectedRole || user.role === selectedRole;

    return (
      matchesSearch &&
      isInCreatedDateRange &&
      isInLastUpdateRange &&
      matchesRole
    );
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
      showToast.success(`Successfully set ${value} users per page`);
    } else {
      showToast.error("Please enter a valid number greater than 0");
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

  // Add role hierarchy constant at the top level of the component
  const roleHierarchy = {
    Admin: 3,
    Manager: 2,
    Employee: 1,
  };

  // ✅ ฟังก์ชันลบผู้ใช้
  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find((user) => user.id === userId);
    const currentUserEmail = localStorage.getItem("userEmail");
    const currentUser = users.find((user) => user.email === currentUserEmail);

    // Prevent self-deletion
    if (userToDelete.email === currentUserEmail) {
      showToast.error("You cannot delete your own account");
      return;
    }

    // Check role hierarchy
    if (roleHierarchy[userToDelete.role] >= roleHierarchy[currentUser.role]) {
      showToast.error("You cannot delete users with equal or higher role");
      return;
    }

    // If Manager role, prevent deleting Admin users (existing check)
    if (currentUser?.role === "Manager" && userToDelete?.role === "Admin") {
      showToast.error("Managers cannot delete Admin users");
      return;
    }

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
          await deleteDoc(doc(db, "users", userId));
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== userId)
          );
          showToast.success("User has been deleted successfully");
        } catch (error) {
          console.error("Error deleting user:", error);
          showToast.error("Failed to delete user");
        }
      }
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    const userToUpdate = users.find((user) => user.id === userId);
    const currentUser = users.find(
      (user) => user.email === localStorage.getItem("userEmail")
    );

    // ตรวจสอบเงื่อนไขสำหรับ Manager
    if (currentUser?.role === "Manager") {
      if (userToUpdate?.role === "Admin") {
        showToast.error("Managers cannot modify Admin roles");
        return;
      }
      if (newRole === "Admin" || newRole === "Manager") {
        showToast.error("Managers cannot assign Admin or Manager roles");
        return;
      }
    }

    try {
      const updatedAt = new Date();
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        lastUpdate: updatedAt,
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, role: newRole, lastUpdate: updatedAt }
            : user
        )
      );

      showToast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      showToast.error("Failed to update role");
    }
  };

  // Add columns configuration
  const columns = [
    { key: "index", label: "#" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "createdAt", label: "Created At" },
    { key: "lastUpdate", label: "Last Update" },
    { key: "actions", label: "Actions" },
  ];

  // Add column toggle handler
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  // เพิ่มการดึง current user role
  const currentUserRole = users.find(
    (user) => user.email === localStorage.getItem("userEmail")
  )?.role;

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
            <button
              className="columns-button"
              onClick={() => setIsColumnSelectorOpen(true)}
            >
              Columns
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
          roles={roles} // ส่ง roles ไปให้ FilterUser
          selectedRole={selectedRole} // ส่งค่า role ที่เลือกไปด้วย
        />
      )}

      {/* Add ColumnSelector component before the table */}
      {isColumnSelectorOpen && (
        <UserColumnSelector
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          onClose={() => setIsColumnSelectorOpen(false)}
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
            {columns
              .filter((col) => visibleColumns.includes(col.key))
              .map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {displayedUsers.length > 0 ? (
            displayedUsers.map((user, index) => (
              <tr key={user.id}>
                {visibleColumns.includes("index") && <td>{index + 1}</td>}
                {visibleColumns.includes("firstName") && (
                  <td>{user.firstName}</td>
                )}
                {visibleColumns.includes("lastName") && (
                  <td>{user.lastName}</td>
                )}
                {visibleColumns.includes("email") && <td>{user.email}</td>}
                {visibleColumns.includes("role") && (
                  <td>
                    <select
                      className="role-dropdown"
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                {visibleColumns.includes("createdAt") && (
                  <td>{formatDate(user.createdAt)}</td>
                )}
                {visibleColumns.includes("lastUpdate") && (
                  <td>{formatDate(user.lastUpdate)}</td>
                )}
                {visibleColumns.includes("actions") && (
                  <td>
                    <button
                      className="delete-user"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={visibleColumns.length}>No users found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ แสดง Register Form */}
      {showAddUser && (
        <Register
          onUserAdded={handleUserAdded}
          onClose={() => setShowAddUser(false)}
          currentUserRole={currentUserRole}
        />
      )}
    </div>
  );
};

export default UserList;
