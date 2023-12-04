const handleResponse = async (response, authDispatch, serverDispatch) => {
  // Success responses
  if (response.ok) {
    try {
      const data = await response.json();

      // console.log("INSIDE RESPONSE HANDLER");

      if (data.newAccessToken) {
        authDispatch({
          type: "TOKEN_RECEIVED",
          payload: {
            access_token: data.newAccessToken,
            user: data.username,
            profileId: data.profileId,
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

const handleError = (error, serverDispatch) => {
  console.log("handle error triggered", error);
  switch (error.status) {
    case 401:
      localStorage.clear();
      break;

    case 403:
      localStorage.clear();
      break;

    case 404:
      break;

    case error.status >= 400 && error.status < 500:
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

  console.log("returning err with status", error.status);
  return error.status;
};

export { handleResponse, handleError };
