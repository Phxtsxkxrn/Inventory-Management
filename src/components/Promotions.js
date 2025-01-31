import React, { useState, useEffect } from "react";
import {
  getPromotions,
  addPromotion,
  deletePromotion,
} from "../services/promotionService";
import "./Promotions.css";
import { FaPlus, FaTrash } from "react-icons/fa";

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [newPromotion, setNewPromotion] = useState({
    name: "",
    discount: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

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
      alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
      return;
    }

    if (end <= start) {
      alert("วันและเวลาสิ้นสุดต้องมากกว่าวันและเวลาเริ่มต้น!");
      return;
    }

    const addedPromo = await addPromotion(newPromotion);
    setPromotions([...promotions, addedPromo]);
    setNewPromotion({
      name: "",
      discount: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
  };

  const handleDeletePromotion = async (id) => {
    await deletePromotion(id);
    setPromotions(promotions.filter((promo) => promo.id !== id));
  };

  return (
    <div className="promotions-container">
      <h2>Promotions</h2>
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
        <button onClick={handleAddPromotion} className="add-promotion-btn">
          <FaPlus /> Add Promotion
        </button>
      </div>

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
                  <FaTrash /> Delete
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
