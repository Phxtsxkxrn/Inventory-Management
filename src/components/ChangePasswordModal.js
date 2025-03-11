import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { changePassword } from "../services/auth.service";
import { showToast } from "../utils/toast";
import "./ChangePasswordModal.css";

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

const ChangePasswordModal = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const email = localStorage.getItem("userEmail");
      const result = await changePassword(email, data.newPassword);

      if (result.success) {
        localStorage.removeItem("isFirstLogin");
        showToast.success("Password changed successfully");
        onSuccess();
      } else {
        showToast.error(result.message || "Failed to change password");
      }
    } catch (error) {
      showToast.error("An error occurred while changing password");
    }
  };

  return (
    <div className="change-pwd-modal">
      <div className="change-pwd-content">
        <h2>Change Password Required</h2>
        <p>You must change your password before continuing.</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="change-pwd-form-group">
            <label>New Password:</label>
            <input type="password" {...register("newPassword")} />
            {errors.newPassword && (
              <span className="change-pwd-error">
                {errors.newPassword.message}
              </span>
            )}
          </div>

          <div className="change-pwd-form-group">
            <label>Confirm Password:</label>
            <input type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <span className="change-pwd-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button type="submit" className="change-pwd-button">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
