import { type FormEvent, useRef } from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import type { MockCooperativeAccount } from "../../mocks/cooperative";

export function EditCooperativeAccountModal({
  account,
  onClose,
  onSave,
  isSaving,
}: {
  account: MockCooperativeAccount | null;
  onClose: () => void;
  onSave: (input: { id: number; bank_name: string; account_name: string; account_number: string }) => void;
  isSaving: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!account) return;
    const data = new FormData(e.currentTarget);
    onSave({
      id: account.id,
      bank_name: String(data.get("bank_name") ?? ""),
      account_name: String(data.get("account_name") ?? ""),
      account_number: String(data.get("account_number") ?? ""),
    });
  }

  return (
    <Modal
      open={!!account}
      onClose={onClose}
      title={account ? `Edit ${account.label.toLowerCase()} account` : "Edit account"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-cooperative-account-form" loading={isSaving}>
            Save changes
          </Button>
        </>
      }
    >
      {account && (
        <form
          id="edit-cooperative-account-form"
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <TextField label="Bank name" name="bank_name" defaultValue={account.bank_name} required />
          <TextField
            label="Account name"
            name="account_name"
            defaultValue={account.account_name}
            required
          />
          <TextField
            label="Account number"
            name="account_number"
            defaultValue={account.account_number}
            required
          />
        </form>
      )}
    </Modal>
  );
}
