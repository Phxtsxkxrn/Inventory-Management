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
import EditProfile from "./components/EditProfile";
import ResetPassword from "./components/ResetPassword";
import NewPassword from "./components/NewPassword"; // เพิ่มบรรทัดนี้
import ProductPreview from "./pages/ProductPreview";
import { db } from "./services/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore"; // เชื่อมต่อกับ Firestore
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  importProducts,
} from "./services/product.service";
import {
  getCategories,
  addCategories,
  deleteCategories,
} from "./services/categories.service";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Protected from "./components/Protected";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // ฟังก์ชันที่ใช้ในการตรวจสอบการเข้าสู่ระบบ
  const checkUserStatus = async () => {
    const userEmail = localStorage.getItem("userEmail"); // เก็บข้อมูลผู้ใช้ใน localStorage
    if (userEmail) {
      const docRef = doc(db, "users", userEmail);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUser(docSnap.data());
      }
    }
    setLoading(false); // หลังจากโหลดเสร็จแล้ว
  };

  useEffect(() => {
    checkUserStatus();

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

  const handleImportProducts = async (importData) => {
    try {
      // จัดการกรณีการอัพเดทและเพิ่มใหม่
      await importProducts(importData);
      // โหลดข้อมูลใหม่หลังจาก import เสร็จ
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error importing products:", error);
      throw error;
    }
  };

  // ฟังก์ชันเพื่อเข้าสู่ระบบสำเร็จ
  const handleLoginSuccess = (userData) => {
    setUser(userData); // เก็บข้อมูลผู้ใช้ที่เข้าสู่ระบบ
    localStorage.setItem("userEmail", userData.email); // เก็บอีเมลใน localStorage
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUser(null); // ลบข้อมูลผู้ใช้ในสถานะ
  };

  // ฟังก์ชันสำหรับการสมัครสมาชิก
  const handleRegister = async (email, password) => {
    const userRef = doc(db, "users", email);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // หากผู้ใช้มีอยู่แล้วใน Firestore
      throw new Error("User already exists"); // ส่ง error กลับไปให้ component จัดการ
    } else {
      // ถ้าผู้ใช้ไม่มีในระบบ ให้ลงทะเบียนใหม่
      const newUser = {
        email,
        password,
        createdAt: new Date(),
      };

      await setDoc(userRef, newUser);
      localStorage.setItem("userEmail", email);
      setUser({ email });
    }
  };

  if (loading) return <h1>Loading...</h1>;

  return (
    <Router>
      <div style={{ display: "flex" }}>
        {user && <Navbar onLogout={handleLogout} />}
        <div style={{ flex: 1, padding: "14px" }}>
          <Routes>
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/" />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/" />
                ) : (
                  <Register onRegister={handleRegister} />
                )
              }
            />
            <Route
              path="/edit-profile"
              element={user ? <EditProfile /> : <Navigate to="/login" />}
            />
            <Route
              path="/users"
              element={user ? <UserList /> : <Navigate to="/login" />}
            />
            <Route
              path="/product-list"
              element={
                user ? (
                  <ProductList
                    products={products}
                    setProducts={setProducts}
                    categories={categories}
                    onAdd={handleAddProduct}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onImport={handleImportProducts}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/categories-list"
              element={
                user ? (
                  <CategoriesList
                    categories={categories}
                    onAdd={handleAddCategories}
                    onDelete={handleDeleteCategories}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/manage-pricing"
              element={
                user ? (
                  <ManagePricing
                    products={products}
                    setProducts={setProducts}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/promotions"
              element={user ? <Promotions /> : <Navigate to="/login" />}
            />
            <Route
              path="/manage-promotions"
              element={
                user ? (
                  <ManagePromotions
                    products={products}
                    setProducts={setProducts}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/add"
              element={
                user ? (
                  <ProductForm onSubmit={handleAddProduct} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/new-password" element={<NewPassword />} />
            <Route
              path="/product-preview"
              element={
                <Protected>
                  <ProductPreview />
                </Protected>
              }
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />
        </div>
      </div>
    </Router>
  );
};

export default App;
