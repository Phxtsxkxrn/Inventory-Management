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
          // คำนวณราคาหลังลด
          const discountPercentage = product.AppliedPromotion
            ? product.AppliedPromotion.discount
            : 0;

          const finalPrice = product.NormalPrice
            ? product.NormalPrice -
              (product.NormalPrice * discountPercentage) / 100
            : null;

          return (
            <div key={product.id} className="product-card">
              <img
                src={product.Image || "/placeholder-image.jpg"}
                alt={product.Name}
                className="product-image"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
              <div className="product-info">
                <h3>{product.Name}</h3>
                <div className="price-section">
                  {discountPercentage > 0 && (
                    <p className="original-price">
                      ฿{product.NormalPrice?.toLocaleString()}
                    </p>
                  )}
                  <p className="final-price">
                    ฿{finalPrice?.toLocaleString() || "Price not available"}
                  </p>
                  {discountPercentage > 0 && (
                    <span className="discount-badge">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>
                {product.AppliedPromotion && (
                  <p className="promotion-tag">
                    <span className="promotion-icon">🏷️</span>
                    {` ${product.AppliedPromotion.name || "Special Offer"}`}
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
