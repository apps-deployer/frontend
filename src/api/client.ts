const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? "http://localhost:8001";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(
  base: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(`${base}${path}`, { ...options, headers });

  if (resp.status === 204) {
    return undefined as unknown as T;
  }

  if (!resp.ok) {
    let message = resp.statusText;
    try {
      const body = await resp.json();
      message = body.detail ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return resp.json() as Promise<T>;
}

export function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return request<T>(AUTH_URL, path, options);
}

export function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return request<T>(API_URL, path, options);
}
