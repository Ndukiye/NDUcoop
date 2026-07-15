import { useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../components/Card";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { CopyButton } from "../../components/CopyButton";
import { Modal } from "../../components/Modal";
import { TextField } from "../../components/TextField";
import { Textarea } from "../../components/Textarea";
import { DataTable, type Column } from "../../components/Table";
import { EmptyState } from "../../components/EmptyState";
import { useToast } from "../../components/Toast";
import { formatNaira, formatDate } from "../../lib/format";
import { useAuthStore } from "../../store/auth";
import { isFullAdmin } from "../../lib/roles";
import { fetchMember, fetchMemberLedger, setMemberStatus, editMember } from "./api";
import type { MockLedgerEntry } from "../../mocks/ledger";

const categoryLabels: Record<string, string> = {
  SHARES: "Shares",
  WELFARE: "Welfare",
  COMPULSORY_SAVINGS: "Compulsory savings",
  DEPOSIT: "Deposit",
  LOAN_DISBURSEMENT: "Loan disbursement",
  LOAN_REPAYMENT: "Loan repayment",
  COMMODITY_PAYMENT: "Commodity payment",
  OPENING_BALANCE: "Opening balance",
  OTHER: "Other",
};

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const memberId = Number(id);
  const currentUser = useAuthStore((s) => s.user);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState("");

  const { data: member, isLoading } = useQuery({
    queryKey: ["members", "admin", memberId],
    queryFn: () => fetchMember(memberId),
  });

  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ["members", "admin", memberId, "ledger"],
    queryFn: () => fetchMemberLedger(memberId),
  });

  const suspendMutation = useMutation({
    mutationFn: () => setMemberStatus(memberId, "SUSPENDED", suspendReason),
    onSuccess: () => {
      toast.show({ tone: "success", title: "Member suspended" });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setSuspendOpen(false);
      setSuspendReason("");
    },
  });

  const editMutation = useMutation({
    mutationFn: (input: { phone: string; department_unit: string; staff_number: string }) =>
      editMember(memberId, input),
    onSuccess: () => {
      toast.show({ tone: "success", title: "Member details updated" });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setEditOpen(false);
    },
  });

  function handleEditSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    editMutation.mutate({
      phone: String(data.get("phone") ?? ""),
      department_unit: String(data.get("department_unit") ?? ""),
      staff_number: String(data.get("staff_number") ?? ""),
    });
  }

  const columns: Column<MockLedgerEntry>[] = [
    {
      key: "date",
      header: "Date",
      render: (e) => formatDate(e.created_at),
      className: "whitespace-nowrap md:min-w-[9.5rem]",
      sortAccessor: (e) => Date.parse(e.created_at),
    },
    {
      key: "category",
      header: "Category",
      render: (e) => categoryLabels[e.category] ?? e.category,
      sortAccessor: (e) => categoryLabels[e.category] ?? e.category,
    },
    { key: "description", header: "Description", render: (e) => e.description, className: "hidden md:table-cell" },
    {
      key: "amount",
      header: "Amount",
      render: (e) => formatNaira(e.amount),
      className: "text-right",
      sortAccessor: (e) => Number(e.amount),
    },
    {
      key: "balance",
      header: "Balance after",
      render: (e) => formatNaira(e.running_balance_after),
      className: "hidden md:table-cell text-right",
      sortAccessor: (e) => Number(e.running_balance_after),
    },
  ];

  const ledgerRows = useMemo(() => {
    const rows = ledger ?? [];
    if (!ledgerSearch.trim()) return rows;
    const q = ledgerSearch.toLowerCase();
    return rows.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        (categoryLabels[e.category] ?? e.category).toLowerCase().includes(q),
    );
  }, [ledger, ledgerSearch]);

  if (!isLoading && !member) {
    return (
      <EmptyState
        title="Member not found"
        description="This member may have been removed."
        action={
          <Button variant="secondary" onClick={() => navigate("/members")}>
            Back to members
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate("/members")}
        className="flex items-center gap-1.5 text-sm font-medium text-sand-500 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-100"
      >
        <Icon name="chevron-down" className="h-4 w-4 rotate-90" />
        Back to members
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            firstName={member?.first_name}
            lastName={member?.last_name}
            size="lg"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-medium text-sand-900 dark:text-sand-50">
                {isLoading ? "Loading…" : `${member?.first_name} ${member?.last_name}`}
              </h2>
              {member && <StatusBadge status={member.status} />}
            </div>
            <p className="flex items-center gap-1.5 text-sm text-sand-500 dark:text-sand-400">
              {member?.membership_id}
              {member && <CopyButton value={member.membership_id} />}
              &middot; {member?.department_unit}
            </p>
          </div>
        </div>
        {isFullAdmin(currentUser?.role) && member && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Icon name="edit" className="h-4 w-4" /> Edit details
            </Button>
            {member.status === "ACTIVE" && (
              <Button variant="danger" onClick={() => setSuspendOpen(true)}>
                Suspend
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard
          label="Total assets"
          value={formatNaira(member?.total_asset ?? 0)}
          tone="accent"
          hint="Shares + Compulsory Savings + Deposits"
          className="col-span-2 lg:col-span-1"
        />
        <StatCard label="Shares" value={formatNaira(member?.shares_balance ?? 0)} />
        <StatCard
          label="Compulsory savings"
          value={formatNaira(member?.compulsory_savings_balance ?? 0)}
        />
        <StatCard label="Deposits" value={formatNaira(member?.deposit_balance ?? 0)} />
        <StatCard label="Welfare" value={formatNaira(member?.welfare_balance ?? 0)} />
      </div>

      <Card className="p-5">
        <p className="mb-4 text-sm font-medium text-sand-500 dark:text-sand-400">
          Contact &amp; bank details
        </p>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-sand-400">Email</dt>
            <dd className="text-sm text-sand-800 dark:text-sand-100">{member?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-400">Phone</dt>
            <dd className="text-sm text-sand-800 dark:text-sand-100">{member?.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-400">Staff number</dt>
            <dd className="text-sm text-sand-800 dark:text-sand-100">{member?.staff_number}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-400">Bank</dt>
            <dd className="text-sm text-sand-800 dark:text-sand-100">
              {member?.bank_name
                ? `${member.bank_name} · ${member.bank_account_name} · ${member.bank_account_number}`
                : "—"}
            </dd>
          </div>
        </dl>
      </Card>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-sand-500 dark:text-sand-400">Ledger history</p>
          <TextField
            label="Search"
            placeholder="Category or description"
            value={ledgerSearch}
            onChange={(e) => setLedgerSearch(e.target.value)}
            className="sm:w-64"
          />
        </div>
        <DataTable
          columns={columns}
          rows={ledgerRows}
          rowKey={(e) => e.id}
          isLoading={ledgerLoading}
          defaultSort={{ key: "date", dir: "desc" }}
          pageSize={10}
          emptyState={{
            title: "No ledger activity yet",
            description: "Contributions, deposits, and other transactions will appear here.",
          }}
        />
      </div>

      <Modal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title="Suspend member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!suspendReason.trim()}
              loading={suspendMutation.isPending}
              onClick={() => suspendMutation.mutate()}
            >
              Confirm suspension
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-sand-600 dark:text-sand-300">
            {member?.first_name} {member?.last_name} will remain on record but will be tagged as
            suspended. This is reversible by an admin later.
          </p>
          <Textarea
            label="Reason"
            required
            placeholder="Why this member is being suspended"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit member details"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-member-form" loading={editMutation.isPending}>
              Save changes
            </Button>
          </>
        }
      >
        {member && (
          <form id="edit-member-form" onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <TextField label="Phone" name="phone" defaultValue={member.phone} required />
            <TextField
              label="Department / unit"
              name="department_unit"
              defaultValue={member.department_unit}
              required
            />
            <TextField
              label="Staff number"
              name="staff_number"
              defaultValue={member.staff_number}
              required
            />
          </form>
        )}
      </Modal>
    </div>
  );
}
