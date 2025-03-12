import React, { useState, useEffect } from "react";
import AddCategories from "./AddCategories";
import {
  getCategories,
  deleteCategories,
} from "../services/categories.service";
import "./CategoriesList.css";
import Swal from "sweetalert2";
import { showToast } from "../utils/toast";

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State สำหรับเก็บคำค้นหา
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State สำหรับหน้าปัจจุบัน
  const [categoriesPerPage, setCategoriesPerPage] = useState(15); // จำนวนข้อมูลต่อหน้า
  const [categoriesPerPageOptions, setCategoriesPerPageOptions] = useState([
    15, 20, 25, 30,
  ]); // ตัวเลือกใน dropdown
  const [customInputValue, setCustomInputValue] = useState(""); // State สำหรับค่าชั่วคราวของ Custom
  const userRole = localStorage.getItem("userRole");
  const [selectedCategories, setSelectedCategories] = useState([]); // เพิ่ม state สำหรับ selected items
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // เพิ่ม state สำหรับ sorting

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
    // ยังคงใช้ SweetAlert2 สำหรับการยืนยันการลบ
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this category!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteCategories(id);
        const updatedCategories = await getCategories();
        setCategories(updatedCategories);
        showToast.success("Category deleted successfully");
      } catch (error) {
        console.error("🚨 Error deleting category:", error);
        showToast.error("Failed to delete category");
      }
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
      showToast.info(`Categories per page set to ${customValue}`);
    } else {
      showToast.error("Please enter a valid number");
    }
  };

  // กรองข้อมูลตามคำค้นหา
  const filteredCategories = categories.filter((category) =>
    category.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // คำนวณ Pagination
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  // เพิ่มฟังก์ชัน sorting
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

  // เพิ่มฟังก์ชันจัดการ checkbox
  const handleCheckboxChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // เพิ่มฟังก์ชันยกเลิกการเลือกทั้งหมด
  const cancelAllSelected = () => {
    setSelectedCategories([]);
  };

  // เพิ่มฟังก์ชันลบหลายรายการ
  const deleteSelectedCategories = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete the selected categories?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedCategories.map((id) => deleteCategories(id)));
        const updatedCategories = await getCategories();
        setCategories(updatedCategories);
        setSelectedCategories([]);
        showToast.success("Categories deleted successfully");
      } catch (error) {
        showToast.error("Error deleting categories");
      }
    }
  };

  // Sort categories
  const sortedCategories = React.useMemo(() => {
    let sortableCategories = [...filteredCategories];
    if (sortConfig.key) {
      sortableCategories.sort((a, b) => {
        if (sortConfig.key === "CreatedAt" || sortConfig.key === "LastUpdate") {
          const aDate = new Date(a[sortConfig.key] || 0).getTime();
          const bDate = new Date(b[sortConfig.key] || 0).getTime();
          return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
        }

        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableCategories;
  }, [filteredCategories, sortConfig]);

  // แก้ไข displayedCategories ให้ใช้ sortedCategories
  const displayedCategories = sortedCategories.slice(
    (currentPage - 1) * categoriesPerPage,
    currentPage * categoriesPerPage
  );

  return (
    <div className="categories-list">
      <h2>Categories</h2>
      {/* Container สำหรับ Search และปุ่ม Add */}
      {/* ✅ ซ่อนปุ่ม Add Categories ถ้าเป็น Employee */}
      <div className="header-container">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {userRole !== "Employee" && (
          <button onClick={openAddModal} className="categories-add-button">
            Add Categories
          </button>
        )}
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
            showToast.success("Category added successfully");
            closeAddModal();
          }}
        />
      )}
      <table className="categories-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) => {
                  const currentPageIds = displayedCategories.map((c) => c.id);
                  if (e.target.checked) {
                    setSelectedCategories((prev) => [
                      ...new Set([...prev, ...currentPageIds]),
                    ]);
                  } else {
                    setSelectedCategories((prev) =>
                      prev.filter((id) => !currentPageIds.includes(id))
                    );
                  }
                }}
                checked={
                  displayedCategories.length > 0 &&
                  displayedCategories.every((c) =>
                    selectedCategories.includes(c.id)
                  )
                }
              />
            </th>
            <th onClick={() => onSort("Name")} className="sortable">
              Name <SortIcon column="Name" />
            </th>
            <th onClick={() => onSort("CreatedAt")} className="sortable">
              Created At <SortIcon column="CreatedAt" />
            </th>
            <th onClick={() => onSort("LastUpdate")} className="sortable">
              Last Update <SortIcon column="LastUpdate" />
            </th>
            {userRole !== "Employee" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {displayedCategories.map((category) => (
            <tr key={category.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCheckboxChange(category.id)}
                />
              </td>
              <td className="text-left">{category.Name}</td>
              <td className="text-left">{category.CreatedAt}</td>
              <td className="text-left">{category.LastUpdate}</td>
              {userRole !== "Employee" && (
                <td className="actions">
                  <button
                    className="delete"
                    onClick={() => handleDelete(category.id)}
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
      {selectedCategories.length > 0 && (
        <div
          className={`action-bar ${
            userRole === "Employee" ? "action-bar-employee" : ""
          }`}
        >
          <span className="selected-info">
            {selectedCategories.length} of {sortedCategories.length} Selected
          </span>

          {userRole !== "Employee" && (
            <>
              <div className="divider"></div>
              <button
                className="action-button delete-selected"
                onClick={deleteSelectedCategories}
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

export default CategoriesList;
