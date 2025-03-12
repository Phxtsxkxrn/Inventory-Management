import React, { useState, useEffect } from "react";
import { getPromotions, deletePromotion } from "../services/promotion.service";
import AddPromotion from "./AddPromotion";
import FilterPromotion from "./FilterPromotion"; // Import FilterPromotion
import PromotionColumnSelector from "./PromotionColumnSelector";
import "./Promotions.css";
import Swal from "sweetalert2";
import { showToast } from "../utils/toast";

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State สำหรับเก็บคำค้นหา
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // State for filter modal
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "checkbox", // เพิ่ม checkbox ในค่าเริ่มต้น
    "name",
    "discount",
    "startDateTime",
    "endDateTime",
    "actions",
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [promotionsPerPage, setPromotionsPerPage] = useState(10);
  const [promotionsPerPageOptions, setPromotionsPerPageOptions] = useState([
    5, 10, 20, 50,
  ]);
  const [customInputValue, setCustomInputValue] = useState("");
  const [minDiscount, setMinDiscount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startDateTimeFrom, setStartDateTimeFrom] = useState("");
  const [startDateTimeTo, setStartDateTimeTo] = useState("");
  const [endDateTimeFrom, setEndDateTimeFrom] = useState("");
  const [endDateTimeTo, setEndDateTimeTo] = useState("");
  const userRole = localStorage.getItem("userRole");
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchPromotions = async () => {
      const data = await getPromotions();
      const sortedData = data.sort(
        (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
      );
      setPromotions(sortedData);
    };
    fetchPromotions();
  }, []);

  const handlePromotionAdded = (newPromo) => {
    setPromotions([...promotions, newPromo]);
    setIsModalOpen(false);
  };

  const handleDeletePromotion = async (promotionId) => {
    // ยังคงใช้ SweetAlert2 สำหรับการยืนยันการลบ
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this promotion?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deletePromotion(promotionId);
        const updatedPromotions = promotions.filter(
          (promotion) => promotion.id !== promotionId
        );
        setPromotions(updatedPromotions);
        showToast.success("Promotion deleted successfully");
      } catch (error) {
        console.error("Error deleting promotion:", error);
        showToast.error("Failed to delete promotion");
      }
    }
  };

  const handleFilterChange = ({
    minDiscount,
    maxDiscount,
    startDateTimeFrom,
    startDateTimeTo,
    endDateTimeFrom,
    endDateTimeTo,
  }) => {
    setMinDiscount(minDiscount);
    setMaxDiscount(maxDiscount);
    setStartDateTimeFrom(startDateTimeFrom);
    setStartDateTimeTo(startDateTimeTo);
    setEndDateTimeFrom(endDateTimeFrom);
    setEndDateTimeTo(endDateTimeTo);
  };

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  // ฟังก์ชัน Submit ค่าจาก Custom Input
  const handleCustomSubmit = () => {
    const customValue = parseInt(customInputValue, 10);
    if (!isNaN(customValue) && customValue > 0) {
      if (!promotionsPerPageOptions.includes(customValue)) {
        setPromotionsPerPageOptions(
          [...promotionsPerPageOptions, customValue].sort((a, b) => a - b)
        );
      }
      setPromotionsPerPage(customValue);
      setCurrentPage(1);
      setCustomInputValue("");
    }
  };

  // กรองข้อมูลตามคำค้นหาและส่วนลด
  const filteredPromotions = promotions
    .filter((promo) =>
      promo.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((promo) => {
      const discount = promo.discount || 0;
      const promoStartDT = new Date(promo.startDateTime);
      const promoEndDT = promo.endDateTime
        ? new Date(promo.endDateTime)
        : new Date(`${promo.endDate}T${promo.endTime}`);
      const isDiscountOk =
        (minDiscount === "" || discount >= minDiscount) &&
        (maxDiscount === "" || discount <= maxDiscount);
      const isStartDateTimeOk =
        (startDateTimeFrom === "" ||
          promoStartDT >= new Date(startDateTimeFrom)) &&
        (startDateTimeTo === "" || promoStartDT <= new Date(startDateTimeTo));
      const isEndDateTimeOk =
        (endDateTimeFrom === "" || promoEndDT >= new Date(endDateTimeFrom)) &&
        (endDateTimeTo === "" || promoEndDT <= new Date(endDateTimeTo));
      return isDiscountOk && isStartDateTimeOk && isEndDateTimeOk;
    });

  // Add sorting to filteredPromotions
  const sortedPromotions = React.useMemo(() => {
    let sortablePromotions = [...filteredPromotions];
    if (sortConfig.key) {
      sortablePromotions.sort((a, b) => {
        if (["startDateTime", "endDateTime"].includes(sortConfig.key)) {
          const aDate = new Date(
            `${a[sortConfig.key.replace("DateTime", "Date")]}T${
              a[sortConfig.key.replace("DateTime", "Time")]
            }`
          );
          const bDate = new Date(
            `${b[sortConfig.key.replace("DateTime", "Date")]}T${
              b[sortConfig.key.replace("DateTime", "Time")]
            }`
          );
          return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
        }
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortablePromotions;
  }, [filteredPromotions, sortConfig]);

  // คำนวณ Pagination
  const totalPages = Math.ceil(sortedPromotions.length / promotionsPerPage);
  const displayedPromotions = sortedPromotions.slice(
    (currentPage - 1) * promotionsPerPage,
    currentPage * promotionsPerPage
  );

  const columns = [
    { key: "checkbox", label: "Select" },
    { key: "name", label: "Name" },
    { key: "discount", label: "Discount (%)" },
    { key: "startDateTime", label: "Start Date & Time" },
    { key: "endDateTime", label: "End Date & Time" },
    { key: "actions", label: "Actions" },
  ];

  // Add sorting functionality
  const onSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span className="sort-icon">⇅</span>;
    }
    return sortConfig.direction === "asc" ? (
      <span className="sort-icon">↑</span>
    ) : (
      <span className="sort-icon">↓</span>
    );
  };

  // Add checkbox handlers
  const handleCheckboxChange = (promotionId) => {
    setSelectedPromotions((prev) =>
      prev.includes(promotionId)
        ? prev.filter((id) => id !== promotionId)
        : [...prev, promotionId]
    );
  };

  const cancelAllSelected = () => {
    setSelectedPromotions([]);
  };

  // Handle bulk delete
  const deleteSelectedPromotions = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete the selected promotions?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedPromotions.map((id) => deletePromotion(id)));
        const updatedPromotions = promotions.filter(
          (promo) => !selectedPromotions.includes(promo.id)
        );
        setPromotions(updatedPromotions);
        setSelectedPromotions([]);
        showToast.success("Promotions deleted successfully");
      } catch (error) {
        showToast.error("Error deleting promotions");
      }
    }
  };

  return (
    <div className="promotions-container-p">
      <h2>Promotions</h2>

      {/* Search Bar */}
      <div className="header-container">
        <input
          type="text"
          placeholder="Search promotions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="button-group">
          {/* ปรับลำดับปุ่ม */}
          {userRole !== "Employee" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="add-promotion-btn"
            >
              Add Promotion
            </button>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="filter-button"
          >
            Filter
          </button>
          <button
            onClick={() => setIsColumnSelectorOpen(true)}
            className="columns-button"
          >
            Columns
          </button>
        </div>
      </div>

      {/* Modal for Adding Promotion */}
      {isModalOpen && (
        <div className="modal-promotion">
          <div className="modal-content-promotion">
            <h3>Add Promotion</h3>
            <AddPromotion
              onPromotionAdded={handlePromotionAdded}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal for Filtering Promotions */}
      {isFilterModalOpen && (
        <FilterPromotion
          onFilterChange={handleFilterChange}
          isOpen={isFilterModalOpen}
          closeModal={() => setIsFilterModalOpen(false)}
        />
      )}

      {isColumnSelectorOpen && (
        <PromotionColumnSelector
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          onClose={() => setIsColumnSelectorOpen(false)}
        />
      )}

      {/* Pagination Controls */}
      <div className="pagination-container">
        <div className="records-found">
          {filteredPromotions.length}{" "}
          {filteredPromotions.length === 1 ? "record" : "records"} found
        </div>
        <div
          className={`pagination-controls ${
            promotionsPerPage === 0
              ? "categories-pagination-custom"
              : "categories-pagination-default"
          }`}
        >
          <label htmlFor="promotions-per-page">Promotions per page:</label>
          <select
            id="promotions-per-page"
            value={promotionsPerPage === 0 ? "custom" : promotionsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "custom") {
                setPromotionsPerPage(0);
              } else {
                setPromotionsPerPage(parseInt(value, 10));
                setCurrentPage(1);
              }
            }}
          >
            {promotionsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>

          {promotionsPerPage === 0 && (
            <div className="custom-promotions-per-page">
              <input
                type="number"
                min="1"
                className="custom-input-promotions"
                placeholder="Enter number"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
              />
              <button
                className="custom-submit-button-promotions"
                onClick={handleCustomSubmit}
              >
                Submit
              </button>
            </div>
          )}

          <div className="promotion-page-navigation">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <table className="promotion-table">
        <thead>
          <tr>
            {columns
              .filter((col) => visibleColumns.includes(col.key))
              .map((col) => {
                if (col.key === "checkbox") {
                  return (
                    <th key={col.key}>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const currentPageIds = displayedPromotions.map(
                            (p) => p.id
                          );
                          if (e.target.checked) {
                            setSelectedPromotions((prev) => [
                              ...new Set([...prev, ...currentPageIds]),
                            ]);
                          } else {
                            setSelectedPromotions((prev) =>
                              prev.filter((id) => !currentPageIds.includes(id))
                            );
                          }
                        }}
                        checked={
                          displayedPromotions.length > 0 &&
                          displayedPromotions.every((p) =>
                            selectedPromotions.includes(p.id)
                          )
                        }
                      />
                    </th>
                  );
                }
                if (col.key === "actions" && userRole === "Employee")
                  return null;
                return (
                  <th
                    key={col.key}
                    onClick={() =>
                      col.key !== "actions" ? onSort(col.key) : null
                    }
                    className={col.key !== "actions" ? "sortable" : ""}
                  >
                    {col.label}{" "}
                    {col.key !== "actions" && <SortIcon column={col.key} />}
                  </th>
                );
              })}
          </tr>
        </thead>
        <tbody>
          {displayedPromotions.map((promo) => (
            <tr key={promo.id}>
              {visibleColumns.includes("checkbox") && (
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPromotions.includes(promo.id)}
                    onChange={() => handleCheckboxChange(promo.id)}
                  />
                </td>
              )}
              {visibleColumns.includes("name") && <td>{promo.name}</td>}
              {visibleColumns.includes("discount") && (
                <td>{promo.discount}%</td>
              )}
              {visibleColumns.includes("startDateTime") && (
                <td>
                  {promo.startDate} {promo.startTime}
                </td>
              )}
              {visibleColumns.includes("endDateTime") && (
                <td>
                  {promo.endDate} {promo.endTime}
                </td>
              )}
              {visibleColumns.includes("actions") &&
                userRole !== "Employee" && (
                  <td>
                    <button
                      onClick={() => handleDeletePromotion(promo.id)}
                      className="delete-promotion-btn"
                    >
                      Delete
                    </button>
                  </td>
                )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Action Bar */}
      {selectedPromotions.length > 0 && (
        <div
          className={`action-bar ${
            userRole === "Employee" ? "action-bar-employee" : ""
          }`}
        >
          <span className="selected-info">
            {selectedPromotions.length} of {sortedPromotions.length} Selected
          </span>

          {userRole !== "Employee" && (
            <>
              <div className="divider"></div>
              <button
                className="action-button delete-selected"
                onClick={deleteSelectedPromotions}
              >
                Delete Selected
              </button>
            </>
          )}

          <div className="divider"></div>
          <button
            className="action-button cancel-selected"
            onClick={cancelAllSelected}
          >
            Cancel All
          </button>
        </div>
      )}
    </div>
  );
};

export default Promotions;
