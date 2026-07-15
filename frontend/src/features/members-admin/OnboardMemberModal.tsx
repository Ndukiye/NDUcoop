import { type FormEvent, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { useToast } from "../../components/Toast";
import { onboardMember } from "./api";

export function OnboardMemberModal({
  open,
  onClose,
  onOnboarded,
}: {
  open: boolean;
  onClose: () => void;
  onOnboarded: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: onboardMember,
    onSuccess: (member) => {
      toast.show({
        tone: "success",
        title: "Member onboarded",
        description: `${member.first_name} ${member.last_name} (${member.membership_id}) was added.`,
      });
      formRef.current?.reset();
      onOnboarded();
    },
    onError: () => {
      toast.show({
        tone: "error",
        title: "Couldn't onboard member",
        description: "Please try again.",
      });
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    mutation.mutate({
      first_name: String(data.get("first_name") ?? ""),
      last_name: String(data.get("last_name") ?? ""),
      email: String(data.get("email") ?? ""),
      staff_number: String(data.get("staff_number") ?? ""),
      department_unit: String(data.get("department_unit") ?? ""),
      phone: String(data.get("phone") ?? ""),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Onboard a new member"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="onboard-member-form" loading={mutation.isPending}>
            Add member
          </Button>
        </>
      }
    >
      <form
        id="onboard-member-form"
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="First name" name="first_name" required />
          <TextField label="Last name" name="last_name" required />
        </div>
        <TextField label="Email address" name="email" type="email" required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Staff number" name="staff_number" required />
          <TextField label="Department / unit" name="department_unit" required />
        </div>
        <TextField label="Phone number" name="phone" required />
      </form>
    </Modal>
  );
}
