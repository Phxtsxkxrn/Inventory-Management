import React, { useState, useEffect } from "react";
import "./EditProduct.css";
import Swal from "sweetalert2";

const EditProduct = ({ product, onSave, onDelete, onClose, categories }) => {
  const [form, setForm] = useState({
    SKU: "",
    Brand: "",
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

    // ✅ แสดง SweetAlert2 ยืนยันก่อนบันทึก
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save the changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        onSave(product.id, {
          ...form,
          NormalPrice: parseCurrency(form.NormalPrice),
          Discount: parseFloat(form.Discount) || 0,
          FinalPrice: calculateFinalPrice(),
          CreatedAt: product.CreatedAt,
        });

        // ✅ แจ้งเตือนว่าสำเร็จ
        Swal.fire({
          icon: "success",
          title: "Changes Saved!",
          text: "The product details have been updated.",
          confirmButtonText: "OK",
        });

        onClose(); // ✅ ปิด modal หลังจากบันทึกเสร็จ
      }
    });
  };

  const handleDelete = () => {
    // ✅ แสดง SweetAlert2 ยืนยันก่อนลบ
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

        // ✅ แจ้งเตือนว่าสินค้าถูกลบ
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The product has been deleted.",
          confirmButtonText: "OK",
        });

        onClose(); // ✅ ปิด modal หลังจากลบเสร็จ
      }
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">Edit Product</h3>
        <form onSubmit={handleSubmit}>
          <div className="edit-form-grid">
            {/* ส่วนแรก: Image URL เต็มแถว */}
            <div className="edit-input-group full-width">
              <label className="edit-label">Image URL:</label>
              <input
                className="edit-input"
                type="text"
                name="Image"
                value={form.Image}
                onChange={handleChange}
                placeholder="Enter image URL..."
              />
            </div>

            {/* ส่วนที่สอง: ข้อมูลพื้นฐาน */}
            <div className="edit-input-group">
              <label className="edit-label">SKU:</label>
              <input
                className="edit-input"
                type="text"
                name="SKU"
                value={form.SKU}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Brand:</label>
              <input
                className="edit-input"
                type="text"
                name="Brand"
                value={form.Brand}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Name:</label>
              <input
                className="edit-input"
                type="text"
                name="Name"
                value={form.Name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Seller:</label>
              <input
                className="edit-input"
                type="text"
                name="Seller"
                value={form.Seller}
                onChange={handleChange}
                required
              />
            </div>

            {/* ส่วนที่สาม: ราคาและหมวดหมู่ */}
            <div className="edit-input-group">
              <label className="edit-label">Normal Price:</label>
              <input
                className="edit-input"
                type="text"
                name="NormalPrice"
                value={form.NormalPrice}
                onChange={handleChange}
                placeholder="฿0.00"
                required
              />
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Categories:</label>
              <select
                name="Categories"
                className="edit-input"
                value={form.Categories}
                onChange={handleChange}
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
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Discount (%):</label>
              <input
                className="edit-input"
                type="number"
                name="Discount"
                value={form.Discount}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="edit-input-group">
              <label className="edit-label">Status:</label>
              <select
                name="Status"
                className="edit-input"
                value={form.Status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* ส่วนที่สี่: Final Price */}
            <div className="edit-input-group">
              <label className="edit-label">Final Price:</label>
              <p className="final-price">฿{calculateFinalPrice().toFixed(2)}</p>
            </div>
          </div>

          {/* ปุ่มด้านล่าง */}
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
