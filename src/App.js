import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import CategoriesList from "./components/CategoriesList";
import { getProducts, addProduct, updateProduct, deleteProduct } from "./services/productService";
import { getCategories, addCategories, deleteCategories } from "./services/categoriesService";


function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // State for categories

  // Fetch products from Firestore when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // Add a new product
  const handleAddProduct = async (newProduct) => {
    try {
      const addedProduct = await addProduct(newProduct); // เพิ่มสินค้าใน Firebase
      setProducts((prevProducts) => [...prevProducts, addedProduct]); // อัปเดต state
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Edit an existing product
  const handleEditProduct = async (id, updatedProduct) => {
    try {
      await updateProduct(id, updatedProduct); // Update in Firestore
      const updatedProducts = await getProducts(); // Refresh product list
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error editing product:", error);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id); // Delete from Firestore
      const updatedProducts = await getProducts(); // Refresh product list
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Add a new categories
  const handleAddCategories = async (newCategories) => {
    try {
      await addCategories(newCategories); // Add to Firestore
      const updatedCategories = await getCategories(); // Refresh categories list
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error adding categories:", error);
    }
  };

  // Delete a categories
  const handleDeleteCategories = async (id) => {
    try {
      await deleteCategories(id); // Delete from Firestore
      const updatedCategories = await getCategories(); // Refresh categories list
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error deleting categories:", error);
    }
  };

  const handleImportProducts = async (parsedData) => {
    try {
      for (const product of parsedData) {
        await addProduct(product); // เพิ่มสินค้าแต่ละตัวไปยัง Firebase
      }
      const updatedProducts = await getProducts(); // ดึงข้อมูลใหม่
      setProducts(updatedProducts); // อัปเดต State
    } catch (error) {
      console.error("Error importing products:", error);
    }
  };  
  

  return (
    <Router>
      <div style={{ display: "flex" }}>
        {/* Navbar */}
        <Navbar />
        <div style={{ flex: 1, padding: "20px" }}>
          {/* Main Content */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/product-list"
              element={
                <ProductList
                  products={products}
                  setProducts={setProducts}
                  categories={categories}
                  onAdd={handleAddProduct}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onImport={handleImportProducts}
                />
              }
            />
            <Route
              path="/categories-list"
              element={
                <CategoriesList
                  categories={categories}
                  onAdd={handleAddCategories}
                  onDelete={handleDeleteCategories}
                />
              }
            />
            <Route
              path="/add"
              element={<ProductForm onSubmit={handleAddProduct} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
