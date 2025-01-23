import React, { useState } from "react";
import { addCategories , getCategories} from "../services/categoriesService";
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
    <div className="modal add-category-modal">
  <div className="modal-content">
    <h3>Add Category</h3>
    <form onSubmit={handleSubmit}>
      <div className="coolinput">
        <label htmlFor="name" className="text">Category Name:</label>
        <input
          type="text"
          id="name"
          name="Name"
          value={form.Name}
          onChange={handleChange}
          placeholder="Write here..."
          className="input"
          required
        />
      </div>
      <div className="button-group">
        <button type="submit" className="modal-button add">
          Save
        </button>
        <button type="button" className="modal-button cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default AddCategories;
