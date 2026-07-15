import { type FormEvent, useRef } from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Textarea } from "../../components/Textarea";
import { FileInput } from "../../components/FileInput";
import { useToast } from "../../components/Toast";
import { CooperativeBankDetailsCard } from "./CooperativeBankDetailsCard";
import type { CooperativeAccountPurpose } from "../../mocks/cooperative";

export function RepaymentRequestModal({
  open,
  onClose,
  title,
  purpose,
  maxAmount,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  purpose: CooperativeAccountPurpose;
  maxAmount?: number;
  isSubmitting: boolean;
  onSubmit: (input: { amount: string; note: string; receiptFilename: string }) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const receipt = data.get("receipt") as File | null;
    if (!receipt || receipt.size === 0) {
      toast.show({
        tone: "error",
        title: "Receipt required",
        description: "Upload proof of your bank transfer before submitting.",
      });
      return;
    }
    onSubmit({
      amount: String(data.get("amount") ?? ""),
      note: String(data.get("note") ?? ""),
      receiptFilename: receipt.name,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="repayment-request-form" loading={isSubmitting}>
            Submit repayment
          </Button>
        </>
      }
    >
      <form
        id="repayment-request-form"
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <CooperativeBankDetailsCard purpose={purpose} />
        <TextField
          label="Repayment amount (₦)"
          name="amount"
          type="number"
          min="1"
          max={maxAmount}
          step="0.01"
          required
        />
        <p className="-mt-2 text-xs text-sand-400">Can be a full, partial, or early repayment.</p>
        <FileInput label="Receipt of bank transfer" name="receipt" required />
        <Textarea
          label="Note (optional)"
          name="note"
          placeholder="Any context for the admin reviewing this repayment"
        />
      </form>
    </Modal>
  );
}
