import React, { useState } from "react";
import { Link } from "react-router-dom";
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
            <span className="icon">🏠</span> Home
          </Link>
        </li>

        {/* ปุ่ม Sales */}
        <li className="navbar-item">
          <button className="navbar-link" onClick={toggleSales}>
            <span className="icon">📄</span> Sales
            <span className={`dropdown-arrow ${salesOpen ? "open" : ""}`}>▼</span>
          </button>
          {salesOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/product-list" className="dropdown-link">
                  Product List
                </Link>
              </li>
              <li>
                <Link to="/categories-list" className="dropdown-link">
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
