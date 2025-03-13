import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPromotions } from "../services/promotion.service";
import { updateProduct } from "../services/product.service";
import "./ManagePromotions.css";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";
import { showToast } from "../utils/toast";

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

      const existingPromotions = {};
      location.state.selectedProducts.forEach((product) => {
        if (product.promotionId) {
          existingPromotions[product.id] = {
            promotionId: product.promotionId,
            startDateTime: product.startDateTime,
            endDateTime: product.endDateTime,
          };
        }
      });

      setProductPromotions(existingPromotions);
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
    if (!promotionId) {
      setProductPromotions((prev) => ({
        ...prev,
        [productId]: {
          promotionId: null,
          startDateTime: null,
          endDateTime: null,
        },
      }));
      return;
    }

    const selectedPromo = promotions.find((promo) => promo.id === promotionId);
    if (!selectedPromo) return;

    const startDateTime = `${selectedPromo.startDate} ${selectedPromo.startTime}`;
    const endDateTime = `${selectedPromo.endDate} ${selectedPromo.endTime}`;

    setProductPromotions((prev) => ({
      ...prev,
      [productId]: {
        promotionId: promotionId,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
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
        await Promise.all(
          updatedProducts.map((product) => updateProduct(product.id, product))
        );

        showToast.success("All promotions have been successfully saved");
        navigate("/product-list", { state: { updated: true } });
      }
    } catch (error) {
      console.error("🚨 Error updating promotions:", error);
      showToast.error("Failed to update promotions. Please try again.");
    }
  };

  const handleSavePromotion = async (productId) => {
    try {
      const updatedProduct = {
        id: productId,
        promotionId: productPromotions[productId]?.promotionId || null,
        startDateTime: productPromotions[productId]?.startDateTime
          ? new Date(productPromotions[productId].startDateTime).toISOString()
          : null,
        endDateTime: productPromotions[productId]?.endDateTime
          ? new Date(productPromotions[productId].endDateTime).toISOString()
          : null,
      };

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
        await updateProduct(productId, updatedProduct);

        showToast.success("Promotion has been successfully saved");
      }
    } catch (error) {
      console.error("🚨 Error updating promotion:", error);
      showToast.error("Failed to update promotion");
    }
  };

  return (
    <div className="manage-promotions-container">
      <h2>Manage Promotions</h2>

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
                <td>
                  ฿
                  {new Intl.NumberFormat("th-TH").format(
                    product.NormalPrice.toFixed(2)
                  )}
                </td>
                <td>
                  <div className="promotion-select-group">
                    <select
                      value={
                        productPromotions[product.id]?.promotionId ||
                        product.promotionId ||
                        ""
                      }
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

                    <div className="promotion-dates">
                      <div className="date-display">
                        <label>Start Date & Time:</label>
                        <span>
                          {
                            promotions.find(
                              (p) =>
                                p.id ===
                                productPromotions[product.id]?.promotionId
                            )?.startDate
                          }{" "}
                          {promotions.find(
                            (p) =>
                              p.id ===
                              productPromotions[product.id]?.promotionId
                          )?.startTime || "-"}
                        </span>
                      </div>
                      <div className="date-display">
                        <label>End Date & Time:</label>
                        <span>
                          {
                            promotions.find(
                              (p) =>
                                p.id ===
                                productPromotions[product.id]?.promotionId
                            )?.endDate
                          }{" "}
                          {promotions.find(
                            (p) =>
                              p.id ===
                              productPromotions[product.id]?.promotionId
                          )?.endTime || "-"}
                        </span>
                      </div>
                    </div>

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
