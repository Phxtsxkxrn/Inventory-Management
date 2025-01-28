import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaShoppingCart, FaListAlt, FaTags } from "react-icons/fa"; // Import icons
import "./Navbar.css";

const Navbar = ({ children }) => {
  // รับ `children` เพื่อแสดงเนื้อหาในส่วน Content
  const [salesOpen, setSalesOpen] = useState(false);

  const toggleSales = () => setSalesOpen(!salesOpen);

  return (
    <div className="layout">
      {/* Sidebar */}
      <nav className="navbar">
        <ul className="navbar-menu">
          {/* ปุ่ม Home */}
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              <FaHome style={{ marginRight: "10px" }} /> {/* Home Icon */}
              Home
            </Link>
          </li>

          {/* ปุ่ม Sales */}
          <li className="navbar-item">
            <button className="navbar-link" onClick={toggleSales}>
              <FaShoppingCart style={{ marginRight: "10px" }} />{" "}
              {/* Sales Icon */}
              Sales
              <span className={`dropdown-arrow ${salesOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>
            {salesOpen && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/product-list" className="dropdown-link">
                    <FaListAlt style={{ marginRight: "10px" }} />{" "}
                    {/* Product List Icon */}
                    Product List
                  </Link>
                </li>
                <li>
                  <Link to="/categories-list" className="dropdown-link">
                    <FaTags style={{ marginRight: "10px" }} />{" "}
                    {/* Categories Icon */}
                    Categories
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
