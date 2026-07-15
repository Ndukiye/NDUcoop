import { type FormEvent, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Textarea } from "../../components/Textarea";
import { FileInput } from "../../components/FileInput";
import { useToast } from "../../components/Toast";
import { CooperativeBankDetailsCard } from "../shared/CooperativeBankDetailsCard";
import { createDepositRequest } from "./api";

export function RequestDepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createDepositRequest,
    onSuccess: () => {
      toast.show({
        tone: "success",
        title: "Deposit request submitted",
        description: "An admin will review it shortly.",
      });
      formRef.current?.reset();
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      onClose();
    },
  });

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
    mutation.mutate({
      amount: String(data.get("amount") ?? ""),
      note: String(data.get("note") ?? ""),
      receiptFilename: receipt.name,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Make a deposit"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="request-deposit-form" loading={mutation.isPending}>
            Submit request
          </Button>
        </>
      }
    >
      <form
        id="request-deposit-form"
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <CooperativeBankDetailsCard purpose="DEPOSITS" />
        <TextField label="Amount (₦)" name="amount" type="number" min="1" step="0.01" required />
        <FileInput label="Receipt of bank transfer" name="receipt" required />
        <Textarea
          label="Note (optional)"
          name="note"
          placeholder="Any context for the admin reviewing this request"
        />
      </form>
    </Modal>
  );
}
