import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../components/Card";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Select } from "../../components/Select";
import { StatusBadge } from "../../components/StatusBadge";
import { CopyButton } from "../../components/CopyButton";
import { useToast } from "../../components/Toast";
import { formatDate } from "../../lib/format";
import { fetchNigerianBanks } from "../../mocks/banks";
import { fetchMyFullProfile, updateMyBankDetails } from "./api";

export function ProfilePage() {
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [bankName, setBankName] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchMyFullProfile,
  });

  const { data: banks } = useQuery({
    queryKey: ["banks", "nigeria"],
    queryFn: fetchNigerianBanks,
  });

  const mutation = useMutation({
    mutationFn: updateMyBankDetails,
    onSuccess: () => {
      toast.show({ tone: "success", title: "Bank details updated" });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    mutation.mutate({
      bank_name: String(data.get("bank_name") ?? ""),
      bank_account_name: String(data.get("bank_account_name") ?? ""),
      bank_account_number: String(data.get("bank_account_number") ?? ""),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-sand-500 dark:text-sand-400">
          View your membership details and manage your bank account.
        </p>
      </div>

      <Card className="flex flex-wrap items-center gap-4 p-6">
        <Avatar firstName={profile?.first_name} lastName={profile?.last_name} size="lg" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-lg font-medium text-sand-900 dark:text-sand-50">
              {isLoading ? "Loading…" : `${profile?.first_name} ${profile?.last_name}`}
            </p>
            {profile && <StatusBadge status={profile.status} />}
          </div>
          {profile && (
            <p className="flex items-center gap-1.5 text-sm text-sand-500 dark:text-sand-400">
              {profile.membership_id}
              <CopyButton value={profile.membership_id} />
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <p className="mb-4 text-sm font-medium text-sand-500 dark:text-sand-400">
          Membership details
        </p>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-sand-400">Email</dt>
            <dd className="text-sand-800 dark:text-sand-100">{profile?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-400">Phone</dt>
            <dd className="text-sand-800 dark:text-sand-100">{profile?.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-400">Staff number</dt>
            <dd className="text-sand-800 dark:text-sand-100">{profile?.staff_number}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-400">Department / unit</dt>
            <dd className="text-sand-800 dark:text-sand-100">{profile?.department_unit}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-400">Member since</dt>
            <dd className="text-sand-800 dark:text-sand-100">
              {profile && formatDate(profile.date_joined)}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <p className="mb-1 text-sm font-medium text-sand-500 dark:text-sand-400">
          Bank account details
        </p>
        <p className="mb-4 text-xs text-sand-400">
          Used for loan disbursements and withdrawal payouts. Keep this up to date.
        </p>
        {profile ? (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 sm:max-w-md"
          >
            <Select
              label="Bank name"
              name="bank_name"
              value={bankName ?? profile.bank_name}
              onChange={(e) => setBankName(e.target.value)}
              options={[
                ...(profile.bank_name && !banks?.some((b) => b.name === profile.bank_name)
                  ? [{ value: profile.bank_name, label: profile.bank_name }]
                  : []),
                ...(banks ?? []).map((b) => ({ value: b.name, label: b.name })),
              ]}
              required
            />
            <TextField
              label="Account name"
              name="bank_account_name"
              defaultValue={profile.bank_account_name}
              required
            />
            <TextField
              label="Account number"
              name="bank_account_number"
              defaultValue={profile.bank_account_number}
              required
            />
            <Button type="submit" className="w-fit" loading={mutation.isPending}>
              Save changes
            </Button>
          </form>
        ) : (
          <div className="h-32 max-w-md animate-pulse rounded-lg bg-sand-100 dark:bg-sand-800" />
        )}
      </Card>
    </div>
  );
}
