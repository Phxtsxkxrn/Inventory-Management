import React, { useState } from "react";
import "./FilterUser.css";

const FilterUser = ({
  onFilterChange,
  isOpen,
  closeModal,
  roles,
  selectedRole,
}) => {
  const [createdAtFrom, setCreatedAtFrom] = useState("");
  const [createdAtTo, setCreatedAtTo] = useState("");
  const [lastUpdateFrom, setLastUpdateFrom] = useState("");
  const [lastUpdateTo, setLastUpdateTo] = useState("");
  const [role, setRole] = useState(selectedRole);

  const handleApplyFilter = () => {
    onFilterChange({
      createdAtFrom,
      createdAtTo,
      lastUpdateFrom,
      lastUpdateTo,
      role,
    });
    closeModal();
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
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="role-select"
            >
              <option value="">All roles</option>
              {roles.map((role) => (
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
              onClick={handleApplyFilter}
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
