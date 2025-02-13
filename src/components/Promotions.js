import React, { useState, useEffect } from "react";
import {
  getPromotions,
  addPromotion,
  deletePromotion,
} from "../services/promotionService";
import "./Promotions.css";
import { FaPlus, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

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
      // ✅ แจ้งเตือนเมื่อข้อมูลไม่ครบ
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information!",
        text: "Please fill in all required fields.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (end <= start) {
      // ✅ แจ้งเตือนเมื่อวันสิ้นสุดต้องมากกว่าวันเริ่ม
      Swal.fire({
        icon: "error",
        title: "Invalid Date Range!",
        text: "The end date and time must be later than the start date and time.",
        confirmButtonText: "OK",
      });
      return;
    }

    // ✅ แสดง SweetAlert2 ถามยืนยันก่อนเพิ่มโปรโมชั่น
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
        setPromotions([...promotions, addedPromo]);
        setNewPromotion({
          name: "",
          discount: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
        });

        // ✅ แจ้งเตือนเมื่อเพิ่มโปรโมชั่นสำเร็จ
        Swal.fire({
          icon: "success",
          title: "Promotion Added!",
          text: "The promotion has been successfully added.",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("🚨 Error adding promotion:", error);

        // ✅ แจ้งเตือนเมื่อเกิดข้อผิดพลาด
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "An error occurred while adding the promotion.",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleDeletePromotion = async (id) => {
    // ✅ แสดง SweetAlert2 ถามยืนยันก่อนลบ
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

        // ✅ แจ้งเตือนเมื่อโปรโมชั่นถูกลบสำเร็จ
        Swal.fire({
          icon: "success",
          title: "Promotion Deleted!",
          text: "The promotion has been successfully deleted.",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("🚨 Error deleting promotion:", error);

        // ✅ แจ้งเตือนเมื่อเกิดข้อผิดพลาด
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
