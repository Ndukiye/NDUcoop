import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Select } from "../../components/Select";
import { DataTable, type Column } from "../../components/Table";
import { StatusBadge } from "../../components/StatusBadge";
import { Avatar } from "../../components/Avatar";
import { Pagination } from "../../components/Pagination";
import { Icon } from "../../components/Icon";
import { CopyButton } from "../../components/CopyButton";
import { formatNaira } from "../../lib/format";
import type { MemberStatus } from "../../lib/types";
import { fetchMembers, type AdminMember } from "./api";
import { OnboardMemberModal } from "./OnboardMemberModal";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "RETIRED", label: "Retired" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "TERMINATED", label: "Terminated" },
];

export function MembersListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MemberStatus | "">("");
  const [page, setPage] = useState(1);
  const [onboardOpen, setOnboardOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["members", "admin", { search, status, page }],
    queryFn: () => fetchMembers({ search, status: status || undefined, page }),
  });

  const columns: Column<AdminMember>[] = [
    {
      key: "name",
      header: "Member",
      render: (m) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={m.first_name} lastName={m.last_name} size="sm" />
          <div>
            <p className="font-medium text-sand-900 dark:text-sand-50">
              {m.first_name} {m.last_name}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-sand-500 dark:text-sand-400">
              {m.membership_id}
              <CopyButton value={m.membership_id} />
            </p>
          </div>
        </div>
      ),
      sortAccessor: (m) => `${m.first_name} ${m.last_name}`,
    },
    {
      key: "department",
      header: "Department",
      render: (m) => m.department_unit,
      className: "hidden md:table-cell",
      sortAccessor: (m) => m.department_unit,
    },
    { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
    {
      key: "total_asset",
      header: "Total asset",
      render: (m) => formatNaira(m.total_asset),
      className: "text-right",
      sortAccessor: (m) => Number(m.total_asset),
    },
  ];

  const pageCount = data ? Math.max(1, Math.ceil(data.count / 10)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-sand-500 dark:text-sand-400">
            {data ? `${data.count} member${data.count === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <Button onClick={() => setOnboardOpen(true)}>
          <Icon name="plus" className="h-4 w-4" /> Onboard member
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
        <TextField
          label="Search"
          placeholder="Name, membership ID, or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as MemberStatus | "");
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.results ?? []}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        onRowClick={(m) => navigate(`/members/${m.id}`)}
        emptyState={{
          title: "No members found",
          description: "Try a different search term or status filter.",
        }}
      />
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />

      <OnboardMemberModal
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        onOnboarded={() => {
          setOnboardOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
