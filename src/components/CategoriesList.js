import React, { useState, useEffect } from "react";
import AddCategories from "./AddCategories";
import { getCategories, deleteCategories } from "../services/categoriesService";
import "./CategoriesList.css";

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State สำหรับเก็บคำค้นหา
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State สำหรับหน้าปัจจุบัน
  const [categoriesPerPage, setCategoriesPerPage] = useState(10); // จำนวนข้อมูลต่อหน้า
  const [categoriesPerPageOptions, setCategoriesPerPageOptions] = useState([
    5,
    10,
    20,
    50,
  ]); // ตัวเลือกใน dropdown
  const [customInputValue, setCustomInputValue] = useState(""); // State สำหรับค่าชั่วคราวของ Custom

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategories(id);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
    }
  };

  // ฟังก์ชันจัดการเมื่อกด Submit ใน Custom
  const handleCustomSubmit = () => {
    const customValue = parseInt(customInputValue, 10);
    if (!isNaN(customValue) && customValue > 0) {
      if (!categoriesPerPageOptions.includes(customValue)) {
        // เพิ่มค่าลงใน dropdown หากยังไม่มี
        setCategoriesPerPageOptions((prev) =>
          [...prev, customValue].sort((a, b) => a - b)
        );
      }
      setCategoriesPerPage(customValue);
      setCurrentPage(1); // Reset ไปหน้าที่ 1
      setCustomInputValue(""); // เคลียร์ช่องกรอก
    }
  };

  // กรองข้อมูลตามคำค้นหา
  const filteredCategories = categories.filter((category) =>
    category.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // คำนวณ Pagination
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const displayedCategories = filteredCategories.slice(
    (currentPage - 1) * categoriesPerPage,
    currentPage * categoriesPerPage
  );

  return (
    <div className="categories-list">
      <h2>Categories</h2>
      {/* Container สำหรับ Search และปุ่ม Add */}
      <div className="header-container">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={openAddModal} className="categories-add-button">
          Add Categories
        </button>
      </div>
      {/* Pagination Controls และ Records Found */}
      <div className="pagination-container">
        <div className="records-found">
          {filteredCategories.length}{" "}
          {filteredCategories.length === 1 ? "record" : "records"} found
        </div>
        <div
          className={`pagination-controls ${
            categoriesPerPage === 0
              ? "categories-pagination-custom"
              : "categories-pagination-default"
          }`}
        >
          <label htmlFor="categories-per-page">Categories per page:</label>
          <select
            id="categories-per-page"
            value={categoriesPerPage === 0 ? "custom" : categoriesPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "custom") {
                setCategoriesPerPage(0); // เลือก Custom
              } else {
                setCategoriesPerPage(parseInt(value, 10));
                setCurrentPage(1); // Reset ไปหน้าที่ 1
              }
            }}
          >
            {categoriesPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
          {categoriesPerPage === 0 && (
            <div className="custom-products-per-page">
              <input
                type="number"
                min="1"
                className="custom-input"
                placeholder="Enter number"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
              />
              <button
                className="custom-submit-button"
                onClick={handleCustomSubmit}
              >
                Submit
              </button>
            </div>
          )}
          <div className="page-navigation">
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
      {isAddModalOpen && (
        <AddCategories
          onClose={closeAddModal}
          onCategoryAdded={(newCategory) => {
            setCategories((prev) => [...prev, newCategory]);
          }}
        />
      )}
      <table className="categories-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created At</th>
            <th>Last Update</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedCategories.map((category) => (
            <tr key={category.id}>
              <td>{category.Name}</td>
              <td>{category.CreatedAt}</td>
              <td>{category.LastUpdate}</td>
              <td>
                <button
                  className="delete"
                  onClick={() => handleDelete(category.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesList;
