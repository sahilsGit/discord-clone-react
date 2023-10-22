const BASE_URL = "http://localhost:4000/api";

// Helper function to handle response data and errors
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
}

// Your main stream GET request
export async function get(endpoint, headers, options) {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      ...options,
    });

    return handleResponse(response);
  } catch (error) {
    throw error;
  }
}

// POST
export async function post(endpoint, body, headers, options) {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body,
      ...options,
    });

    return handleResponse(response);
  } catch (error) {
    throw error;
  }
}

// DELETE
export async function del(endpoint) {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    return handleResponse(response);
  } catch (error) {
    throw error;
  }
}
