import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaBoxes,
  FaListAlt,
  FaTags,
  FaDollarSign,
  FaPercentage,
  FaGift,
  FaTools,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ children }) => {
  // ✅ ใช้ state แยกกัน และไม่ต้องปิดอีกอันอัตโนมัติ
  const [salesOpen, setSalesOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const toggleSales = () => {
    setSalesOpen(!salesOpen);
  };

  const toggleManage = () => {
    setManageOpen(!manageOpen);
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <nav className="navbar">
        <ul className="navbar-menu">
          {/* ปุ่ม Home */}
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              <FaHome style={{ marginRight: "10px" }} />
              Home
            </Link>
          </li>

          {/* ปุ่ม Sales */}
          <li className="navbar-item">
            <button className="navbar-link" onClick={toggleSales}>
              <FaBoxes style={{ marginRight: "10px" }} />
              Catalog
              <span className={`dropdown-arrow ${salesOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>
            {salesOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/product-list" className="dropdown-link">
                    <FaListAlt style={{ marginRight: "10px" }} />
                    Product List
                  </Link>
                </li>
                <li>
                  <Link to="/categories-list" className="dropdown-link">
                    <FaTags style={{ marginRight: "10px" }} />
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/promotions" className="dropdown-link">
                    <FaPercentage style={{ marginRight: "10px" }} />
                    Promotions
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* ปุ่ม Manage */}
          <li className="navbar-item">
            <button className="navbar-link" onClick={toggleManage}>
              <FaTools style={{ marginRight: "10px" }} />
              Manage
              <span className={`dropdown-arrow ${manageOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>
            {manageOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/manage-pricing" className="dropdown-link">
                    <FaDollarSign style={{ marginRight: "10px" }} />
                    Manage Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/manage-promotions" className="dropdown-link">
                    <FaGift style={{ marginRight: "10px" }} />
                    Manage Promotions
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Content */}
      <main className="content">{children}</main>
    </div>
  );
};

export default Navbar;
