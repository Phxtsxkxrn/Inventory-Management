import React, { useState, useEffect } from "react";
import { getCategories } from "../services/categoriesService"; // Import service
import "./AddProduct.css"; // Import CSS
import Swal from "sweetalert2";

const AddProduct = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    SKU: "",
    Image: "",
    Brand: "",
    Name: "",
    Categories: "", // ใช้สำหรับเก็บค่าจาก dropdown
    Seller: "",
    NormalPrice: "",
    Discount: "", // เพิ่ม Discount
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
    if (typeof value !== "string") {
      return isNaN(value) ? "" : value; // ถ้าไม่ใช่ string ให้ตรวจสอบว่าเป็นตัวเลขหรือไม่
    }
    const numberValue = parseFloat(
      value.replace(/[฿,]/g, "").replace(/[^0-9.]/g, "")
    );
    return isNaN(numberValue) ? "" : numberValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "NormalPrice" || name === "Discount") {
      const numericValue = parseCurrency(value); // Convert to numeric value
      setForm((prev) => ({
        ...prev,
        [name]: numericValue ? numericValue : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const calculateDiscountedPrice = () => {
    const price = parseCurrency(form.NormalPrice);
    const discount = parseFloat(form.Discount);
    if (!price || !discount) return "";
    const discountedPrice = price - (price * discount) / 100;
    return formatCurrency(discountedPrice);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalPrice = parseCurrency(form.NormalPrice);
    const discount = parseFloat(form.Discount) || 0;
    const finalPrice = normalPrice - (normalPrice * discount) / 100;

    const formData = {
      ...form,
      NormalPrice: normalPrice,
      Discount: discount,
      FinalPrice: finalPrice,
    };

    // ✅ แสดง SweetAlert2 ยืนยันก่อนเพิ่มสินค้า
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to add this product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ บันทึกข้อมูลสินค้า
        onAdd(formData);

        // ✅ แจ้งเตือนว่าสำเร็จ
        Swal.fire({
          icon: "success",
          title: "Product Added!",
          text: "The product has been successfully added.",
          confirmButtonText: "OK",
        });

        onClose(); // ✅ ปิด modal หลังจากเพิ่มเสร็จ
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        onClose(); // ✅ ปิด modal ถ้ากด Cancel
      }
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">Add Product</h3>
        <form onSubmit={handleSubmit}>
          {/* ✅ ใช้ Grid Layout แบ่งฟอร์มซ้าย-ขวา */}
          <div className="form-grid">
            {[
              { name: "Image", type: "text", label: "Image URL" },
              { name: "SKU", type: "text", label: "SKU" },
              { name: "Brand", type: "text", label: "Brand" },
              { name: "Name", type: "text", label: "Name" },
              { name: "Seller", type: "text", label: "Seller" },
            ].map((input) => (
              <div className="product-input-group" key={input.name}>
                <label className="product-label">{input.label}:</label>
                <input
                  className="product-input"
                  type={input.type}
                  name={input.name}
                  value={form[input.name]}
                  onChange={handleChange}
                  placeholder="Enter details..."
                  required={input.name !== "Image"}
                />
              </div>
            ))}
            <div className="product-input-group">
              <label className="product-label">Normal Price:</label>
              <input
                className="product-input"
                type="text"
                name="NormalPrice"
                value={form.NormalPrice}
                onChange={handleChange}
                placeholder="฿0.00"
                required
              />
            </div>
            <div className="product-input-group">
              <label className="product-label">Categories:</label>
              <select
                name="Categories"
                className="product-input"
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
            <div className="product-input-group">
              <label className="product-label">Discount (%):</label>
              <input
                className="product-input"
                type="text"
                name="Discount"
                value={form.Discount}
                onChange={handleChange}
                placeholder="0%"
              />
            </div>
            <div className="product-input-group">
              <label className="product-label">Status:</label>
              <select
                name="Status"
                className="product-input"
                value={form.Status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="product-input-group">
              <label className="product-label">Final Price:</label>
              <p className="final-price">
                {calculateDiscountedPrice() || "฿0.00"}
              </p>
            </div>
          </div>
          {/* ✅ ปุ่ม Add Product และ Cancel */}
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
