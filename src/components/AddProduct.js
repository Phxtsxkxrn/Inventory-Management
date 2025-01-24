import React, { useState, useEffect } from "react";
import { getCategories } from "../services/categoriesService"; // Import service
import "./AddProduct.css"; // Import CSS

const AddProduct = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    Brand: "",
    SKU: "",
    Name: "",
    Categories: "", // ใช้สำหรับเก็บค่าจาก dropdown
    Seller: "",
    NormalPrice: "",
    Status: "active",
  });

  const [categories, setCategories] = useState([]); // เก็บ Categories

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(); // ดึงข้อมูล Categories จาก Firebase
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const parseCurrency = (value) => {
    const numberValue = parseFloat(
      value.replace(/[฿,]/g, "").replace(/[^0-9.]/g, "")
    );
    return isNaN(numberValue) ? "" : numberValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "NormalPrice") {
      const numericValue = parseCurrency(value); // Convert to numeric value
      setForm((prev) => ({
        ...prev,
        [name]: numericValue ? formatCurrency(numericValue) : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert NormalPrice back to numeric value before submitting
    const formData = {
      ...form,
      NormalPrice: parseCurrency(form.NormalPrice),
    };
    onAdd(formData);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add Product</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {[
              { name: "Brand", type: "text", label: "Brand" },
              { name: "SKU", type: "text", label: "SKU" },
              { name: "Name", type: "text", label: "Name" },
              { name: "Seller", type: "text", label: "Seller" },
            ].map((input) => (
              <div className="coolinput" key={input.name}>
                <label className="text">{input.label}:</label>
                <input
                  className="input"
                  type={input.type}
                  name={input.name}
                  value={form[input.name]}
                  onChange={handleChange}
                  placeholder="Write here..."
                  required
                />
              </div>
            ))}
            <div className="coolinput">
              <label className="text">Normal Price:</label>
              <input
                className="input"
                type="text"
                name="NormalPrice"
                value={form.NormalPrice}
                onChange={handleChange}
                placeholder="฿0.00"
                required
              />
            </div>
            <div className="coolinput">
              <label className="text">Categories:</label>
              <select
                name="Categories"
                className="input"
                value={form.Categories}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Categories
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.Name}>
                    {category.Name}
                  </option>
                ))}
              </select>
            </div>
            <div className="coolinput">
              <label className="text">Status:</label>
              <select
                name="Status"
                className="input"
                value={form.Status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
