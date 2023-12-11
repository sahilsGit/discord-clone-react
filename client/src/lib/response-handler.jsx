const handleResponse = async (response, authDispatch) => {
  // Success responses
  if (response.ok) {
    try {
      const data = await response.json();

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

const handleError = (error, authDispatch) => {
  console.log("handle error triggered", error);
  switch (error.status) {
    case 401 || 403:
      localStorage.clear();
      authDispatch({ type: "RESET_STATE" });
      window.location.href = "/";
      break;

    case 404:
      break;

    case error.status >= 400 && error.status < 500:
      break;

    case error.status >= 500:
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
