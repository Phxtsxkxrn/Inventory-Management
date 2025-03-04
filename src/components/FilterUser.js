import React, { useState } from "react";
import "./FilterUser.css";

const FilterUser = ({ onFilterChange, isOpen, closeModal }) => {
  const [createdAtFrom, setCreatedAtFrom] = useState("");
  const [createdAtTo, setCreatedAtTo] = useState("");
  const [lastUpdateFrom, setLastUpdateFrom] = useState("");
  const [lastUpdateTo, setLastUpdateTo] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const roles = ["", "Employee", "Stock Manager", "Admin"]; // เพิ่มค่าว่างสำหรับ "All roles"

  const handleFilterSubmit = () => {
    if (
      createdAtFrom ||
      createdAtTo ||
      lastUpdateFrom ||
      lastUpdateTo ||
      selectedRole
    ) {
      onFilterChange({
        createdAtFrom,
        createdAtTo,
        lastUpdateFrom,
        lastUpdateTo,
        role: selectedRole,
      });
      closeModal();
    } else {
      alert("Please enter at least one filter criteria");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="filter-modal">
      <div className="filter-modal-content">
        <h3>Filter Users</h3>
        <div className="filter-container">
          <label>
            Role:
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-select"
            >
              <option value="">All roles</option>
              {roles.slice(1).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            Created Date From:
            <input
              type="date"
              value={createdAtFrom}
              onChange={(e) => setCreatedAtFrom(e.target.value)}
            />
          </label>
          <label>
            Created Date To:
            <input
              type="date"
              value={createdAtTo}
              onChange={(e) => setCreatedAtTo(e.target.value)}
            />
          </label>
          <label>
            Last Update From:
            <input
              type="date"
              value={lastUpdateFrom}
              onChange={(e) => setLastUpdateFrom(e.target.value)}
            />
          </label>
          <label>
            Last Update To:
            <input
              type="date"
              value={lastUpdateTo}
              onChange={(e) => setLastUpdateTo(e.target.value)}
            />
          </label>
          <div className="filter-button-group">
            <button
              onClick={handleFilterSubmit}
              className="filter-modal-button filter"
            >
              Filter
            </button>
            <button onClick={closeModal} className="filter-modal-button cancel">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterUser;
