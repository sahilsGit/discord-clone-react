const BASE_URL = "http://localhost:4000/api";

// Your main stream GET request
export async function get(endpoint, headers, options) {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      ...options,
    });

    return response;
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

    return response;
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

    return response;
  } catch (error) {
    throw error;
  }
}
