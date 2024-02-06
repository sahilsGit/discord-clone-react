const handleResponse = async (response, authDispatch) => {
  try {
    let data = await response.json(); // Parse the response

    if (response.ok) {
      /*
       *
       * If Response is okay
       *
       */

      // Return empty-handed if content is missing
      if (response.headers.get("Content-Length") == 0) {
        return;
      }

      // See if new access_token is received
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
        }); // Update the token

        // Filter the newAccessToken out as other components don't need it
        delete data.newAccessToken;
      }

      // Finally return the api specific data
      return data;

      // If response is not okay i.e., Error
    } else {
      // Construct a new error object for error handler
      const error = {
        status: response.status,
        message: data.message,
      };

      return Promise.reject(error); // Reject the promise to be caught by outer catch block
    }
  } catch (error) {
    // This error here is most probably a JSON error throw it
    throw new Error("Something went wrong!");
  }
};

const handleError = (error, authDispatch) => {
  // Handle error based on their status codes

  if (!error?.status) {
    error.status = 500;
  }

  if (error.status === 401 || error.status === 403) {
    // Un-authorized or un-authenticated request is suspicious, reset everything
    localStorage.clear();
    authDispatch({ type: "RESET_STATE" });

    return (window.location.href = "/");
  }

  // Return the error object for custom error handling within each component
  return {
    status: error.status,
    message: error.message,
  };
};

export { handleResponse, handleError };
