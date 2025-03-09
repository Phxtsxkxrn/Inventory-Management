import React, { useState } from "react";
import "./FilterPromotion.css";
import { showToast } from "../utils/toast";

const FilterPromotion = ({ onFilterChange, isOpen, closeModal }) => {
  const [minDiscount, setMinDiscount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startDateTimeFrom, setStartDateTimeFrom] = useState("");
  const [startDateTimeTo, setStartDateTimeTo] = useState("");
  const [endDateTimeFrom, setEndDateTimeFrom] = useState("");
  const [endDateTimeTo, setEndDateTimeTo] = useState("");

  const handleFilterSubmit = () => {
    if (
      minDiscount ||
      maxDiscount ||
      startDateTimeFrom ||
      startDateTimeTo ||
      endDateTimeFrom ||
      endDateTimeTo
    ) {
      try {
        onFilterChange({
          minDiscount,
          maxDiscount,
          startDateTimeFrom,
          startDateTimeTo,
          endDateTimeFrom,
          endDateTimeTo,
        });
        showToast.success("Filter applied successfully");
        closeModal();
      } catch (error) {
        showToast.error("Failed to apply filter");
      }
    } else {
      showToast.warning("Please enter at least one filter criteria");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="filter-modal">
      <div className="filter-modal-content">
        <h3>Filter Promotions</h3>
        <div className="filter-container">
          <label>
            Discount from (%):
            <input
              type="number"
              placeholder="Discount from..."
              value={minDiscount}
              onChange={(e) => setMinDiscount(e.target.value)}
            />
          </label>
          <label>
            Discount to (%):
            <input
              type="number"
              placeholder="Discount to..."
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
            />
          </label>
          <label>
            Start Date & Time from:
            <input
              type="datetime-local"
              value={startDateTimeFrom}
              onChange={(e) => setStartDateTimeFrom(e.target.value)}
            />
          </label>
          <label>
            Start Date & Time to:
            <input
              type="datetime-local"
              value={startDateTimeTo}
              onChange={(e) => setStartDateTimeTo(e.target.value)}
            />
          </label>
          <label>
            End Date & Time from:
            <input
              type="datetime-local"
              value={endDateTimeFrom}
              onChange={(e) => setEndDateTimeFrom(e.target.value)}
            />
          </label>
          <label>
            End Date & Time to:
            <input
              type="datetime-local"
              value={endDateTimeTo}
              onChange={(e) => setEndDateTimeTo(e.target.value)}
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

export default FilterPromotion;
