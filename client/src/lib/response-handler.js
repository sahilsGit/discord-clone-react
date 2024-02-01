const handleResponse = async (response, authDispatch) => {
  // If response is ok
  if (response.ok) {
    if (response.headers.get("Content-Length") == 0) {
      return; // Return nothing if content is missing
    }

    // Else
    try {
      const data = await response.json(); // Parse the response

      // See if new token is received along with response
      if (data.newAccessToken) {
        authDispatch({
          type: "TOKEN_RECEIVED",
          payload: {
            access_token: data.newAccessToken,
            user: data.username,
            profileId: data.profileId,
            name: data.name,
            image: data.image,
            about: data.about,
          },
        });
      } // Update the token

      return data; // Return the data
    } catch (error) {
      // This error here is most probably a JSON error throw it
      throw new Error("Error parsing JSON response");
    }
    // If response is not okay i.e., Error
  } else {
    console.log(response.status);
    const parsedError = await response.json(); // Parse the error message

    console.log(response.status);

    // Construct a new error object for error handler
    const error = {
      status: response.status,
      message: parsedError.message,
    };

    return Promise.reject(error); // Reject the promise to be caught by outer catch block
  }
};

const handleError = (error, authDispatch) => {
  // Handle error based on their status codes

  switch (error.status) {
    // Un-authorized or un-authenticated request is suspicious, reset everything
    case 401 || 403:
      localStorage.clear();
      authDispatch({ type: "RESET_STATE" });
      return (window.location.href = "/");

    // TODO: Handle errors
    case 404:
      break;

    case error.status >= 400 && error.status < 500:
      break;

    case error.status >= 500:
      break;

    default:
      break;
  }

  // Return the error object for custom error handling within each component
  return {
    status: error.status,
    message: error.message,
  };
};

export { handleResponse, handleError };
