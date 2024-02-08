import React, { Component } from "react";
import ErrorComponent from "./error-Component";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    const { hasError } = this.state;

    if (hasError) {
      return (
        <ErrorComponent
          apiError={{
            message: "Something went wrong!",
            action: () => {
              window.location.href = "/";
            },
            heading: "Oops",
          }}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
