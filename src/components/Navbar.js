import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaShoppingCart, FaListAlt, FaTags } from "react-icons/fa"; // Import icons
import "./Navbar.css";

const Navbar = () => {
  const [salesOpen, setSalesOpen] = useState(false);

  const toggleSales = () => setSalesOpen(!salesOpen);

  return (
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
            <FaShoppingCart style={{ marginRight: "10px" }} /> {/* Sales Icon */}
            Sales
            <span className={`dropdown-arrow ${salesOpen ? "open" : ""}`}>▼</span>
          </button>
          {salesOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/product-list" className="dropdown-link">
                  <FaListAlt style={{ marginRight: "10px" }} /> {/* Product List Icon */}
                  Product List
                </Link>
              </li>
              <li>
                <Link to="/categories-list" className="dropdown-link">
                  <FaTags style={{ marginRight: "10px" }} /> {/* Categories Icon */}
                  Categories
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
