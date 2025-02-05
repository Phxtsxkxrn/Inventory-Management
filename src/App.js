import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import CategoriesList from "./components/CategoriesList";
import ManagePricing from "./components/ManagePricing";
import Promotions from "./components/Promotions";
import ManagePromotions from "./components/ManagePromotions";
import Login from "./components/Login";
import Register from "./components/Register";
import UserList from "./components/UserList";
import { auth } from "./services/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "./services/productService";
import {
  getCategories,
  addCategories,
  deleteCategories,
} from "./services/categoriesService";

const App = () => {
  const [user, loading] = useAuthState(auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const handleAddProduct = async (newProduct) => {
    try {
      const addedProduct = await addProduct(newProduct);
      setProducts((prevProducts) => [...prevProducts, addedProduct]);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEditProduct = async (id, updatedProduct) => {
    try {
      await updateProduct(id, updatedProduct);
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error editing product:", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddCategories = async (newCategories) => {
    try {
      await addCategories(newCategories);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error adding categories:", error);
    }
  };

  const handleDeleteCategories = async (id) => {
    try {
      await deleteCategories(id);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error deleting categories:", error);
    }
  };

  const handleImportProducts = async (parsedData) => {
    try {
      for (const product of parsedData) {
        await addProduct(product);
      }
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error importing products:", error);
    }
  };

  if (loading) return <h1>Loading...</h1>;

  return (
    <Router>
      <div style={{ display: "flex" }}>
        {/* Navbar ควรแสดงเฉพาะเมื่อ user login แล้ว */}
        {user && <Navbar />}
        <div style={{ flex: 1, padding: "20px" }}>
          <Routes>
            {/* ถ้ายังไม่ได้ Login, Redirect ไปที่ Login */}
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/register"
              element={user ? <Register /> : <Navigate to="/login" />}
            />
            <Route
              path="/users"
              element={user ? <UserList /> : <Navigate to="/login" />}
            />
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
              path="/manage-pricing"
              element={
                <ManagePricing products={products} setProducts={setProducts} />
              }
            />
            <Route path="/promotions" element={<Promotions />} />
            <Route
              path="/manage-promotions"
              element={
                <ManagePromotions
                  products={products}
                  setProducts={setProducts}
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
};

export default App;
