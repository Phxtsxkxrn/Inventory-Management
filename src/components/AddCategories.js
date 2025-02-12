import React, { useState } from "react";
import { addCategories } from "../services/categoriesService";
import "./AddCategories.css";

const AddCategories = ({ onClose, onCategoryAdded }) => {
  const [form, setForm] = useState({
    Name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCategory = await addCategories(form);
      // แปลงค่าของ CreatedAt และ LastUpdate
      const formattedCategory = {
        ...newCategory,
        CreatedAt: newCategory.CreatedAt
          ? new Date(newCategory.CreatedAt.seconds * 1000).toLocaleString()
          : "N/A",
        LastUpdate: newCategory.LastUpdate
          ? new Date(newCategory.LastUpdate.seconds * 1000).toLocaleString()
          : "N/A",
      };
      onCategoryAdded(formattedCategory); // ส่งค่าที่ถูกแปลงกลับไป
      onClose();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="add-category-modal">
      <div className="add-category-modal-content">
        <h3 className="add-category-title">Add Category</h3>
        <form onSubmit={handleSubmit}>
          <div className="add-category-form-grid">
            <div className="add-category-input-group">
              <label htmlFor="name" className="add-category-label">
                Category Name:
              </label>
              <input
                type="text"
                id="name"
                name="Name"
                value={form.Name}
                onChange={handleChange}
                placeholder="Enter category name..."
                className="add-category-input"
                required
              />
            </div>
          </div>
          <div className="add-category-button-group">
            <button type="submit" className="add-category-button save">
              Save
            </button>
            <button
              type="button"
              className="add-category-button cancel"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategories;
