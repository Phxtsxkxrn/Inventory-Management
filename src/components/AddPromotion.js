import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { addPromotion } from "../services/promotion.service";
import { showToast } from "../utils/toast";
import "./AddPromotion.css";

const schema = yup.object().shape({
  name: yup.string().required("Promotion name is required"),
  discount: yup
    .number()
    .typeError("Discount must be a number")
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .required("Discount is required"),
  startDate: yup.string().required("Start date is required"),
  startTime: yup.string().required("Start time is required"),
  endDate: yup.string().required("End date is required"),
  endTime: yup.string().required("End time is required"),
});

const AddPromotion = ({ onPromotionAdded, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      discount: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    },
  });

  const onSubmit = async (data) => {
    const start = new Date(`${data.startDate}T${data.startTime}`);
    const end = new Date(`${data.endDate}T${data.endTime}`);

    if (end <= start) {
      showToast.error(
        "End date and time must be later than start date and time"
      );
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
    });

    if (result.isConfirmed) {
      try {
        const addedPromo = await addPromotion(data);
        onPromotionAdded(addedPromo);
        showToast.success("Promotion added successfully");
      } catch (error) {
        console.error("Error adding promotion:", error);
        showToast.error("Failed to add promotion: " + error.message);
      }
    }
  };

  return (
    <div className="promotion-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Promotion Name" {...register("name")} />
        {errors.name && (
          <span className="error-message">{errors.name.message}</span>
        )}

        <input
          type="number"
          placeholder="Discount (%)"
          {...register("discount")}
        />
        {errors.discount && (
          <span className="error-message">{errors.discount.message}</span>
        )}

        <label>Start Date & Time:</label>
        <div className="datetime-group">
          <input type="date" {...register("startDate")} />
          <input type="time" {...register("startTime")} />
        </div>
        {errors.startDate && (
          <span className="error-message">{errors.startDate.message}</span>
        )}
        {errors.startTime && (
          <span className="error-message">{errors.startTime.message}</span>
        )}

        <label>End Date & Time:</label>
        <div className="datetime-group">
          <input type="date" {...register("endDate")} />
          <input type="time" {...register("endTime")} />
        </div>
        {errors.endDate && (
          <span className="error-message">{errors.endDate.message}</span>
        )}
        {errors.endTime && (
          <span className="error-message">{errors.endTime.message}</span>
        )}

        <div className="modal-buttons">
          <button type="submit" className="promotion-modal-btn add">
            Add Promotion
          </button>
          <button
            type="button"
            className="promotion-modal-btn cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPromotion;
