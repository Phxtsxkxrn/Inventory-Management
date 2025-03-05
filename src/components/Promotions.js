import React, { useState, useEffect } from "react";
import { getPromotions, deletePromotion } from "../services/promotionService";
import AddPromotion from "./AddPromotion";
import FilterPromotion from "./FilterPromotion"; // Import FilterPromotion
import "./Promotions.css";
import Swal from "sweetalert2";

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State สำหรับเก็บคำค้นหา
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // State for filter modal
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

  const handleDeletePromotion = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this promotion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deletePromotion(id);
        setPromotions(promotions.filter((promo) => promo.id !== id));

        Swal.fire({
          icon: "success",
          title: "Promotion Deleted!",
          text: "The promotion has been successfully deleted.",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("🚨 Error deleting promotion:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "An error occurred while deleting the promotion.",
          confirmButtonText: "OK",
        });
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

  // คำนวณ Pagination
  const totalPages = Math.ceil(filteredPromotions.length / promotionsPerPage);
  const displayedPromotions = filteredPromotions.slice(
    (currentPage - 1) * promotionsPerPage,
    currentPage * promotionsPerPage
  );

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
          {/* ปุ่ม Filter แสดงสำหรับทุก role */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="filter-button"
          >
            Filter
          </button>
          {/* ปุ่ม Add Promotion แสดงเฉพาะ non-Employee */}
          {userRole !== "Employee" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="add-promotion-btn"
            >
              Add Promotion
            </button>
          )}
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
            <th>Name</th>
            <th>Discount (%)</th>
            <th>Start Date & Time</th>
            <th>End Date & Time</th>
            {userRole !== "Employee" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {displayedPromotions.map((promo) => (
            <tr key={promo.id}>
              <td>{promo.name}</td>
              <td>{promo.discount}%</td>
              <td>
                {promo.startDate} {promo.startTime}
              </td>
              <td>
                {promo.endDate} {promo.endTime}
              </td>
              {userRole !== "Employee" && (
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
    </div>
  );
};

export default Promotions;
