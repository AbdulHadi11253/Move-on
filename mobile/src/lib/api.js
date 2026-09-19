const API_URL = process.env.EXPO_PUBLIC_API_URL;

// getToken is provided at call time from Clerk's useAuth() hook
export async function apiFetch(path, { method = "GET", body, formData, getToken } = {}) {
  const token = await getToken();

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (!formData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed with ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}
