import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateProduct } from "../services/productService";
import "./ManagePricing.css";
import { FaSave, FaArrowLeft, FaPercentage } from "react-icons/fa";

const ManagePricing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState(
    location.state?.selectedProducts || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasUpdated, setHasUpdated] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState("");

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

  // ✅ ฟังก์ชันอัปเดตราคาใน State
  const handlePriceChange = (id, field, value) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id !== id) return product;

        let updatedProduct = { ...product };

        if (field === "NormalPrice") {
          updatedProduct.NormalPrice = parseCurrency(value);
          updatedProduct.FinalPrice =
            updatedProduct.NormalPrice -
            (updatedProduct.NormalPrice * (updatedProduct.Discount || 0)) / 100;
        } else if (field === "Discount") {
          updatedProduct.Discount = parseCurrency(value);
          updatedProduct.FinalPrice =
            updatedProduct.NormalPrice -
            (updatedProduct.NormalPrice * updatedProduct.Discount) / 100;
        }

        return updatedProduct;
      })
    );
  };

  // ✅ ฟังก์ชันอัปเดตส่วนลดทุกรายการ
  const applyGlobalDiscount = () => {
    const discountValue = parseFloat(globalDiscount);
    if (isNaN(discountValue) || discountValue < 0) {
      alert("กรุณาใส่ส่วนลดที่ถูกต้อง (0 ขึ้นไป)");
      return;
    }

    setProducts((prevProducts) =>
      prevProducts.map((product) => ({
        ...product,
        Discount: discountValue,
        FinalPrice:
          product.NormalPrice - (product.NormalPrice * discountValue) / 100,
      }))
    );
  };

  // ✅ ฟังก์ชันบันทึกข้อมูลสินค้าทั้งหมด
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        products.map((product) =>
          updateProduct(product.id, {
            Name: product.Name,
            SKU: product.SKU,
            Image: product.Image,
            NormalPrice: product.NormalPrice,
            Discount: product.Discount,
            FinalPrice: product.FinalPrice,
          })
        )
      );

      setHasUpdated(true);
      setTimeout(() => setHasUpdated(false), 3000);
    } catch (error) {
      console.error("Error updating products:", error);
      alert("❌ Error updating products.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="manage-pricing-container">
      <h2>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        Manage Product Pricing
      </h2>

      {products.length === 0 ? (
        <p className="no-products-message">No products selected for pricing.</p>
      ) : (
        <>
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
            <button
              className="save-all-btn"
              onClick={handleSaveAll}
              disabled={isSaving}
            >
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
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="manage-pricing-product">
                      <img
                        className="manage-pricing-img"
                        src={product.Image || "no-image.jpg"}
                        alt={product.Name}
                      />
                      <span>{product.Name}</span>
                    </div>
                  </td>
                  <td>
                    <input
                      className="manage-pricing-input"
                      type="text"
                      value={formatCurrency(product.NormalPrice)}
                      onChange={(e) =>
                        handlePriceChange(
                          product.id,
                          "NormalPrice",
                          e.target.value
                        )
                      }
                      placeholder="฿0.00"
                      required
                    />
                  </td>
                  <td>
                    <input
                      className="manage-pricing-input"
                      type="text"
                      value={
                        product.Discount !== undefined
                          ? product.Discount.toFixed(2)
                          : ""
                      }
                      onChange={(e) =>
                        handlePriceChange(
                          product.id,
                          "Discount",
                          e.target.value
                        )
                      }
                      placeholder="0%"
                    />
                  </td>
                  <td>
                    <span className="final-price-display">
                      {formatCurrency(product.FinalPrice) || "฿0.00"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="manage-pricing-btn"
                      onClick={() => handleSaveAll()}
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
        </>
      )}
    </div>
  );
};

export default ManagePricing;
