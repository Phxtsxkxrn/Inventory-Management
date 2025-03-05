import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import ImportProducts from "./ImportProducts";
import "./ProductList.css"; // นำเข้าไฟล์ CSS
import { deleteProduct } from "../services/productService";
import React, { useState, useEffect, useCallback } from "react"; // ✅ เพิ่ม useEffect ที่นี่
import { useLocation } from "react-router-dom";
import { getProducts } from "../services/productService"; // ✅ โหลดสินค้าใหม่
import { exportProducts } from "../services/exportService";
import { updateProductStatus } from "../services/productService";
import Swal from "sweetalert2";
import { db } from "../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Filter from "./Filter"; // นำเข้า Filter

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
  const navigate = useNavigate(); // ✅ ใช้ navigate เพื่อเปลี่ยนหน้า
  const [isModalOpen, setIsModalOpen] = useState(false); // State ควบคุมการเปิด Modal
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // State for filter modal
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastUpdateStart, setLastUpdateStart] = useState("");
  const [lastUpdateEnd, setLastUpdateEnd] = useState("");
  const [status, setStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  console.log("Current User Role:", userRole);

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const currentTime = new Date().toISOString(); // เก็บเวลาปัจจุบันในรูปแบบ ISO

      // ค้นหาสินค้าที่ต้องการเปลี่ยนแปลง
      const updatedProducts = products.map((product) =>
        product.id === productId
          ? { ...product, Status: newStatus, LastUpdate: currentTime } // ✅ อัปเดต LastUpdate
          : product
      );

      // อัปเดตค่าใน State
      setProducts(updatedProducts);

      // อัปเดตในฐานข้อมูล (Firebase / API)
      await updateProductStatus(productId, newStatus, currentTime); // ✅ ส่งค่า LastUpdate ไปด้วย
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // ✅ นำสินค้าไปที่ Manage Promotions
  const goToManagePromotions = () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    const selectedData = products.filter((product) =>
      selectedProducts.includes(product.id)
    );

    navigate("/manage-promotions", {
      state: { selectedProducts: selectedData },
    });
  };

  // ✅ ใช้ useCallback ห่อ fetchProducts พร้อมเพิ่ม setProducts ใน dependency
  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [setProducts]); // ✅ แก้ warning โดยเพิ่ม setProducts

  useEffect(() => {
    const fetchUserRole = async () => {
      let role = localStorage.getItem("userRole"); // ✅ ดึงจาก localStorage ก่อน
      const email = localStorage.getItem("userEmail");

      if (!role && email) {
        const docRef = doc(db, "users", email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          role = docSnap.data().role;
          localStorage.setItem("userRole", role); // ✅ อัปเดตลง localStorage
        }
      }
      setUserRole(role);
    };

    fetchUserRole();
  }, []);

  // ✅ โหลดข้อมูลเมื่อเปิดหน้า ProductList
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // ✅ ใช้ fetchProducts เป็น dependency ที่ถูกต้อง

  // ✅ โหลดข้อมูลใหม่เมื่อกลับมาจาก ManagePricing
  useEffect(() => {
    if (location.state?.updated) {
      fetchProducts();
    }
  }, [location.state, fetchProducts]); // ✅ เพิ่ม fetchProducts ใน dependencies

  // โหลดข้อมูลใหม่ทุก ๆ 1 นาที
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts(); // ✅ โหลดสินค้าใหม่ทุก ๆ 60 วินาที
    }, 60000); // 60 วินาที

    return () => clearInterval(interval); // เคลียร์ interval เมื่อออกจากหน้า
  }, [fetchProducts]);

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

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  const handleFilterChange = ({
    minPrice,
    maxPrice,
    startDate,
    endDate,
    lastUpdateStart,
    lastUpdateEnd,
    status,
  }) => {
    setMinPrice(minPrice);
    setMaxPrice(maxPrice);
    setStartDate(startDate);
    setEndDate(endDate);
    setLastUpdateStart(lastUpdateStart);
    setLastUpdateEnd(lastUpdateEnd);
    setStatus(status);
  };

  const filteredProducts = products
    .filter((product) =>
      Object.values(product)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((product) => {
      const price = product.NormalPrice || 0;
      const createdAt = new Date(product.CreatedAt);
      const lastUpdate = new Date(product.LastUpdate);
      const isPriceInRange =
        (minPrice === "" || price >= minPrice) &&
        (maxPrice === "" || price <= maxPrice);
      const isCreatedAtInRange =
        (startDate === "" || createdAt >= new Date(startDate)) &&
        (endDate === "" || createdAt <= new Date(endDate));
      const isLastUpdateInRange =
        (lastUpdateStart === "" || lastUpdate >= new Date(lastUpdateStart)) &&
        (lastUpdateEnd === "" || lastUpdate <= new Date(lastUpdateEnd));
      const isStatusMatch = status === "" || product.Status === status;
      return (
        isPriceInRange &&
        isCreatedAtInRange &&
        isLastUpdateInRange &&
        isStatusMatch
      );
    });

  const onSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span className="sort-icon">⇅</span>;
    }
    return sortConfig.direction === "asc" ? (
      <span className="sort-icon">↑</span>
    ) : (
      <span className="sort-icon">↓</span>
    );
  };

  const sortedProducts = React.useMemo(() => {
    let sortableProducts = filteredProducts.map((product) => {
      // Calculate finalPrice for each product
      const discountPercentage = product.AppliedPromotion
        ? product.AppliedPromotion.discount
        : product.Discount || 0;

      const finalPrice =
        product.NormalPrice && discountPercentage
          ? product.NormalPrice -
            (product.NormalPrice * discountPercentage) / 100
          : product.NormalPrice || 0;

      return {
        ...product,
        finalPrice: finalPrice,
        // Convert price strings to numbers for sorting
        NormalPrice: parseFloat(product.NormalPrice) || 0,
        Discount: parseFloat(product.Discount) || 0,
      };
    });

    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric sorting
        if (
          ["NormalPrice", "Discount", "finalPrice"].includes(sortConfig.key)
        ) {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }
        // Handle date sorting
        else if (
          sortConfig.key === "CreatedAt" ||
          sortConfig.key === "LastUpdate"
        ) {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }
        // Handle string sorting
        else {
          aValue = String(aValue || "").toLowerCase();
          bValue = String(bValue || "").toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [filteredProducts, sortConfig]);

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const displayedProducts = sortedProducts.slice(
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
    // ✅ แสดง SweetAlert2 ยืนยันก่อนลบ
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete the selected products?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // ✅ ลบสินค้าใน Firebase
          await Promise.all(
            selectedProducts.map((productId) => deleteProduct(productId))
          );

          // ✅ อัปเดตรายการสินค้าใน State
          setProducts((prevProducts) =>
            prevProducts.filter(
              (product) => !selectedProducts.includes(product.id)
            )
          );

          // ✅ ล้างรายการสินค้าที่ถูกเลือก
          setSelectedProducts([]);

          // ✅ แจ้งเตือนว่าสำเร็จ
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Selected products have been deleted.",
            confirmButtonText: "OK",
          });
        } catch (error) {
          // ✅ แจ้งเตือนเมื่อเกิดข้อผิดพลาด
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "An error occurred while deleting selected products.",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  // ✅ ฟังก์ชันไปที่หน้า Manage Pricing
  const goToManagePricing = () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }
    // ✅ ส่งเฉพาะสินค้าที่เลือกไปหน้า ManagePricing
    const selectedData = products.filter((product) =>
      selectedProducts.includes(product.id)
    );
    navigate("/manage-pricing", { state: { selectedProducts: selectedData } });
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
        <div className="button-group">
          {/* ปุ่ม Filter แสดงสำหรับทุก role */}
          <button className="filter-button" onClick={openFilterModal}>
            Filter
          </button>
          {/* ปุ่มอื่นๆ แสดงเฉพาะ non-Employee */}
          {userRole !== "Employee" && (
            <>
              <button className="add-button" onClick={openAddModal}>
                Add Product
              </button>
              <button className="import-button" onClick={openImportModal}>
                Import Products
              </button>
            </>
          )}
        </div>
      </div>

      {/* เพิ่ม Filter Component */}
      <Filter
        onFilterChange={handleFilterChange}
        isOpen={isFilterModalOpen}
        closeModal={closeFilterModal}
      />

      <div className="pagination-and-records">
        {/* Records Found */}
        <div className="records-found">
          {sortedProducts.length}{" "}
          {sortedProducts.length === 1 ? "record" : "records"} found
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
            <th
              onClick={() => onSort("Image")}
              className="sortable"
              data-active={sortConfig.key === "Image"}
            >
              Image <SortIcon column="Image" />
            </th>
            <th
              onClick={() => onSort("SKU")}
              className="sortable"
              data-active={sortConfig.key === "SKU"}
            >
              SKU <SortIcon column="SKU" />
            </th>
            <th
              onClick={() => onSort("Brand")}
              className="sortable"
              data-active={sortConfig.key === "Brand"}
            >
              Brand <SortIcon column="Brand" />
            </th>
            <th
              onClick={() => onSort("Name")}
              className="sortable"
              data-active={sortConfig.key === "Name"}
            >
              Name <SortIcon column="Name" />
            </th>
            <th
              onClick={() => onSort("Categories")}
              className="sortable"
              data-active={sortConfig.key === "Categories"}
            >
              Categories <SortIcon column="Categories" />
            </th>
            <th
              onClick={() => onSort("Seller")}
              className="sortable"
              data-active={sortConfig.key === "Seller"}
            >
              Seller <SortIcon column="Seller" />
            </th>
            <th
              onClick={() => onSort("NormalPrice")}
              className="sortable"
              data-active={sortConfig.key === "NormalPrice"}
            >
              Normal Price <SortIcon column="NormalPrice" />
            </th>
            <th
              onClick={() => onSort("Discount")}
              className="sortable"
              data-active={sortConfig.key === "Discount"}
            >
              Discount (%) <SortIcon column="Discount" />
            </th>
            <th
              onClick={() => onSort("finalPrice")}
              className="sortable"
              data-active={sortConfig.key === "finalPrice"}
            >
              Final Price <SortIcon column="finalPrice" />
            </th>
            <th
              onClick={() => onSort("Status")}
              className="sortable"
              data-active={sortConfig.key === "Status"}
            >
              Status <SortIcon column="Status" />
            </th>
            <th
              onClick={() => onSort("CreatedAt")}
              className="sortable"
              data-active={sortConfig.key === "CreatedAt"}
            >
              Created At <SortIcon column="CreatedAt" />
            </th>
            <th
              onClick={() => onSort("LastUpdate")}
              className="sortable"
              data-active={sortConfig.key === "LastUpdate"}
            >
              Last Update <SortIcon column="LastUpdate" />
            </th>
            {userRole !== "Employee" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {displayedProducts.map((product) => {
            // ตรวจสอบว่ามีโปรโมชั่นที่กำลังใช้งานอยู่หรือไม่
            const discountPercentage = product.AppliedPromotion
              ? product.AppliedPromotion.discount
              : product.Discount || 0; // ใช้ Discount ปกติถ้าไม่มีโปรโมชั่น

            // คำนวณ Final Price ตามโปรโมชั่น (ถ้ามี)
            const finalPrice =
              product.NormalPrice && discountPercentage
                ? product.NormalPrice -
                  (product.NormalPrice * discountPercentage) / 100
                : product.NormalPrice;

            return (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    disabled={isModalOpen}
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
                <td>
                  {product.AppliedPromotion
                    ? `${product.AppliedPromotion.discount}% (Promo)`
                    : product.Discount
                    ? `${product.Discount}%`
                    : "N/A"}
                </td>
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
                  {userRole === "Employee" ? ( // ✅ ถ้าเป็น Employee ให้แสดงเฉพาะข้อความ
                    <span
                      className={`status-text ${
                        product.Status === "active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {product.Status === "active" ? "Active" : "Inactive"}
                    </span>
                  ) : (
                    // ✅ ถ้าไม่ใช่ Employee ให้ใช้ dropdown ปกติ
                    <select
                      value={product.Status}
                      onChange={(e) =>
                        handleStatusChange(product.id, e.target.value)
                      }
                      className={`status-dropdown ${
                        product.Status === "active"
                          ? "status-active"
                          : product.Status === "inactive"
                          ? "status-inactive"
                          : "status-other"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  )}
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
                {userRole !== "Employee" && (
                  <td className="actions">
                    <button
                      className="edit"
                      onClick={() => openEditModal(product)}
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Action Bar */}
      {/* ซ่อน Manage Pricing, Manage Promotions, และ Delete Selected ถ้าเป็น Employee */}
      {/* ✅ ซ่อนปุ่มบางปุ่มเมื่อเป็น Employee */}
      {selectedProducts.length > 0 && (
        <div
          className={`action-bar ${
            userRole === "Employee" ? "action-bar-employee" : ""
          }`}
        >
          <span className="selected-info">
            {selectedProducts.length} of {sortedProducts.length} Selected
          </span>
          <div className="divider"></div>
          <button
            className="action-button export-selected"
            onClick={() => exportProducts(products, selectedProducts, "csv")}
          >
            Export CSV
          </button>
          <div className="divider"></div>
          <button
            className="action-button export-selected"
            onClick={() => exportProducts(products, selectedProducts, "excel")}
          >
            Export Excel
          </button>
          <div className="divider"></div>
          <button
            className="action-button export-selected"
            onClick={() => exportProducts(products, selectedProducts, "print")}
          >
            Print
          </button>

          {/* ✅ ซ่อนปุ่มที่ Employee ไม่สามารถใช้ได้ */}
          {userRole !== "Employee" && (
            <>
              <div className="divider"></div>
              <button className="action-button" onClick={goToManagePricing}>
                Manage Pricing
              </button>
              <div className="divider"></div>
              <button
                className="action-button manage-promotions"
                onClick={goToManagePromotions}
              >
                Manage Promotions
              </button>
              <div className="divider"></div>
              <button
                className="action-button delete-selected"
                onClick={deleteSelectedProducts}
              >
                Delete Selected
              </button>
            </>
          )}

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
