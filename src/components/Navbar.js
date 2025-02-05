import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { auth } from "../services/firebaseConfig"; // ✅ Import Firebase auth
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
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ children }) => {
  const [salesOpen, setSalesOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ ดึงข้อมูล user ปัจจุบัน
  const user = auth.currentUser;

  const toggleSales = () => setSalesOpen(!salesOpen);
  const toggleManage = () => setManageOpen(!manageOpen);
  const toggleUsers = () => setUsersOpen(!usersOpen);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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

          {/* ปุ่ม Users */}
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
                  <Link to="/register" className="dropdown-link">
                    <FaUsers className="icon" />
                    Register Users
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>

        {/* ✅ แสดงอีเมลของผู้ใช้ (ถ้ามี) */}
        {user && (
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <span className="user-email">{user.email}</span>
          </div>
        )}

        {/* ปุ่ม Logout */}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* Content */}
      <main className="content">{children}</main>
    </div>
  );
};

export default Navbar;
