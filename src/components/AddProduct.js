import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getCategories } from "../services/categoriesService";
import "./AddProduct.css";
import Swal from "sweetalert2";
import { showToast } from "../utils/toast";

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

const AddProduct = ({ onAdd, onClose }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      SKU: "",
      Image: "",
      Brand: "",
      Name: "",
      Categories: "",
      Seller: "",
      NormalPrice: "",
      Discount: "0",
      Status: "active",
    },
  });

  const [categories, setCategories] = React.useState([]);
  const normalPrice = watch("NormalPrice");
  const discount = watch("Discount");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const calculateDiscountedPrice = () => {
    const price = parseFloat(normalPrice) || 0;
    const discountValue = parseFloat(discount) || 0;
    const discountedPrice = price - (price * discountValue) / 100;
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(discountedPrice);
  };

  const onSubmit = (data) => {
    const finalPrice =
      parseFloat(data.NormalPrice) -
      (parseFloat(data.NormalPrice) * parseFloat(data.Discount || 0)) / 100;

    const formData = {
      ...data,
      FinalPrice: finalPrice,
    };

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to add this product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add it!",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          onAdd(formData);
          showToast.success("Product added successfully!");
          onClose();
        } catch (error) {
          showToast.error("Failed to add product: " + error.message);
        }
      }
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">Add Product</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="product-input-group full-width">
              <label className="product-label">Image URL:</label>
              <input
                className="product-input"
                {...register("Image")}
                placeholder="Enter image URL..."
              />
              {errors.Image && (
                <span className="error-message">{errors.Image.message}</span>
              )}
            </div>

            <div className="product-input-group">
              <label className="product-label">SKU:</label>
              <input className="product-input" {...register("SKU")} required />
              {errors.SKU && (
                <span className="error-message">{errors.SKU.message}</span>
              )}
            </div>

            <div className="product-input-group">
              <label className="product-label">Brand:</label>
              <input
                className="product-input"
                {...register("Brand")}
                required
              />
              {errors.Brand && (
                <span className="error-message">{errors.Brand.message}</span>
              )}
            </div>

            <div className="product-input-group">
              <label className="product-label">Name:</label>
              <input className="product-input" {...register("Name")} required />
              {errors.Name && (
                <span className="error-message">{errors.Name.message}</span>
              )}
            </div>

            <div className="product-input-group">
              <label className="product-label">Seller:</label>
              <input
                className="product-input"
                {...register("Seller")}
                required
              />
              {errors.Seller && (
                <span className="error-message">{errors.Seller.message}</span>
              )}
            </div>

            <div className="product-input-group">
              <label className="product-label">Normal Price:</label>
              <input
                className="product-input"
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

            <div className="product-input-group">
              <label className="product-label">Categories:</label>
              <select
                {...register("Categories")}
                className="product-input"
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

            <div className="product-input-group">
              <label className="product-label">Discount (%):</label>
              <input
                className="product-input"
                {...register("Discount")}
                placeholder="0%"
              />
              {errors.Discount && (
                <span className="error-message">{errors.Discount.message}</span>
              )}
            </div>

            <div className="product-input-group">
              <label className="product-label">Status:</label>
              <select {...register("Status")} className="product-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.Status && (
                <span className="error-message">{errors.Status.message}</span>
              )}
            </div>

            <div className="product-input-group">
              <label className="product-label">Final Price:</label>
              <p className="final-price">{calculateDiscountedPrice()}</p>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="modal-button add">
              Add Product
            </button>
            <button
              type="button"
              className="modal-button cancel"
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

export default AddProduct;
