import { toast } from "react-toastify";

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
};

export const showToast = {
  success: (message) => toast.success(message, defaultOptions),
  error: (message) =>
    toast.error(message, {
      ...defaultOptions,
      autoClose: 5000, // แสดงนานขึ้นสำหรับ error
    }),
  warning: (message) => toast.warning(message, defaultOptions),
  info: (message) => toast.info(message, defaultOptions),
};
