const API_URL = process.env.EXPO_PUBLIC_API_URL;

// getToken is provided at call time from Clerk's useAuth() hook
export async function apiFetch(path, { method = "GET", body, formData, getToken, skipTokenCache = false } = {}) {
  const token = await getToken(skipTokenCache ? { skipCache: true } : undefined);

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
    const err = new Error(errBody.error || `Request failed with ${res.status}`);
    err.status = res.status;
    // A 401 with no token attached just means "not signed in yet" (e.g. a
    // query that fires before sign-in completes) — expected, not a stale
    // session. Only a 401 on a request that DID carry a token means the
    // server actually rejected an existing session.
    err.hadToken = !!token;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

// For endpoints that must work before sign-in (e.g. onboarding questions).
export async function publicFetch(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed with ${res.status}`);
  return res.json();
}
