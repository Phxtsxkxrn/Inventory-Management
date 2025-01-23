import React, { useState } from "react";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import ImportProducts from "./ImportProducts";
import "./ProductList.css"; // นำเข้าไฟล์ CSS

const ProductList = ({ products, categories, onAdd, onEdit, onDelete, onImport }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

  const openAddModal = () => {
    setIsAddModalOpen(true);
    closeDropdown(); // ปิด Dropdown
  };
  const closeAddModal = () => setIsAddModalOpen(false);

  const openImportModal = () => {
    setIsImportModalOpen(true);
    closeDropdown(); // ปิด Dropdown
  };
  const closeImportModal = () => setIsImportModalOpen(false);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  return (
    <div className="product-list">
      <h2>Product List</h2>
      <div className="product-header">
        {/* Add Product Dropdown */}
        <div className="dropdown-container">
          <button className="add-button" onClick={toggleDropdown}>
            Add Product ▼
          </button>
          {isDropdownOpen && (
            <div className="add-product-dropdown-menu">
              <button onClick={openAddModal} className="add-product-dropdown-item">
                Add Single Product
              </button>
              <button onClick={openImportModal} className="add-product-dropdown-item">
                Import Products
              </button>
            </div>
          )}
        </div>
      </div>
      {isAddModalOpen && (
        <AddProduct
          onAdd={(newProduct) => {
            onAdd(newProduct); // เรียกฟังก์ชัน onAdd ที่ส่งมาจาก App.js
            closeAddModal(); // ปิด popup
          }}
          onClose={closeAddModal}
        />
      )}
      {isEditModalOpen && (
        <EditProduct
          product={editingProduct}
          categories={categories} // ส่ง categories
          onSave={(id, updatedProduct) => {
            onEdit(id, updatedProduct); // อัปเดตข้อมูลใน Firebase
            closeEditModal();
          }}
          onDelete={(id) => {
            onDelete(id); // ลบสินค้า
            closeEditModal();
          }}
          onClose={closeEditModal}
        />
      )}
      {isImportModalOpen && (
        <ImportProducts
          onImport={(parsedData) => {
            onImport(parsedData); // ส่งข้อมูลที่อ่านได้ไปยัง parent
            closeImportModal(); // ปิด modal
          }}
          onClose={closeImportModal}
        />
      )}
      <table className="product-table">
        <thead>
          <tr>
            <th>Brand</th>
            <th>SKU</th>
            <th>Name</th>
            <th>Categories</th>
            <th>Seller</th>
            <th>Normal Price</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Last Update</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.Brand || "N/A"}</td>
              <td>{product.SKU || "N/A"}</td>
              <td>{product.Name || "N/A"}</td>
              <td>{product.Categories || "N/A"}</td>
              <td>{product.Seller || "N/A"}</td>
              <td>{product.NormalPrice || "N/A"}</td>
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
                <button className="edit" onClick={() => openEditModal(product)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
