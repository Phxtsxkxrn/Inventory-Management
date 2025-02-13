import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPromotions } from "../services/promotionService";
import { updateProduct } from "../services/productService";
import "./ManagePromotions.css";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";

const ManagePromotions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [productPromotions, setProductPromotions] = useState({});
  const [globalPromotion, setGlobalPromotion] = useState("");

  useEffect(() => {
    if (location.state?.selectedProducts) {
      setSelectedProducts(location.state.selectedProducts);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchPromotions = async () => {
      const data = await getPromotions();
      setPromotions(data);
    };
    fetchPromotions();
  }, []);

  const handleGlobalPromotionChange = (promotionId) => {
    setGlobalPromotion(promotionId);

    const selectedPromo = promotions.find((promo) => promo.id === promotionId);
    if (!selectedPromo) return;

    const updatedProductPromotions = {};
    selectedProducts.forEach((product) => {
      updatedProductPromotions[product.id] = {
        promotionId: promotionId,
        startDateTime: selectedPromo.startDateTime
          ? new Date(selectedPromo.startDateTime).toISOString().slice(0, 16)
          : "",
        endDateTime: selectedPromo.endDateTime
          ? new Date(selectedPromo.endDateTime).toISOString().slice(0, 16)
          : "",
      };
    });

    setProductPromotions(updatedProductPromotions);
  };

  const handlePromotionChange = (productId, promotionId) => {
    const selectedPromo = promotions.find((promo) => promo.id === promotionId);
    if (!selectedPromo) return;

    console.log("📌 เลือกโปรโมชั่น:", productId, selectedPromo);

    setProductPromotions((prev) => ({
      ...prev,
      [productId]: {
        promotionId: promotionId,
        startDateTime: selectedPromo.startDateTime
          ? new Date(selectedPromo.startDateTime).toISOString().slice(0, 16) // ✅ แปลงเป็น YYYY-MM-DDTHH:mm
          : "",
        endDateTime: selectedPromo.endDateTime
          ? new Date(selectedPromo.endDateTime).toISOString().slice(0, 16) // ✅ แปลงเป็น YYYY-MM-DDTHH:mm
          : "",
      },
    }));
  };

  const handleSaveAllPromotion = async () => {
    try {
      const updatedProducts = selectedProducts.map((product) => ({
        id: product.id,
        promotionId: productPromotions[product.id]?.promotionId || null,
        startDateTime: productPromotions[product.id]?.startDateTime
          ? new Date(productPromotions[product.id].startDateTime).toISOString()
          : null,
        endDateTime: productPromotions[product.id]?.endDateTime
          ? new Date(productPromotions[product.id].endDateTime).toISOString()
          : null,
      }));

      // ✅ แสดง SweetAlert2 เพื่อยืนยันก่อนบันทึก
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to save promotions for all selected products?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, save all!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        console.log("🛠️ ส่งข้อมูลไป Firestore:", updatedProducts);

        await Promise.all(
          updatedProducts.map((product) => updateProduct(product.id, product))
        );

        // ✅ แจ้งเตือนเมื่อบันทึกสำเร็จ
        Swal.fire({
          icon: "success",
          title: "Promotions Updated!",
          text: "All promotions have been successfully saved.",
          confirmButtonText: "OK",
        });

        navigate("/product-list", { state: { updated: true } });
      }
    } catch (error) {
      console.error("🚨 Error updating promotions:", error);

      // ✅ แจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while updating promotions. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSavePromotion = async (productId) => {
    try {
      const updatedProduct = {
        id: productId,
        promotionId: productPromotions[productId]?.promotionId || null,
        startDateTime: productPromotions[productId]?.startDateTime
          ? new Date(productPromotions[productId].startDateTime).toISOString() // ✅ แปลงเป็น ISO format
          : null,
        endDateTime: productPromotions[productId]?.endDateTime
          ? new Date(productPromotions[productId].endDateTime).toISOString() // ✅ แปลงเป็น ISO format
          : null,
      };

      // ✅ แสดง SweetAlert2 ยืนยันก่อนบันทึก
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to save this promotion for the product?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, save it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        console.log("📌 บันทึกโปรโมชั่น:", updatedProduct);

        await updateProduct(productId, updatedProduct);

        // ✅ แจ้งเตือนเมื่อบันทึกสำเร็จ
        Swal.fire({
          icon: "success",
          title: "Promotion Updated!",
          text: "The promotion for this product has been successfully saved.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("🚨 Error updating promotion:", error);

      // ✅ แจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while updating the promotion.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="manage-promotions-container">
      <h2>Manage Promotions</h2>

      {/* ✅ แสดง Dropdown และปุ่ม Save Promotions เฉพาะเมื่อมีสินค้า */}
      {selectedProducts.length > 0 && (
        <div className="table-header">
          <div className="global-promotion-container">
            <label>Select Global Promotion:</label>
            <select
              value={globalPromotion}
              onChange={(e) => handleGlobalPromotionChange(e.target.value)}
            >
              <option value="">No Promotion</option>
              {promotions.map((promo) => (
                <option key={promo.id} value={promo.id}>
                  {promo.name} ({promo.discount}% Off)
                </option>
              ))}
            </select>
          </div>

          <button className="save-button" onClick={handleSaveAllPromotion}>
            <FaSave style={{ marginRight: "5px" }} /> Save All Promotions
          </button>
        </div>
      )}

      {/* ✅ ถ้ายังไม่มีสินค้าเลือก ให้แสดงข้อความแทนตาราง */}
      {selectedProducts.length === 0 ? (
        <div className="no-products-message">
          No products selected for Promotions.
        </div>
      ) : (
        <table className="promotion-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Current Price</th>
              <th>Select Promotion</th>
            </tr>
          </thead>
          <tbody>
            {selectedProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.Name}</td>
                <td>฿{product.NormalPrice.toFixed(2)}</td>
                <td>
                  <div className="promotion-select-group">
                    <select
                      value={productPromotions[product.id]?.promotionId || ""}
                      onChange={(e) =>
                        handlePromotionChange(product.id, e.target.value)
                      }
                    >
                      <option value="">No Promotion</option>
                      {promotions.map((promo) => (
                        <option key={promo.id} value={promo.id}>
                          {promo.name} ({promo.discount}% Off)
                        </option>
                      ))}
                    </select>
                    <label>Start Date & Time:</label>
                    <input
                      type="datetime-local"
                      value={productPromotions[product.id]?.startDateTime || ""}
                      onChange={(e) =>
                        setProductPromotions((prev) => ({
                          ...prev,
                          [product.id]: {
                            ...prev[product.id],
                            startDateTime: e.target.value,
                          },
                        }))
                      }
                    />
                    <label>End Date & Time:</label>
                    <input
                      type="datetime-local"
                      value={productPromotions[product.id]?.endDateTime || ""}
                      onChange={(e) =>
                        setProductPromotions((prev) => ({
                          ...prev,
                          [product.id]: {
                            ...prev[product.id],
                            endDateTime: e.target.value,
                          },
                        }))
                      }
                    />
                    <button
                      className="save-button"
                      onClick={() => handleSavePromotion(product.id)}
                    >
                      <FaSave style={{ marginRight: "5px" }} /> Save
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagePromotions;
