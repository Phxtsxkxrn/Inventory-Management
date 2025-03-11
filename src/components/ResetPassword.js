import React, { useState } from "react";
import { showToast } from "../utils/toast";
import { useNavigate } from "react-router-dom";
import { createOTP, verifyOTP } from "../services/otp.service";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // ป้องกันการใส่เกิน 1 ตัว

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus ไปช่องถัดไป
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // ถ้ากด Backspace และช่องว่างเปล่า ให้ย้อนกลับไปช่องก่อนหน้า
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // เพิ่มฟังก์ชัน handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").trim();

    // ตรวจสอบว่าเป็นตัวเลข 6 หลักหรือไม่
    if (/^\d{6}$/.test(pastedText)) {
      const newOtp = pastedText.split("");
      setOtp(newOtp);

      // โฟกัสที่ช่องสุดท้าย
      const lastInput = document.getElementById("otp-5");
      if (lastInput) lastInput.focus();
    } else {
      showToast.error("Please paste a valid 6-digit code");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createOTP(email);
      showToast.success("OTP has been sent to your email");
      setOtpSent(true);
    } catch (error) {
      console.error("Error:", error);
      showToast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      showToast.error("Please enter complete OTP");
      return;
    }

    try {
      const result = await verifyOTP(email, enteredOtp);
      if (result) {
        showToast.success("OTP verified successfully");
        navigate("/new-password", {
          state: { email },
          replace: true,
        });
      } else {
        showToast.error("Invalid OTP code");
        // รีเซ็ต OTP fields
        setOtp(["", "", "", "", "", ""]);
        // โฟกัสที่ช่องแรก
        const firstInput = document.getElementById("otp-0");
        if (firstInput) firstInput.focus();
      }
    } catch (error) {
      if (error.message === "OTP has expired") {
        showToast.error("OTP has expired. Please request a new one");
        setOtpSent(false); // กลับไปหน้าขอ OTP ใหม่
      } else {
        showToast.error(error.message || "Verification failed");
      }
    }
  };

  return (
    <div className="rp-container">
      <div className="rp-card">
        <h2>Reset Password</h2>
        {!otpSent ? (
          <>
            <p>Enter your email address to receive a password reset link.</p>
            <form onSubmit={handleSubmit}>
              <div className="rp-form-group">
                <input
                  type="email"
                  className="rp-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="rp-button-group">
                <button
                  type="submit"
                  className="rp-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </button>
              </div>
              <div className="rp-back-link">
                <span onClick={() => navigate("/login")}>Back to Login</span>
              </div>
            </form>
          </>
        ) : (
          <>
            <p>Enter the 6-digit code sent to your email</p>
            <form onSubmit={handleVerifyOtp}>
              <div className="rp-otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined} // เพิ่ม onPaste ที่ช่องแรกเท่านั้น
                    className="rp-otp-input"
                  />
                ))}
              </div>
              <div className="rp-button-group">
                <button type="submit" className="rp-button">
                  Verify OTP
                </button>
              </div>
              <div className="rp-back-link">
                <span onClick={() => setOtpSent(false)}>Re-enter email</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
