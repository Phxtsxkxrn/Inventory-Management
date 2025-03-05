import React from "react";
import "./ColumnSelector.css";

const ColumnSelector = ({
  columns,
  visibleColumns,
  onColumnToggle,
  onClose,
}) => {
  return (
    <div className="column-selector-modal">
      <div className="column-selector-content">
        <h3>Select Columns</h3>
        <div className="column-list">
          {columns.map((column) => (
            <label key={column.key} className="column-option">
              <input
                type="checkbox"
                checked={visibleColumns.includes(column.key)}
                onChange={() => onColumnToggle(column.key)}
              />
              {column.label}
            </label>
          ))}
        </div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ColumnSelector;
