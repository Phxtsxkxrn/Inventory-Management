import React from "react";
import { Navigate } from "react-router-dom";

const Protected = ({ children }) => {
  const userEmail = localStorage.getItem("userEmail");

  if (!userEmail) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default Protected;
