import { Badge } from "./Badge";

const statusMap: Record<string, { tone: "pine" | "gold" | "brick" | "sand"; label: string }> = {
  PENDING: { tone: "gold", label: "Pending" },
  PENDING_GUARANTORS: { tone: "gold", label: "Pending guarantors" },
  PENDING_ADMIN_APPROVAL: { tone: "gold", label: "Pending approval" },
  APPROVED: { tone: "pine", label: "Approved" },
  ACTIVE: { tone: "pine", label: "Active" },
  COMPLETED: { tone: "pine", label: "Completed" },
  ACCEPTED: { tone: "pine", label: "Accepted" },
  REJECTED: { tone: "brick", label: "Rejected" },
  DEFAULTED: { tone: "brick", label: "Defaulted" },
  SUSPENDED: { tone: "brick", label: "Suspended" },
  TERMINATED: { tone: "brick", label: "Terminated" },
  INACTIVE: { tone: "sand", label: "Inactive" },
  RETIRED: { tone: "sand", label: "Retired" },
  TOPPED_UP: { tone: "sand", label: "Topped up" },
};

export function StatusBadge({ status }: { status: string }) {
  const entry = statusMap[status] ?? { tone: "sand" as const, label: status };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
