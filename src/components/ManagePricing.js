import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // เพิ่ม useNavigate
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { updateProduct } from "../services/product.service";
import "./ManagePricing.css";
import { FaSave, FaPercentage } from "react-icons/fa";
import Swal from "sweetalert2";
import { showToast } from "../utils/toast";

// Validation schema
const schema = yup.object().shape({
  products: yup.array().of(
    yup.object().shape({
      NormalPrice: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .moreThan(0, "Price must be greater than 0")
        .required("Price is required"),
      Discount: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100%")
        .nullable(),
    })
  ),
});

const ManagePricing = () => {
  const location = useLocation();
  const navigate = useNavigate(); // เพิ่ม navigate
  const [isSaving, setIsSaving] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      products: location.state?.selectedProducts || [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "products",
  });

  const products = watch("products");

  // ✅ แปลงค่าเงินให้อยู่ในรูปแบบไทย
  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // แก้ไข formatDisplayPrice สำหรับ Normal Price
  const formatDisplayPrice = (value, isNormalPrice = false) => {
    if (!value && value !== 0) return "";
    if (typeof value === "string" && value.endsWith(".")) {
      return value; // แสดงจุดทศนิยมที่พิมพ์
    }
    return new Intl.NumberFormat("th-TH").format(value);
  };

  // แก้ไขฟังก์ชัน handlePriceChange
  const handlePriceChange = (index, field, value) => {
    if (field === "NormalPrice") {
      // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
      const cleanValue = value.replace(/[^0-9.]/g, "");

      // กรณีกรอกแค่จุด
      if (cleanValue === ".") {
        setValue(`products.${index}.${field}`, "0.");
        return;
      }

      // กรณีมีจุดทศนิยมมากกว่า 1 จุด
      if ((cleanValue.match(/\./g) || []).length > 1) {
        return; // ไม่อนุญาตให้มีจุดทศนิยมมากกว่า 1 จุด
      }

      // อัพเดทค่าในฟอร์ม
      setValue(`products.${index}.${field}`, cleanValue);

      // คำนวณ Final Price เมื่อมีการเปลี่ยนแปลง
      const parsedValue = parseFloat(cleanValue) || 0;
      const discount = products[index]?.Discount || 0;
      const finalPrice = parsedValue - (parsedValue * discount) / 100;
      setValue(`products.${index}.FinalPrice`, finalPrice);
    } else {
      // สำหรับ Discount ใช้แบบเดิม
      const cleanValue = value.replace(/[^0-9]/g, "");
      const parsedValue = cleanValue ? parseInt(cleanValue) : 0;
      setValue(`products.${index}.${field}`, parsedValue);

      // Update FinalPrice
      const normalPrice = products[index]?.NormalPrice || 0;
      const finalPrice = normalPrice - (normalPrice * parsedValue) / 100;
      setValue(`products.${index}.FinalPrice`, finalPrice);
    }
  };

  // เปลี่ยนเป็นฟังก์ชัน click event แทนเพื่อป้องกัน form submission
  const applyGlobalDiscount = (e) => {
    e.preventDefault(); // ป้องกันการ submit form
    const discountValue = parseFloat(globalDiscount);
    if (isNaN(discountValue) || discountValue < 0) {
      showToast.error("Please enter a valid discount (0 or greater)");
      return;
    }

    products.forEach((_, index) => {
      const normalPrice = products[index].NormalPrice;
      setValue(`products.${index}.Discount`, discountValue);
      setValue(
        `products.${index}.FinalPrice`,
        normalPrice - (normalPrice * discountValue) / 100
      );
    });

    showToast.info(`Discount ${discountValue}% applied to all products`);
    setGlobalDiscount(""); // Clear input after applying
  };

  // Modified handleSaveAll
  const onSubmit = async (data) => {
    const invalidProducts = data.products.filter(
      (product) => !product.NormalPrice || product.NormalPrice <= 0
    );

    if (invalidProducts.length > 0) {
      showToast.error("Some products have invalid prices (0 or empty)");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save changes for all products?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setIsSaving(true);
      try {
        await Promise.all(
          data.products.map((product) => updateProduct(product.id, product))
        );
        showToast.success(
          `Successfully updated ${data.products.length} products`
        );
        navigate("/product-list"); // เพิ่มการ navigate กลับ
      } catch (error) {
        console.error("Error updating products:", error);
        showToast.error("Failed to update products");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="manage-pricing-container">
      <h2>Manage Product Pricing</h2>

      {fields.length === 0 ? (
        <p className="no-products-message">No products selected for pricing.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ✅ กล่องใส่ส่วนลด + ปุ่มชิดขวา */}
          <div className="global-discount-container">
            <input
              type="number"
              className="global-discount-input"
              placeholder="Enter discount %"
              value={globalDiscount}
              onChange={(e) => setGlobalDiscount(e.target.value)}
            />
            <button
              type="button" // เปลี่ยนเป็น type="button" เพื่อป้องกันการ submit form
              className="apply-discount-btn"
              onClick={applyGlobalDiscount}
            >
              <FaPercentage /> Apply Discount
            </button>
            <button type="submit" className="save-all-btn" disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <FaSave /> Save All Products
                </>
              )}
            </button>
          </div>

          <table className="manage-pricing-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Product</th>
                <th style={{ textAlign: "center" }}>Normal Price (฿)</th>
                <th style={{ textAlign: "center" }}>Discount (%)</th>
                <th style={{ textAlign: "center" }}>Final Price (฿)</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td>
                    <div className="manage-pricing-product">
                      <img
                        className="manage-pricing-img"
                        src={field.Image || "no-image.jpg"}
                        alt={field.Name}
                      />
                      <span>{field.Name}</span>
                    </div>
                  </td>
                  <td>
                    <input
                      className={`manage-pricing-input ${
                        errors.products?.[index]?.NormalPrice ? "error" : ""
                      }`}
                      type="text"
                      value={formatDisplayPrice(
                        products[index]?.NormalPrice,
                        true
                      )}
                      onChange={(e) =>
                        handlePriceChange(index, "NormalPrice", e.target.value)
                      }
                      placeholder="0"
                    />
                    {errors.products?.[index]?.NormalPrice && (
                      <span className="error-message">
                        {errors.products[index].NormalPrice.message}
                      </span>
                    )}
                  </td>
                  <td>
                    <input
                      className={`manage-pricing-input ${
                        errors.products?.[index]?.Discount ? "error" : ""
                      }`}
                      type="text"
                      value={formatDisplayPrice(products[index]?.Discount || 0)}
                      onChange={(e) =>
                        handlePriceChange(index, "Discount", e.target.value)
                      }
                      placeholder="0"
                    />
                    {errors.products?.[index]?.Discount && (
                      <span className="error-message">
                        {errors.products[index].Discount.message}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="final-price-display">
                      {formatCurrency(products[index]?.FinalPrice) || "฿0.00"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      )}
    </div>
  );
};

export default ManagePricing;
