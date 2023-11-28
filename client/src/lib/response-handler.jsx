const handleResponse = async (response, dispatch) => {
  // Success responses
  if (response.ok) {
    try {
      const data = await response.json();

      console.log("INSIDE RESPONSE HANDLER");

      if (data.newAccessToken) {
        dispatch({
          type: "TOKEN_RECEIVED",
          payload: {
            access_token: data.newAccessToken,
            user: data.username,
          },
        });
      }

      return data;
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
    }
  } else {
    // Handle errors
    const error = {
      status: response.status,
      message: response.message,
    };

    return Promise.reject(error);
  }
};

const handleError = (error) => {
  switch (error.status) {
    case 401:
      alert("Unauthorized (401)");
      localStorage.clear();
      break;

    case 403:
      alert("Forbidden (403)");
      localStorage.clear();
      break;

    case error.status >= 400 && error.status < 500:
      // Handle other client-side errors, e.g., display an error message to the user
      break;

    case error.status >= 500:
      // Handle server errors, e.g., display a generic server error message
      // Example: showToast('Server Error: Please try again later');
      break;

    default:
      // Handle other unanticipated errors
      // Example: showToast('An unexpected error occurred');
      break;
  }
  return;
};

export { handleResponse, handleError };
