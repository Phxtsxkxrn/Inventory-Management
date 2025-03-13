import React, { useState, useEffect } from "react";
import { getProducts } from "../services/product.service";
import "./ProductPreview.css";

const ProductPreview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();

        // Debug: ดูโครงสร้างข้อมูลของสินค้าตัวแรก
        if (response && response.length > 0) {
          console.log("First product structure:", response[0]);
        }

        // ตรวจสอบและกรองสินค้า
        const activeProducts = response.filter((product) => {
          console.log("Product Status:", product.Status); // แก้เป็น Status ตัวใหญ่
          return (
            product.Status === "active" ||
            product.Status === "Active" ||
            product.Status === "ACTIVE"
          );
        });

        console.log("Filtered products count:", activeProducts.length);
        setProducts(activeProducts);
      } catch (error) {
        console.error("Error details:", error);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="product-preview-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-preview-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-preview-container">
        <div className="no-products">No active products found</div>
      </div>
    );
  }

  return (
    <div className="product-preview-container">
      <h2>Product Preview ({products.length} products)</h2>
      <div className="products-grid">
        {products.map((product) => {
          // คำนวณส่วนลดทั้งหมด (ส่วนลดปกติ + โปรโมชั่น)
          const normalDiscount = product.Discount || 0;
          const promotionDiscount = product.AppliedPromotion?.discount || 0;
          const totalDiscount = Math.max(normalDiscount, promotionDiscount);

          // คำนวณราคาสุดท้าย
          const finalPrice = product.NormalPrice
            ? product.NormalPrice - (product.NormalPrice * totalDiscount) / 100
            : null;

          return (
            <div key={product.id} className="product-card">
              <div className="image-container">
                <img
                  src={product.Image || "/placeholder-image.jpg"}
                  alt={product.Name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
                {totalDiscount > 0 && (
                  <span className="discount-badge">-{totalDiscount}%</span>
                )}
              </div>
              <div className="product-info">
                <h3>{product.Name}</h3>
                <div className="price-section">
                  {totalDiscount > 0 && (
                    <p className="original-price">
                      ฿{product.NormalPrice?.toLocaleString()}
                    </p>
                  )}
                  <p className="final-price">
                    ฿{finalPrice?.toLocaleString() || "Price not available"}
                  </p>
                </div>
                {/* แสดง promotion tag เท่านั้น ไม่แสดง discount tag */}
                {product.AppliedPromotion && (
                  <p className="promotion-tag">
                    <span className="promotion-icon">🏷️</span>
                    {` ${
                      product.AppliedPromotion.name || "Special Offer"
                    } (${promotionDiscount}%)`}
                  </p>
                )}
                <p className="description">
                  {product.Description || "No description available"}
                </p>
                <p className="brand">Brand: {product.Brand || "N/A"}</p>
                <p className="category">
                  Category: {product.Categories || "N/A"}
                </p>
                <p className="status">Status: {product.Status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPreview;
