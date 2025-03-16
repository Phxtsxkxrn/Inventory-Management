import React, { useState, useEffect } from "react";
import { getProducts } from "../services/product.service";
import "./ProductPreview.css";

const ProductPreview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10); // แสดง 18 ชิ้นต่อหน้า
  const [customInputValue, setCustomInputValue] = useState("");
  const [customOptions, setCustomOptions] = useState([10, 15, 20, 25]); // ตัวเลือกจำนวนสินค้าต่อหน้า

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

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(products.length / productsPerPage);

  // คำนวณสินค้าที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handleProductsPerPageChange = (e) => {
    const value =
      e.target.value === "custom" ? 0 : parseInt(e.target.value, 10);
    setProductsPerPage(value);
    setCurrentPage(1);
  };

  const handleCustomInputChange = (e) => {
    setCustomInputValue(e.target.value);
  };

  const handleCustomProductsPerPageSubmit = () => {
    const value = parseInt(customInputValue, 10);
    if (!isNaN(value) && value > 0) {
      setCustomOptions((prev) =>
        prev.includes(value) ? prev : [...prev, value].sort((a, b) => a - b)
      );
      setProductsPerPage(value);
      setCurrentPage(1);
      setCustomInputValue("");
    }
  };

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

      {/* Pagination Controls */}
      <div className="pagination-and-records">
        <div className="records-found">
          {products.length} {products.length === 1 ? "product" : "products"}{" "}
          found
        </div>
        <div className="pagination-controls">
          <label>Products per page:</label>
          <select
            value={productsPerPage === 0 ? "custom" : productsPerPage}
            onChange={handleProductsPerPageChange}
          >
            {customOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
          {productsPerPage === 0 && (
            <div className="custom-products-per-page">
              <input
                type="number"
                min="1"
                className="custom-input"
                placeholder="Enter number"
                value={customInputValue}
                onChange={handleCustomInputChange}
              />
              <button
                className="custom-submit-button"
                onClick={handleCustomProductsPerPageSubmit}
              >
                Submit
              </button>
            </div>
          )}
          <div className="page-navigation">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {currentProducts.map((product) => {
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
                <div className="promotion-space">
                  {product.AppliedPromotion ? (
                    <p className="promotion-tag">
                      <span className="promotion-icon">🏷️</span>
                      {` ${
                        product.AppliedPromotion.name || "Special Offer"
                      } (${promotionDiscount}%)`}
                    </p>
                  ) : (
                    <div className="empty-promotion"></div>
                  )}
                </div>
                <h3>{product.Name}</h3>
                <div className="price-section">
                  {totalDiscount > 0 && (
                    <p className="original-price">
                      ฿{product.NormalPrice?.toLocaleString()}
                    </p>
                  )}
                  <p
                    className={
                      totalDiscount > 0 ? "final-price" : "normal-price"
                    }
                  >
                    ฿{finalPrice?.toLocaleString() || "Price not available"}
                  </p>
                </div>
                {/* แสดง promotion tag เท่านั้น ไม่แสดง discount tag */}
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
