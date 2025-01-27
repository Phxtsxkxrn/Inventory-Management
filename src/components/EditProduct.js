import React, { useState, useEffect } from "react";
import "./EditProduct.css";

const EditProduct = ({ product, onSave, onDelete, onClose, categories }) => {
  const [form, setForm] = useState({
    Brand: "",
    SKU: "",
    Name: "",
    Categories: "",
    Seller: "",
    NormalPrice: "",
    Discount: "",
    Status: "active",
  });

  useEffect(() => {
    if (product) {
      setForm({
        ...product,
        NormalPrice: formatCurrency(product.NormalPrice), // ฟอร์แมตราคาเริ่มต้น
        Discount: product.Discount || "", // ค่าเริ่มต้น Discount
      });
    }
  }, [product]);

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

  const calculateFinalPrice = () => {
    const normalPrice = parseCurrency(form.NormalPrice);
    const discount = parseFloat(form.Discount) || 0;
    return normalPrice - (normalPrice * discount) / 100 || 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "NormalPrice") {
      const numericValue = parseCurrency(value); // แปลงค่ากลับเป็นตัวเลข
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
    onSave(product.id, {
      ...form,
      NormalPrice: parseCurrency(form.NormalPrice), // แปลงกลับเป็นตัวเลขก่อนบันทึก
      Discount: parseFloat(form.Discount) || 0, // เก็บ Discount เป็นตัวเลข
      FinalPrice: calculateFinalPrice(), // คำนวณ FinalPrice
      CreatedAt: product.CreatedAt,
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit Product</h3>
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
            {/* Normal Price */}
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
            {/* Discount */}
            <div className="coolinput">
              <label className="text">Discount (%):</label>
              <input
                className="input"
                type="number"
                name="Discount"
                value={form.Discount}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            {/* Dropdown Categories */}
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
            {/* Final Price */}
            <div className="coolinput">
              <label className="text">Final Price:</label>
              <p className="final-price">
                {`฿${new Intl.NumberFormat("th-TH", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(calculateFinalPrice())}`}
              </p>
            </div>
            {/* Status */}
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
              Save Changes
            </button>
            <button
              type="button"
              className="modal-button delete"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this product?"
                  )
                ) {
                  onDelete(product.id);
                  onClose();
                }
              }}
            >
              Delete
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

export default EditProduct;
