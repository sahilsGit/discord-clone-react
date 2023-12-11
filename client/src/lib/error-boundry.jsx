import React, { Component } from "react";
import ErrorHandler from "./error-handler";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError) {
      return <ErrorHandler error={error} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
