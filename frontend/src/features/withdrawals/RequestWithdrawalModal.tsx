import { type FormEvent, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Select } from "../../components/Select";
import { Textarea } from "../../components/Textarea";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { formatNaira } from "../../lib/format";
import { fetchNigerianBanks } from "../../mocks/banks";
import { fetchMyFullProfile } from "../profile/api";
import { createWithdrawalRequest, fetchWithdrawalEligibility, CURRENT_MEMBER_ID } from "./api";

export function RequestWithdrawalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [bankName, setBankName] = useState<string | null>(null);

  const { data: eligibility } = useQuery({
    queryKey: ["withdrawals", "eligibility", CURRENT_MEMBER_ID],
    queryFn: () => fetchWithdrawalEligibility(CURRENT_MEMBER_ID),
    enabled: open,
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchMyFullProfile,
    enabled: open,
  });
  const { data: banks } = useQuery({
    queryKey: ["banks", "nigeria"],
    queryFn: fetchNigerianBanks,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: createWithdrawalRequest,
    onSuccess: () => {
      toast.show({
        tone: "success",
        title: "Withdrawal request submitted",
        description: "An admin will review it shortly.",
      });
      formRef.current?.reset();
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      onClose();
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (eligibility && !eligibility.eligible) return;
    const data = new FormData(e.currentTarget);
    mutation.mutate({
      amount: String(data.get("amount") ?? ""),
      note: String(data.get("note") ?? ""),
      payoutBankName: String(data.get("payout_bank_name") ?? ""),
      payoutAccountName: String(data.get("payout_account_name") ?? ""),
      payoutAccountNumber: String(data.get("payout_account_number") ?? ""),
    });
  }

  const blocked = eligibility && !eligibility.eligible;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for a withdrawal"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="request-withdrawal-form"
            loading={mutation.isPending}
            disabled={blocked}
          >
            Submit request
          </Button>
        </>
      }
    >
      <div
        className={
          blocked
            ? "mb-4 flex items-start gap-2.5 rounded-lg border border-brick-100 bg-brick-50 px-3.5 py-3 text-sm text-brick-700 dark:border-brick-700/50 dark:bg-brick-500/10 dark:text-brick-300"
            : "mb-4 flex items-start gap-2.5 rounded-lg border border-gold-200 bg-gold-50 px-3.5 py-3 text-sm text-gold-800 dark:border-gold-800/50 dark:bg-gold-900/20 dark:text-gold-200"
        }
      >
        <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
        {!eligibility ? (
          <span>Checking your eligibility…</span>
        ) : blocked ? (
          <span>
            You have an active loan with an outstanding balance of{" "}
            <strong className="font-semibold">{formatNaira(eligibility.outstandingLoanBalance)}</strong>,
            which is not less than your total asset of{" "}
            <strong className="font-semibold">{formatNaira(eligibility.totalAsset)}</strong>. You're
            not eligible to withdraw until that changes.
          </span>
        ) : (
          <span>
            You can withdraw up to{" "}
            <strong className="font-semibold">{formatNaira(eligibility.cap)}</strong>
            {eligibility.hasActiveLoan
              ? " — lower than usual because you have an active loan. Withdrawing more than this could leave your loan without enough of your balance backing it."
              : " based on your current deposit balance."}
          </span>
        )}
      </div>
      {profile ? (
        <form
          id="request-withdrawal-form"
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <TextField
            label="Amount (₦)"
            name="amount"
            type="number"
            min="1"
            max={eligibility?.cap}
            step="0.01"
            required
            disabled={blocked}
          />
          <Select
            label="Payout bank"
            name="payout_bank_name"
            value={bankName ?? profile.bank_name}
            onChange={(e) => setBankName(e.target.value)}
            options={[
              ...(profile.bank_name && !banks?.some((b) => b.name === profile.bank_name)
                ? [{ value: profile.bank_name, label: profile.bank_name }]
                : []),
              ...(banks ?? []).map((b) => ({ value: b.name, label: b.name })),
            ]}
            required
            disabled={blocked}
          />
          <TextField
            label="Payout account name"
            name="payout_account_name"
            defaultValue={profile.bank_account_name}
            required
            disabled={blocked}
          />
          <TextField
            label="Payout account number"
            name="payout_account_number"
            defaultValue={profile.bank_account_number}
            required
            disabled={blocked}
          />
          <p className="-mt-2 text-xs text-sand-400">
            Defaults to the account on your profile — confirm it or edit it for this request.
          </p>
          <Textarea
            label="Note (optional)"
            name="note"
            placeholder="Any context for the admin reviewing this request"
            disabled={blocked}
          />
        </form>
      ) : (
        <div className="h-40 animate-pulse rounded-lg bg-sand-100 dark:bg-sand-800" />
      )}
    </Modal>
  );
}
