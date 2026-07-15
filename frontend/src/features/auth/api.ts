import { api, ensureCsrfCookie } from "../../lib/api";
import type { CurrentUser } from "../../store/auth";

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const { data } = await api.get<CurrentUser>("/auth/me/");
    return data;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<CurrentUser> {
  await ensureCsrfCookie();
  const { data } = await api.post<CurrentUser>("/auth/login/", { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout/");
}
