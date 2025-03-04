import React, { useState } from "react";
import "./Filter.css"; // Import CSS for styling

const Filter = ({ onFilterChange, isOpen, closeModal }) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastUpdateStart, setLastUpdateStart] = useState("");
  const [lastUpdateEnd, setLastUpdateEnd] = useState("");
  const [status, setStatus] = useState("");

  const handleFilterSubmit = () => {
    if (
      minPrice ||
      maxPrice ||
      startDate ||
      endDate ||
      lastUpdateStart ||
      lastUpdateEnd ||
      status
    ) {
      onFilterChange({
        minPrice,
        maxPrice,
        startDate,
        endDate,
        lastUpdateStart,
        lastUpdateEnd,
        status,
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
        <h3>Filter Products</h3>
        <div className="filter-container">
          <label>
            Price from:
            <input
              type="number"
              placeholder="Price from..."
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </label>
          <label>
            Price to:
            <input
              type="number"
              placeholder="Price to..."
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </label>
          <label>
            Created At from:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            Created At to:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <label>
            Last Update from:
            <input
              type="date"
              value={lastUpdateStart}
              onChange={(e) => setLastUpdateStart(e.target.value)}
            />
          </label>
          <label>
            Last Update to:
            <input
              type="date"
              value={lastUpdateEnd}
              onChange={(e) => setLastUpdateEnd(e.target.value)}
            />
          </label>
          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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

export default Filter;
