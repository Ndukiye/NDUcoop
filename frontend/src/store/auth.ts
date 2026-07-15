import { create } from "zustand";
import type { Role } from "../lib/roles";

export interface CurrentUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
}

interface AuthState {
  user: CurrentUser | null;
  status: "unknown" | "authenticated" | "anonymous";
  setUser: (user: CurrentUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "unknown",
  setUser: (user) => set({ user, status: user ? "authenticated" : "anonymous" }),
}));
