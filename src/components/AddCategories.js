import React, { useState } from "react";
import { addCategories } from "../services/categoriesService";
import "./AddCategories.css";
import Swal from "sweetalert2";

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

    if (!form.Name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information!",
        text: "Please enter a category name.",
        confirmButtonText: "OK",
      });
      return;
    }

    // ✅ แสดง SweetAlert2 ถามยืนยันก่อนเพิ่มหมวดหมู่
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to add this category?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
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

        // ✅ แจ้งเตือนเมื่อเพิ่มหมวดหมู่สำเร็จ
        Swal.fire({
          icon: "success",
          title: "Category Added!",
          text: "The category has been successfully added.",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("🚨 Error adding category:", error);

        // ✅ แจ้งเตือนเมื่อเกิดข้อผิดพลาด
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "An error occurred while adding the category.",
          confirmButtonText: "OK",
        });
      }
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
