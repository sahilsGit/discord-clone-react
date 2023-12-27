const BASE_URL = process.env.REACT_APP_BASE;

// Your main stream GET request
export async function get(
  endpoint,
  token = null,
  headers = {
    "Content-Type": "application/json",
  },
  options = { credentials: "include" }
) {
  const url = `${BASE_URL}${endpoint}`;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

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

// POST Request
export async function post(
  endpoint,
  body,
  token = null,
  headers = {
    "Content-Type": "application/json",
  },
  options = { credentials: "include" }
) {
  const url = `${BASE_URL}${endpoint}`;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

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

// UPDATE Request
export async function update(
  endpoint,
  body,
  token = null,
  headers = {
    "Content-Type": "application/json",
  },
  options = { credentials: "include" }
) {
  const url = `${BASE_URL}${endpoint}`;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "PUT", // or "PATCH" depending on your API
      headers,
      body: JSON.stringify(body),
      ...options,
    });

    return response;
  } catch (error) {
    throw error;
  }
}

// DELETE Request
export async function remove(
  endpoint,
  token = null,
  headers = {
    "Content-Type": "application/json",
  },
  options = { credentials: "include" }
) {
  const url = `${BASE_URL}${endpoint}`;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
      ...options,
    });

    return response;
  } catch (error) {
    throw error;
  }
}
