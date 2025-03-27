import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// Updated import to include getCategories for duplicate check
import { addCategories, getCategories } from "../services/categories.service";
import "./AddCategories.css";
import Swal from "sweetalert2";
import { showToast } from "../utils/toast"; // Added to enable toast notifications

const schema = yup.object().shape({
  Name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .matches(
      /^[a-zA-Z0-9\s\W]+$/, // อนุญาตให้ใช้ตัวอักษร ตัวเลข เว้นวรรค และอักขระพิเศษ
      "Please enter a valid category name"
    ),
});

const AddCategories = ({ onClose, onCategoryAdded }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      Name: "",
    },
  });

  const onSubmit = async (data) => {
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
        // Check for duplicate category name (case-insensitive)
        const existingCategories = await getCategories();
        const duplicate = existingCategories.find(
          (cat) => cat.Name.toLowerCase() === data.Name.toLowerCase()
        );
        if (duplicate) {
          showToast.error("This category already exists.");
          return;
        }

        const newCategory = await addCategories(data);
        const formattedCategory = {
          ...newCategory,
          CreatedAt: newCategory.CreatedAt
            ? new Date(newCategory.CreatedAt.seconds * 1000).toLocaleString()
            : "N/A",
          LastUpdate: newCategory.LastUpdate
            ? new Date(newCategory.LastUpdate.seconds * 1000).toLocaleString()
            : "N/A",
        };

        onCategoryAdded(formattedCategory);
        onClose();

        Swal.fire({
          icon: "success",
          title: "Category Added!",
          text: "The category has been successfully added.",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Error adding category:", error);
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="add-category-form-grid">
            <div className="add-category-input-group">
              <label htmlFor="name" className="add-category-label">
                Category Name:
              </label>
              <input
                type="text"
                id="name"
                className="add-category-input"
                placeholder="Enter category name..."
                {...register("Name")}
              />
              {errors.Name && (
                <span className="error-message">{errors.Name.message}</span>
              )}
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
