const handleResponse = async (response, authDispatch) => {
  if (response.ok) {
    const contentLength = response.headers.get("Content-Length");

    if (contentLength == 0) {
      return;
    }

    try {
      const data = await response.json();

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
      }

      return data;
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
    }
  } else {
    // Handle errors
    const error = {
      status: response.status,
      message: response.data,
    };

    return Promise.reject(error);
  }
};

const handleError = (error, authDispatch) => {
  switch (error.status) {
    case 401 || 403:
      localStorage.clear();
      authDispatch({ type: "RESET_STATE" });
      console.log("error", error);
      window.location.href = "/";
      break;

    case 404:
      console.log("error", error);
      // window.location.href = "/@me/conversations";
      break;

    case error.status >= 400 && error.status < 500:
      break;

    case error.status >= 500:
      break;

    default:
      break;
  }

  return error.status;
};

export { handleResponse, handleError };
