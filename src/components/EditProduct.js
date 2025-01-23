import React, { useState, useEffect } from "react";
import "./EditProduct.css";

const EditProduct = ({ product, onSave, onDelete, onClose, categories }) => {
  const [form, setForm] = useState({
    Brand: "",
    SKU: "",
    Name: "",
    Category: "",
    Seller: "",
    NormalPrice: 0,
    Status: "active",
  });

  useEffect(() => {
    if (product) {
      setForm(product); // ตั้งค่าเริ่มต้นด้วยข้อมูลสินค้าที่แก้ไข
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ส่งเฉพาะค่าที่แก้ไข ไม่อัปเดต CreatedAt
    onSave(product.id, { ...form, CreatedAt: product.CreatedAt });
  };
  
  

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit Product</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {[{ name: "Brand", type: "text", label: "Brand" },
              { name: "SKU", type: "text", label: "SKU" },
              { name: "Name", type: "text", label: "Name" },
              { name: "Seller", type: "text", label: "Seller" },
              { name: "NormalPrice", type: "number", label: "Normal Price" },
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
            {/* Dropdown Categories */}
            <div className="coolinput">
  <label className="text">Categories:</label>
  <select
    name="Categories" // เปลี่ยนจาก Category เป็น Categories
    className="input"
    value={form.Categories} // ใช้ Categories ใน form
    onChange={handleChange}
    required
  >
    <option value="" disabled>Select Categories</option>
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
              Save Changes
            </button>
            <button
              type="button"
              className="modal-button delete"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this product?")) {
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
