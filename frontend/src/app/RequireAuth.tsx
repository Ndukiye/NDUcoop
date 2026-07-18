import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { fetchCurrentUser } from "../features/auth/api";

export function RequireAuth() {
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isFetched } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    enabled: status === "unknown",
    retry: false,
  });

  useEffect(() => {
    // Only resolve the session while it is still undetermined. Without this
    // guard, remounting after a successful login replays the pre-login
    // cached "no user" result and bounces the user straight back to /login.
    if (isFetched && status === "unknown") setUser(data ?? null);
  }, [isFetched, data, setUser, status]);

  if (status === "unknown") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-sand-50 dark:bg-sand-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine-600 border-t-transparent" />
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
