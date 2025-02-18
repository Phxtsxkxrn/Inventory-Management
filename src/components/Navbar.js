import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ใช้ useNavigate
import {
  FaHome,
  FaBoxes,
  FaListAlt,
  FaTags,
  FaDollarSign,
  FaPercentage,
  FaGift,
  FaTools,
  FaUserCircle,
  FaUserSecret,
  FaUsers,
  FaEdit,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ children }) => {
  const [salesOpen, setSalesOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false); // สำหรับแสดง/ซ่อน dropdown ของ Users
  const userRole = localStorage.getItem("userRole");

  const navigate = useNavigate();

  // ดึงข้อมูลผู้ใช้จาก localStorage
  const userEmail = localStorage.getItem("userEmail");
  const user = userEmail ? { email: userEmail } : null;

  const toggleSales = () => setSalesOpen(!salesOpen);
  const toggleManage = () => setManageOpen(!manageOpen);
  const toggleUsers = () => setUsersOpen(!usersOpen); // ฟังก์ชัน toggle สำหรับ Users

  const handleLogout = () => {
    localStorage.removeItem("userEmail"); // ลบข้อมูลผู้ใช้จาก localStorage
    navigate("/login"); // นำไปที่หน้า Login
    window.location.reload(); // รีเฟรชหน้าเพื่อให้แน่ใจว่าข้อมูลเปลี่ยนแปลง
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <nav className="navbar">
        <ul className="navbar-menu">
          {/* ปุ่ม Home */}
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              <FaHome className="icon" />
              Home
            </Link>
          </li>

          {/* ปุ่ม Sales */}
          <li className="navbar-item">
            <button className="navbar-link" onClick={toggleSales}>
              <FaBoxes className="icon" />
              Catalog
              <span className={`dropdown-arrow ${salesOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>
            {salesOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/product-list" className="dropdown-link">
                    <FaListAlt className="icon" />
                    Product List
                  </Link>
                </li>
                <li>
                  <Link to="/categories-list" className="dropdown-link">
                    <FaTags className="icon" />
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/promotions" className="dropdown-link">
                    <FaPercentage className="icon" />
                    Promotions
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* ปุ่ม Manage */}
          {userRole !== "Employee" && (
            <li className="navbar-item">
              <button className="navbar-link" onClick={toggleManage}>
                <FaTools className="icon" />
                Manage
                <span className={`dropdown-arrow ${manageOpen ? "open" : ""}`}>
                  ▼
                </span>
              </button>
              {manageOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/manage-pricing" className="dropdown-link">
                      <FaDollarSign className="icon" />
                      Manage Pricing
                    </Link>
                  </li>
                  <li>
                    <Link to="/manage-promotions" className="dropdown-link">
                      <FaGift className="icon" />
                      Manage Promotions
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* ปุ่ม Users */}
          {userRole !== "Employee" && (
            <li className="navbar-item">
              <button className="navbar-link" onClick={toggleUsers}>
                <FaUserSecret className="icon" />
                Users
                <span className={`dropdown-arrow ${usersOpen ? "open" : ""}`}>
                  ▼
                </span>
              </button>
              {usersOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/users" className="dropdown-link">
                      <FaUsers className="icon" />
                      Users List
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>

        {user && (
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <span className="user-email">{user.email}</span>
            <div className="user-actions">
              <button
                className="edit-profile-button"
                onClick={() => navigate("/edit-profile")}
              >
                <FaEdit className="icon" />
                Edit
              </button>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="content">{children}</main>
    </div>
  );
};

export default Navbar;
