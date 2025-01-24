import React, { useState, useEffect } from "react";
import AddCategories from "./AddCategories";
import { getCategories, deleteCategories } from "../services/categoriesService";
import "./CategoriesList.css";

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State สำหรับเก็บคำค้นหา
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  // กรองข้อมูลตามคำค้นหา
  const filteredCategories = categories.filter((category) =>
    category.Name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <button onClick={openAddModal} className="modal-button add">
          Add Category
        </button>
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
          {filteredCategories.map((category) => (
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
