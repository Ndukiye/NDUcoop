import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { fetchCooperativeAccounts, saveCooperativeAccount } from "./api";
import { EditCooperativeAccountModal } from "./EditCooperativeAccountModal";
import type { MockCooperativeAccount } from "../../mocks/cooperative";

export function SettingsPage() {
  const [editing, setEditing] = useState<MockCooperativeAccount | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["settings", "cooperative-accounts"],
    queryFn: fetchCooperativeAccounts,
  });

  const mutation = useMutation({
    mutationFn: (input: {
      id: number;
      bank_name: string;
      account_name: string;
      account_number: string;
    }) => saveCooperativeAccount(input.id, input),
    onSuccess: () => {
      toast.show({ tone: "success", title: "Cooperative account updated" });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setEditing(null);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-sand-500 dark:text-sand-400">
          Manage the cooperative's bank accounts shown to members when they transfer money. Each
          workflow (deposits, loan repayments, commodity repayments) can use its own account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-44 animate-pulse" />
            ))
          : accounts?.map((acct) => (
              <Card key={acct.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-medium text-sand-900 dark:text-sand-50">
                    {acct.label}
                  </h3>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(acct)}>
                    <Icon name="edit" className="h-4 w-4" /> Edit
                  </Button>
                </div>
                <dl className="flex flex-col gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-sand-400">Bank</dt>
                    <dd className="text-sand-800 dark:text-sand-100">{acct.bank_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-sand-400">Account name</dt>
                    <dd className="text-sand-800 dark:text-sand-100">{acct.account_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-sand-400">Account number</dt>
                    <dd className="font-medium text-sand-800 dark:text-sand-100">
                      {acct.account_number}
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
      </div>

      <EditCooperativeAccountModal
        account={editing}
        onClose={() => setEditing(null)}
        onSave={(input) => mutation.mutate(input)}
        isSaving={mutation.isPending}
      />
    </div>
  );
}
