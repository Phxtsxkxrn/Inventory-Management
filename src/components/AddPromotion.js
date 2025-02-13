import React, { useState } from "react";
import Swal from "sweetalert2";
import { addPromotion } from "../services/promotionService";
import "./AddPromotion.css";

const AddPromotion = ({ onPromotionAdded, onCancel }) => {
  const [newPromotion, setNewPromotion] = useState({
    name: "",
    discount: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const handleAddPromotion = async () => {
    const start = new Date(
      `${newPromotion.startDate}T${newPromotion.startTime}`
    );
    const end = new Date(`${newPromotion.endDate}T${newPromotion.endTime}`);

    if (
      !newPromotion.name ||
      !newPromotion.discount ||
      !newPromotion.startDate ||
      !newPromotion.startTime ||
      !newPromotion.endDate ||
      !newPromotion.endTime
    ) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information!",
        text: "Please fill in all required fields.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (end <= start) {
      Swal.fire({
        icon: "error",
        title: "Invalid Date Range!",
        text: "The end date and time must be later than the start date and time.",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to add this promotion?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const addedPromo = await addPromotion(newPromotion);
        onPromotionAdded(addedPromo);
        setNewPromotion({
          name: "",
          discount: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
        });

        Swal.fire({
          icon: "success",
          title: "Promotion Added!",
          text: "The promotion has been successfully added.",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("🚨 Error adding promotion:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "An error occurred while adding the promotion.",
          confirmButtonText: "OK",
        });
      }
    }
  };

  return (
    <div className="promotion-form">
      <input
        type="text"
        placeholder="Promotion Name"
        value={newPromotion.name}
        onChange={(e) =>
          setNewPromotion({ ...newPromotion, name: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Discount (%)"
        value={newPromotion.discount}
        onChange={(e) =>
          setNewPromotion({ ...newPromotion, discount: e.target.value })
        }
      />
      <label>Start Date & Time:</label>
      <div className="datetime-group">
        <input
          type="date"
          value={newPromotion.startDate}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, startDate: e.target.value })
          }
        />
        <input
          type="time"
          value={newPromotion.startTime}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, startTime: e.target.value })
          }
        />
      </div>
      <label>End Date & Time:</label>
      <div className="datetime-group">
        <input
          type="date"
          value={newPromotion.endDate}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, endDate: e.target.value })
          }
        />
        <input
          type="time"
          value={newPromotion.endTime}
          onChange={(e) =>
            setNewPromotion({ ...newPromotion, endTime: e.target.value })
          }
        />
      </div>

      {/* ✅ จัดปุ่มให้เรียงข้างกัน */}
      <div className="modal-buttons">
        <button
          onClick={handleAddPromotion}
          className="promotion-modal-btn add"
        >
          Add Promotion
        </button>
        <button onClick={onCancel} className="promotion-modal-btn cancel">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddPromotion;
