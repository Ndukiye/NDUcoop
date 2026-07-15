import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Icon } from "./Icon";
import { EmptyState } from "./EmptyState";
import { formatDateTime } from "../lib/format";
import { useAuthStore } from "../store/auth";
import { fetchMyNotifications } from "../features/shared/notifications";

const LAST_SEEN_KEY = "ndu:notifications-last-seen";
const CURRENT_MEMBER_ID = 1;

const toneDot: Record<string, string> = {
  success: "bg-pine-500",
  error: "bg-brick-500",
  info: "bg-gold-500",
};

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.role],
    queryFn: () => fetchMyNotifications(user?.role, CURRENT_MEMBER_ID),
    refetchInterval: 30_000,
  });

  const [lastSeen, setLastSeen] = useState(() => localStorage.getItem(LAST_SEEN_KEY) ?? "");
  const unreadCount = (notifications ?? []).filter((n) => n.date > lastSeen).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function markAllRead() {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_SEEN_KEY, now);
    setLastSeen(now);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-sand-500 hover:bg-sand-100 dark:text-sand-400 dark:hover:bg-sand-800"
        aria-label="Notifications"
      >
        <Icon name="bell" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brick-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-16 z-40 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-lifted dark:border-sand-800 dark:bg-sand-900 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-sand-100 px-4 py-3 dark:border-sand-800">
            <p className="text-sm font-semibold text-sand-900 dark:text-sand-50">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-pine-600 hover:underline dark:text-pine-400"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="p-4">
                <EmptyState title="You're all caught up" description="No notifications right now." />
              </div>
            ) : (
              notifications.map((n) => {
                const unread = n.date > lastSeen;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setOpen(false);
                      navigate(n.link);
                    }}
                    className="flex w-full items-start gap-3 border-b border-sand-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-sand-50 dark:border-sand-800 dark:hover:bg-sand-800/60"
                  >
                    <span
                      className={clsx(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        unread ? toneDot[n.tone] : "bg-transparent",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-sand-900 dark:text-sand-50">{n.title}</p>
                      <p className="mt-0.5 text-xs text-sand-500 dark:text-sand-400">{n.description}</p>
                      <p className="mt-1 text-[11px] text-sand-400 dark:text-sand-500">
                        {formatDateTime(n.date)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
