import axios from "axios";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const token = getCookie("csrftoken");
    if (token) {
      config.headers.set("X-CSRFToken", token);
    }
  }
  return config;
});

export async function ensureCsrfCookie() {
  if (!getCookie("csrftoken")) {
    await api.get("/auth/csrf/");
  }
}
