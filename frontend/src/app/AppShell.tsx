import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";
import { Badge } from "../components/Badge";
import { Avatar } from "../components/Avatar";
import { NotificationsDropdown } from "../components/NotificationsDropdown";
import { useAuthStore } from "../store/auth";
import { roleLabel, isFullAdmin, isMember } from "../lib/roles";
import { visibleNavItems } from "./navigation";
import { logout } from "../features/auth/api";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const items = visibleNavItems(user?.role);
  const memberAccount = isMember(user?.role);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-2 pt-6">
        <Logo className="[&_span]:text-sand-50" />
      </div>

      <nav className="mt-6 flex-1 space-y-0.5 px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-pine-800 text-white"
                  : "text-pine-200/80 hover:bg-pine-800/60 hover:text-white",
              )
            }
          >
            <Icon name={item.icon} className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-pine-800 px-5 py-4">
        {memberAccount ? (
          <Link
            to="/profile"
            onClick={onNavigate}
            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-pine-800/60"
          >
            <Avatar firstName={user?.first_name} lastName={user?.last_name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs text-pine-300">View profile</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar firstName={user?.first_name} lastName={user?.last_name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs text-pine-300">{roleLabel(user?.role)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const location = useLocation();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => setUser(null),
  });

  const currentLabel = location.pathname.startsWith("/profile")
    ? "My profile"
    : (visibleNavItems(user?.role).find(
        (item) =>
          item.to === location.pathname || (item.to !== "/" && location.pathname.startsWith(item.to)),
      )?.label ?? "Dashboard");

  return (
    <div className="min-h-svh bg-sand-50 dark:bg-sand-950 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden bg-pine-950 lg:block">
        <div className="sticky top-0 h-svh">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-pine-950 shadow-lifted">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-pine-200 hover:bg-pine-800"
              aria-label="Close menu"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-sand-25/90 px-4 py-3.5 backdrop-blur dark:bg-sand-950/90 sm:px-6 relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-pine-400/70 via-gold-400/70 to-pine-400/70"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-md p-1.5 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800 lg:hidden"
              aria-label="Open menu"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold text-sand-900 dark:text-sand-50 sm:text-xl">
              {currentLabel}
            </h1>
            {user && isFullAdmin(user.role) === false && user.role !== "MEMBER" && (
              <Badge tone="sand">Read-only</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <button
              onClick={() => logoutMutation.mutate()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800"
            >
              <Icon name="logout" className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
