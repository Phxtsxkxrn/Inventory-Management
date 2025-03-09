import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./EditProduct.css";
import Swal from "sweetalert2";

const schema = yup.object().shape({
  SKU: yup.string().required("SKU is required"),
  Image: yup.string().url("Must be a valid URL"),
  Brand: yup.string().required("Brand is required"),
  Name: yup.string().required("Name is required"),
  Categories: yup.string().required("Category is required"),
  Seller: yup.string().required("Seller is required"),
  NormalPrice: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be positive")
    .required("Price is required"),
  Discount: yup
    .number()
    .typeError("Discount must be a number")
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),
  Status: yup.string().required("Status is required"),
});

const EditProduct = ({ product, onSave, onDelete, onClose, categories }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...product,
      NormalPrice: product?.NormalPrice || "",
      Discount: product?.Discount || "0",
    },
  });

  const normalPrice = watch("NormalPrice");
  const discount = watch("Discount");

  const calculateFinalPrice = () => {
    const price = parseFloat(normalPrice) || 0;
    const discountValue = parseFloat(discount) || 0;
    const finalPrice = price - (price * discountValue) / 100;
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(finalPrice);
  };

  const onSubmit = (data) => {
    const finalPrice =
      parseFloat(data.NormalPrice) -
      (parseFloat(data.NormalPrice) * parseFloat(data.Discount || 0)) / 100;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save the changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save it!",
    }).then((result) => {
      if (result.isConfirmed) {
        onSave(product.id, {
          ...data,
          FinalPrice: finalPrice,
          CreatedAt: product.CreatedAt,
        });

        Swal.fire({
          icon: "success",
          title: "Changes Saved!",
          text: "The product details have been updated.",
        });
        onClose();
      }
    });
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(product.id);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The product has been deleted.",
          confirmButtonText: "OK",
        });

        onClose();
      }
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">Edit Product</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="edit-form-grid">
            <div className="edit-input-group full-width">
              <label className="edit-label">Image URL:</label>
              <input
                className="edit-input"
                {...register("Image")}
                placeholder="Enter image URL..."
              />
              {errors.Image && (
                <span className="error-message">{errors.Image.message}</span>
              )}
            </div>

            <div className="edit-input-group">
              <label className="edit-label">SKU:</label>
              <input className="edit-input" {...register("SKU")} required />
              {errors.SKU && (
                <span className="error-message">{errors.SKU.message}</span>
              )}
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Brand:</label>
              <input className="edit-input" {...register("Brand")} required />
              {errors.Brand && (
                <span className="error-message">{errors.Brand.message}</span>
              )}
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Name:</label>
              <input className="edit-input" {...register("Name")} required />
              {errors.Name && (
                <span className="error-message">{errors.Name.message}</span>
              )}
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Seller:</label>
              <input className="edit-input" {...register("Seller")} required />
              {errors.Seller && (
                <span className="error-message">{errors.Seller.message}</span>
              )}
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Normal Price:</label>
              <input
                className="edit-input"
                {...register("NormalPrice")}
                placeholder="฿0.00"
                required
              />
              {errors.NormalPrice && (
                <span className="error-message">
                  {errors.NormalPrice.message}
                </span>
              )}
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Categories:</label>
              <select
                {...register("Categories")}
                className="edit-input"
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.Name}>
                    {category.Name}
                  </option>
                ))}
              </select>
              {errors.Categories && (
                <span className="error-message">
                  {errors.Categories.message}
                </span>
              )}
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Discount (%):</label>
              <input
                className="edit-input"
                type="number"
                {...register("Discount")}
                placeholder="0"
              />
              {errors.Discount && (
                <span className="error-message">{errors.Discount.message}</span>
              )}
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Status:</label>
              <select {...register("Status")} className="edit-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.Status && (
                <span className="error-message">{errors.Status.message}</span>
              )}
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Final Price:</label>
              <p className="final-price">{calculateFinalPrice()}</p>
            </div>
          </div>

          <div className="edit-button-group">
            <button type="submit" className="edit-button edit-button-save">
              Save
            </button>
            <button
              type="button"
              className="edit-button edit-button-delete"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              type="button"
              className="edit-button edit-button-cancel"
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

export default EditProduct;
