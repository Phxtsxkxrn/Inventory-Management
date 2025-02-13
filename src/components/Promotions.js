import React, { useState, useEffect } from "react";
import { getPromotions, deletePromotion } from "../services/promotionService";
import AddPromotion from "./AddPromotion";
import "./Promotions.css";
import Swal from "sweetalert2";

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      const data = await getPromotions();
      const sortedData = data.sort(
        (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
      );
      setPromotions(sortedData);
    };
    fetchPromotions();
  }, []);

  const handlePromotionAdded = (newPromo) => {
    setPromotions([...promotions, newPromo]);
    setIsModalOpen(false); // Close the modal after adding
  };

  const handleDeletePromotion = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this promotion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deletePromotion(id);
        setPromotions(promotions.filter((promo) => promo.id !== id));

        Swal.fire({
          icon: "success",
          title: "Promotion Deleted!",
          text: "The promotion has been successfully deleted.",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("🚨 Error deleting promotion:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "An error occurred while deleting the promotion.",
          confirmButtonText: "OK",
        });
      }
    }
  };

  return (
    <div className="promotions-container-p">
      <div className="promotion-header">
        <h2>Promotions</h2>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="add-promotion-btn"
      >
        Add Promotion
      </button>

      {/* Modal for Adding Promotion */}
      {isModalOpen && (
        <div className="modal-promotion">
          <div className="modal-content-promotion">
            <h3>Add Promotion</h3>
            <AddPromotion
              onPromotionAdded={handlePromotionAdded}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      <table className="promotion-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Discount (%)</th>
            <th>Start Date & Time</th>
            <th>End Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promo) => (
            <tr key={promo.id}>
              <td>{promo.name}</td>
              <td>{promo.discount}%</td>
              <td>
                {promo.startDate} {promo.startTime}
              </td>
              <td>
                {promo.endDate} {promo.endTime}
              </td>
              <td>
                <button
                  onClick={() => handleDeletePromotion(promo.id)}
                  className="delete-promotion-btn"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Promotions;
