import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { updateProduct } from "../services/productService";
import "./ManagePricing.css";
import { FaSave, FaPercentage } from "react-icons/fa";
import Swal from "sweetalert2";

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
  const [isSaving, setIsSaving] = useState(false);
  const [hasUpdated, setHasUpdated] = useState(false);
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

  // ✅ แปลงค่าจาก Text เป็น Number
  const parseCurrency = (value) => {
    if (typeof value !== "string") {
      return isNaN(value) ? "" : value;
    }
    const numberValue = parseFloat(
      value.replace(/[฿,]/g, "").replace(/[^0-9.]/g, "")
    );
    return isNaN(numberValue) ? "" : numberValue;
  };

  // Modified handlePriceChange to work with React Hook Form
  const handlePriceChange = (index, field, value) => {
    const parsedValue = parseCurrency(value);
    setValue(`products.${index}.${field}`, parsedValue);

    // Update FinalPrice
    const product = products[index];
    const normalPrice =
      field === "NormalPrice" ? parsedValue : product.NormalPrice;
    const discount = field === "Discount" ? parsedValue : product.Discount || 0;
    const finalPrice = normalPrice - (normalPrice * discount) / 100;
    setValue(`products.${index}.FinalPrice`, finalPrice);
  };

  // Modified applyGlobalDiscount
  const applyGlobalDiscount = () => {
    const discountValue = parseFloat(globalDiscount);
    if (isNaN(discountValue) || discountValue < 0) {
      alert("กรุณาใส่ส่วนลดที่ถูกต้อง (0 ขึ้นไป)");
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
  };

  // Modified handleSaveAll
  const onSubmit = async (data) => {
    // Check for zero or invalid prices
    const invalidProducts = data.products.filter(
      (product) => !product.NormalPrice || product.NormalPrice <= 0
    );

    if (invalidProducts.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Prices",
        html: `The following products have invalid prices (0 or empty):<br><br>${invalidProducts
          .map((p) => `- ${p.Name}`)
          .join("<br>")}`,
        confirmButtonText: "OK",
      });
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
        Swal.fire({
          icon: "success",
          title: "All Products Updated!",
          text: "All product details have been successfully saved.",
          confirmButtonText: "OK",
        });
        setHasUpdated(true);
        setTimeout(() => setHasUpdated(false), 3000);
      } catch (error) {
        console.error("Error updating products:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "An error occurred while updating products.",
          confirmButtonText: "OK",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveProduct = async (productId) => {
    const productToUpdate = products.find(
      (product) => product.id === productId
    );

    if (
      !productToUpdate ||
      !productToUpdate.NormalPrice ||
      productToUpdate.NormalPrice <= 0
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid Price",
        text: "Product price must be greater than 0",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsSaving(true);
    try {
      // ค้นหาสินค้าที่ต้องการบันทึก
      const productToUpdate = products.find(
        (product) => product.id === productId
      );

      if (!productToUpdate) {
        console.error("Product not found");
        return;
      }

      // ✅ แสดง SweetAlert2 ยืนยันก่อนบันทึก
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to save the changes for this product?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, save it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // ✅ อัปเดตข้อมูลสินค้าไปยัง Firebase
        await updateProduct(productId, {
          Name: productToUpdate.Name,
          SKU: productToUpdate.SKU,
          Image: productToUpdate.Image,
          NormalPrice: productToUpdate.NormalPrice,
          Discount: productToUpdate.Discount,
          FinalPrice: productToUpdate.FinalPrice,
        });

        // ✅ แจ้งเตือนว่าสำเร็จ
        Swal.fire({
          icon: "success",
          title: "Product Updated!",
          text: "The product details have been successfully saved.",
          confirmButtonText: "OK",
        });

        setHasUpdated(true);
        setTimeout(() => setHasUpdated(false), 3000);
      }
    } catch (error) {
      console.error("Error updating product:", error);

      // ✅ แจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while updating the product.",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="manage-pricing-container">
      <h2>Manage Product Pricing</h2>

      {fields.length === 0 ? (
        <p className="no-products-message">No products selected for pricing.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {hasUpdated && (
            <p className="success-message">✅ Prices updated successfully!</p>
          )}

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
              className="apply-discount-btn"
              onClick={applyGlobalDiscount}
            >
              <FaPercentage /> Apply Discount
            </button>
            <button className="save-all-btn" disabled={isSaving}>
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
                <th>Product</th>
                <th>Normal Price</th>
                <th>Discount (%)</th>
                <th>Final Price</th>
                <th>Update</th>
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
                      value={formatCurrency(products[index]?.NormalPrice)}
                      onChange={(e) =>
                        handlePriceChange(index, "NormalPrice", e.target.value)
                      }
                      placeholder="฿0.00"
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
                      value={
                        products[index]?.Discount !== undefined
                          ? products[index].Discount.toFixed(2)
                          : ""
                      }
                      onChange={(e) =>
                        handlePriceChange(index, "Discount", e.target.value)
                      }
                      placeholder="0%"
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
                  <td>
                    <button
                      className="manage-pricing-btn"
                      onClick={() => handleSaveProduct(field.id)} // ✅ Save เฉพาะสินค้านี้
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        "Saving..."
                      ) : (
                        <>
                          <FaSave /> Save
                        </>
                      )}
                    </button>
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
