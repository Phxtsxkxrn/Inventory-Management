import React, { useState, useEffect } from "react";
import AddCategories from "./AddCategories";
import { getCategories, deleteCategories } from "../services/categoriesService";
import "./CategoriesList.css";

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
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
      await deleteCategories(id); // ใช้ฟังก์ชันใหม่
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
    }
  };

  return (
    <div className="categories-list">
      <h2>Categories</h2>
      <div className="add-button-container">
  <button onClick={openAddModal} className="modal-button add">
    Add Category
  </button>
</div>
      {isAddModalOpen && (
        <AddCategories
        onClose={closeAddModal}
        onCategoryAdded={(newCategory) => {
          setCategories((prev) => [...prev, newCategory]); // เพิ่ม Categories ใหม่เข้าไปใน State
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
  {categories.map((category) => (
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
