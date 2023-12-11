import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorHandler = ({ error }) => {
  const navigate = useNavigate();

  // Handle errors as needed
  switch (error.status) {
    default:
      // Handle other unanticipated errors
      return <div>An unexpected error occurred. Please try again later.</div>;
  }
};

export default ErrorHandler;
