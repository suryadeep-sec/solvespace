const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getStoredToken() {
  return localStorage.getItem("solvespace-token");
}

export function getStoredUserRole() {
  return localStorage.getItem("solvespace-role") || "student";
}

export function setStoredToken(token) {
  localStorage.setItem("solvespace-token", token);
}

export function setStoredUserRole(role) {
  if (!role) {
    localStorage.removeItem("solvespace-role");
    return;
  }

  localStorage.setItem("solvespace-role", role);
}

export function clearStoredToken() {
  localStorage.removeItem("solvespace-token");
  localStorage.removeItem("solvespace-role");
}

export function clearStoredUserRole() {
  localStorage.removeItem("solvespace-role");
}

export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers = {} } = options;
  const token = getStoredToken();

  const requestHeaders = {
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && payload.message) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function apiDownload(endpoint, filename) {
  const headers = {};
  const token = getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    const message =
      (payload && typeof payload === "object" && payload.message) ||
      `Download failed with status ${response.status}`;
    throw new Error(message);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
