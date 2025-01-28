import React, { useState } from "react";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import ImportProducts from "./ImportProducts";
import "./ProductList.css"; // นำเข้าไฟล์ CSS
import { deleteProduct } from "../services/productService";
import * as XLSX from "xlsx";

const ProductList = ({
  products,
  setProducts,
  categories,
  onAdd,
  onEdit,
  onDelete,
  onImport,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State สำหรับคำค้นหา
  const [productsPerPage, setProductsPerPage] = useState(20); // State สำหรับสินค้าต่อหน้า
  const [currentPage, setCurrentPage] = useState(1); // State สำหรับหน้าปัจจุบัน
  const [customInputValue, setCustomInputValue] = useState(""); // เก็บค่าชั่วคราวจากช่อง input
  const [customOptions, setCustomOptions] = useState([20, 30, 50, 100, 200]); // ตัวเลือก dropdown
  const [selectedProducts, setSelectedProducts] = useState([]); // State สำหรับ product ที่ถูกเลือก
  const [isModalOpen, setIsModalOpen] = useState(false); // State ควบคุมการเปิด Modal

  const openAddModal = () => {
    setIsAddModalOpen(true);
    setIsModalOpen(true); // Disable checkbox
  };
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setIsModalOpen(false); // Enable checkbox
  };

  const openImportModal = () => {
    setIsImportModalOpen(true);
    setIsModalOpen(true); // Disable checkbox
  };
  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setIsModalOpen(false); // Enable checkbox
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
    setIsModalOpen(true); // Disable checkbox
  };
  const closeEditModal = () => {
    setEditingProduct(null);
    setIsEditModalOpen(false);
    setIsModalOpen(false); // Enable checkbox
  };

  const filteredProducts = products.filter((product) =>
    Object.values(product)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleCheckboxChange = (productId) => {
    setSelectedProducts(
      (prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId) // Uncheck
          : [...prev, productId] // Check
    );
  };

  const isProductSelected = (productId) => selectedProducts.includes(productId);

  const handleProductsPerPageChange = (e) => {
    const value =
      e.target.value === "custom" ? 0 : parseInt(e.target.value, 10);
    setProductsPerPage(value);
    setCurrentPage(1); // Reset to the first page
  };

  const handleCustomInputChange = (e) => {
    setCustomInputValue(e.target.value); // เก็บค่าจาก input ชั่วคราว
  };

  const handleCustomProductsPerPageSubmit = () => {
    const value = parseInt(customInputValue, 10);
    if (!isNaN(value) && value > 0) {
      // อัปเดตรายการ dropdown และตั้งค่า productsPerPage
      setCustomOptions((prevOptions) =>
        prevOptions.includes(value)
          ? prevOptions
          : [...prevOptions, value].sort((a, b) => a - b)
      );
      setProductsPerPage(value); // อัปเดตจำนวนสินค้าต่อหน้า
      setCurrentPage(1); // Reset to the first page
      setCustomInputValue(""); // ล้างค่าช่อง input
    }
  };

  const cancelAllSelected = () => {
    setSelectedProducts([]);
  };

  const deleteSelectedProducts = async () => {
    if (
      window.confirm("Are you sure you want to delete the selected products?")
    ) {
      try {
        // ลบสินค้าใน Firebase
        await Promise.all(
          selectedProducts.map((productId) => deleteProduct(productId))
        );

        // อัปเดตรายการสินค้าใน State
        setProducts((prevProducts) =>
          prevProducts.filter(
            (product) => !selectedProducts.includes(product.id)
          )
        );

        // ล้างรายการสินค้าที่ถูกเลือก
        setSelectedProducts([]);

        alert("Selected products have been deleted.");
      } catch (error) {
        alert("An error occurred while deleting selected products.");
      }
    }
  };

  const exportSelectedProducts = (type) => {
    if (selectedProducts.length === 0) {
      alert("Please select products to export.");
      return;
    }

    // กรองสินค้าเฉพาะที่เลือก
    const selectedData = products
      .filter((product) => selectedProducts.includes(product.id))
      .map((product) => {
        const finalPrice =
          product.NormalPrice && product.Discount
            ? product.NormalPrice -
              (product.NormalPrice * product.Discount) / 100
            : product.NormalPrice;

        return {
          Brand: product.Brand || "N/A",
          SKU: product.SKU || "N/A",
          Name: product.Name || "N/A",
          Categories: product.Categories || "N/A",
          Seller: product.Seller || "N/A",
          NormalPrice: product.NormalPrice
            ? `฿${new Intl.NumberFormat("th-TH", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(product.NormalPrice)}`
            : "N/A",
          Discount: product.Discount ? `${product.Discount}%` : "N/A", // เพิ่ม Discount
          FinalPrice: finalPrice
            ? `฿${new Intl.NumberFormat("th-TH", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(finalPrice)}`
            : "N/A", // เพิ่ม FinalPrice
          Status: product.Status || "N/A",
          CreatedAt: product.CreatedAt
            ? new Date(product.CreatedAt).toLocaleString()
            : "N/A",
          LastUpdate: product.LastUpdate
            ? new Date(product.LastUpdate).toLocaleString()
            : "N/A",
        };
      });

    if (type === "csv" || type === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(selectedData); // แปลงข้อมูลเป็น Worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Products");

      if (type === "csv") {
        XLSX.writeFile(workbook, "selected_products.csv", { bookType: "csv" });
      } else if (type === "excel") {
        XLSX.writeFile(workbook, "selected_products.xlsx", {
          bookType: "xlsx",
        });
      }
    } else if (type === "print") {
      const printableData = selectedData.map((product) => ({
        Brand: product.Brand,
        SKU: product.SKU,
        Name: product.Name,
        Categories: product.Categories,
        Seller: product.Seller,
        NormalPrice: product.NormalPrice,
        Discount: product.Discount, // เพิ่ม Discount
        FinalPrice: product.FinalPrice, // เพิ่ม FinalPrice
        Status: product.Status,
        CreatedAt: product.CreatedAt,
        LastUpdate: product.LastUpdate,
      }));

      const newWindow = window.open("", "_blank");
      const printContent = `
        <html>
          <head>
            <title>Print Selected Products</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f4f4f4; }
            </style>
          </head>
          <body>
            <h2>Selected Products</h2>
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Brand</th>
                  <th>Name</th>
                  <th>Categories</th>
                  <th>Seller</th>
                  <th>Normal Price</th>
                  <th>Discount (%)</th>
                  <th>Final Price</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                ${printableData
                  .map(
                    (row) =>
                      `<tr>
                        <td>${row.Brand}</td>
                        <td>${row.SKU}</td>
                        <td>${row.Name}</td>
                        <td>${row.Categories}</td>
                        <td>${row.Seller}</td>
                        <td>${row.NormalPrice}</td>
                        <td>${row.Discount}</td>
                        <td>${row.FinalPrice}</td>
                        <td>${row.Status}</td>
                        <td>${row.CreatedAt}</td>
                        <td>${row.LastUpdate}</td>
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.print();
    }
  };

  return (
    <div className="product-list">
      <h2>Product List</h2>
      <div className="product-header">
        {/* Input Search */}
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Add and Import Product Buttons */}
        <div className="button-group">
          <button className="add-button" onClick={openAddModal}>
            Add Product
          </button>
          <button className="import-button" onClick={openImportModal}>
            Import Products
          </button>
        </div>
      </div>

      <div className="pagination-and-records">
        {/* Records Found */}
        <div className="records-found">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "record" : "records"} found
          {selectedProducts.length > 0 && (
            <span>
              {" "}
              | {selectedProducts.length}{" "}
              {selectedProducts.length === 1 ? "selected" : "selected"}
            </span>
          )}
        </div>

        {/* Pagination Controls */}
        <div
          className={`pagination-controls ${
            productsPerPage === 0
              ? "product-pagination-custom"
              : "product-pagination-default"
          }`}
        >
          <label htmlFor="products-per-page">Products per page:</label>
          <select
            id="products-per-page"
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

      {isAddModalOpen && (
        <AddProduct
          onAdd={(newProduct) => {
            onAdd(newProduct);
            closeAddModal();
          }}
          onClose={closeAddModal}
        />
      )}
      {isEditModalOpen && (
        <EditProduct
          product={editingProduct}
          categories={categories}
          onSave={(id, updatedProduct) => {
            onEdit(id, updatedProduct);
            closeEditModal();
          }}
          onDelete={(id) => {
            onDelete(id);
            closeEditModal();
          }}
          onClose={closeEditModal}
        />
      )}
      {isImportModalOpen && (
        <ImportProducts
          onImport={(parsedData) => {
            onImport(parsedData);
            closeImportModal();
          }}
          onClose={closeImportModal}
        />
      )}
      <table className="product-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelectedProducts(
                    e.target.checked ? displayedProducts.map((p) => p.id) : []
                  )
                }
                disabled={isModalOpen} // Disable checkbox เมื่อ modal เปิดอยู่
                checked={
                  displayedProducts.every((p) => isProductSelected(p.id)) &&
                  displayedProducts.length > 0
                }
              />
            </th>
            <th>Image</th>
            <th>SKU</th>
            <th>Brand</th>
            <th>Name</th>
            <th>Categories</th>
            <th>Seller</th>
            <th>Normal Price</th>
            <th>Discount (%)</th> {/* เพิ่มคอลัมน์ Discount */}
            <th>Final Price</th> {/* เพิ่มคอลัมน์ Final Price */}
            <th>Status</th>
            <th>Created At</th>
            <th>Last Update</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedProducts.map((product) => {
            // คำนวณ Final Price
            const finalPrice =
              product.NormalPrice && product.Discount
                ? product.NormalPrice -
                  (product.NormalPrice * product.Discount) / 100
                : product.NormalPrice;

            return (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    disabled={isModalOpen} // Disable individual checkboxes
                    checked={isProductSelected(product.id)}
                    onChange={() => handleCheckboxChange(product.id)}
                  />
                </td>
                <td>
                  {product.Image ? (
                    <img
                      src={product.Image}
                      alt={product.Name || "Product Image"}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{product.SKU || "N/A"}</td>
                <td>{product.Brand || "N/A"}</td>
                <td>{product.Name || "N/A"}</td>
                <td>{product.Categories || "N/A"}</td>
                <td>{product.Seller || "N/A"}</td>
                <td>
                  {product.NormalPrice
                    ? `฿${new Intl.NumberFormat("th-TH", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(product.NormalPrice)}`
                    : "N/A"}
                </td>
                <td>{product.Discount ? `${product.Discount}%` : "N/A"}</td>
                <td>
                  {finalPrice
                    ? `฿${new Intl.NumberFormat("th-TH", {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(finalPrice)}`
                    : "N/A"}
                </td>
                <td className="status">
                  <span
                    className={`status-badge ${
                      product.Status === "active"
                        ? "delivered"
                        : product.Status === "inactive"
                        ? "process"
                        : "canceled"
                    }`}
                  >
                    {product.Status || "N/A"}
                  </span>
                </td>
                <td>
                  {product.CreatedAt
                    ? new Date(product.CreatedAt).toLocaleString()
                    : "N/A"}
                </td>
                <td>
                  {product.LastUpdate
                    ? new Date(product.LastUpdate).toLocaleString()
                    : "N/A"}
                </td>
                <td className="actions">
                  <button
                    className="edit"
                    onClick={() => openEditModal(product)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Action Bar */}
      {selectedProducts.length > 0 && (
        <div className="action-bar">
          <span className="selected-info">
            {selectedProducts.length} of {filteredProducts.length} Selected
          </span>
          <div className="divider"></div>
          <button
            className="action-button export-selected"
            onClick={() => exportSelectedProducts("csv")}
          >
            Export CSV
          </button>
          <div className="divider"></div>
          <button
            className="action-button export-selected"
            onClick={() => exportSelectedProducts("excel")}
          >
            Export Excel
          </button>
          <div className="divider"></div>
          <button
            className="action-button export-selected"
            onClick={() => exportSelectedProducts("print")}
          >
            Print
          </button>
          <div className="divider"></div>
          <button
            className="action-button delete-selected"
            onClick={deleteSelectedProducts}
          >
            Delete Selected
          </button>
          <div className="divider"></div>
          <button
            className="action-button cancel-selected"
            onClick={cancelAllSelected}
          >
            Cancel All
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
