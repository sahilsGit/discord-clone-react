const handleResponse = async (response, dispatch) => {
  // Success responses
  if (response.ok) {
    const data = await response.json();

    if (data.newAccessToken) {
      dispatch({
        type: "TOKEN_REFRESHED",
        payload: {
          access_token: data.newAccessToken,
          user: data.username,
        },
      });
    }
    return data;
  } else {
    // Handle errors
    const error = {
      status: response.status,
      message: response.statusText,
    };

    return Promise.reject(error);
  }
};

const handleError = (error) => {
  switch (error.status) {
    case 401:
      alert("Unauthorized (401)");
      break;

    case 403:
      alert("Forbidden (403)");
      // Handle forbidden access, e.g., show a message or redirect to an error page
      break;

    case error.status >= 400 && error.status < 500:
      alert(`Client Error (${error.status}): ${error.message}`);
      // Handle other client-side errors, e.g., display an error message to the user
      break;

    case error.status >= 500:
      alert(`Server Error (${error.status})`);
      // Handle server errors, e.g., display a generic server error message
      // Example: showToast('Server Error: Please try again later');
      break;

    default:
      alert("Unexpected Error");
      // Handle other unanticipated errors
      // Example: showToast('An unexpected error occurred');
      break;
  }
  return Promise.reject(error);
};

export { handleResponse, handleError };
