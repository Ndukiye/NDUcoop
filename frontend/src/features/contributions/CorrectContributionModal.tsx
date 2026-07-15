import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Textarea } from "../../components/Textarea";
import { Avatar } from "../../components/Avatar";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { lookupMemberByMembershipId, submitContributionCorrection } from "./api";
import type { MockContributionBatch } from "../../mocks/contributions";

export function CorrectContributionModal({
  batch,
  onClose,
}: {
  batch: MockContributionBatch | null;
  onClose: () => void;
}) {
  const [membershipId, setMembershipId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();

  const lookup = lookupMemberByMembershipId(membershipId);

  function resetAndClose() {
    setMembershipId("");
    setAmount("");
    setReason("");
    onClose();
  }

  const mutation = useMutation({
    mutationFn: () =>
      submitContributionCorrection({
        batchId: batch!.id,
        memberId: lookup.member!.id,
        amount: Number(amount),
        reason,
      }),
    onSuccess: () => {
      toast.show({
        tone: "success",
        title: "Contribution corrected",
        description: `${lookup.member?.first_name} ${lookup.member?.last_name}'s ${batch?.month} contribution was adjusted.`,
      });
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      resetAndClose();
    },
  });

  const canSubmit =
    !!lookup.member && amount.trim() !== "" && Number(amount) !== 0 && reason.trim() !== "";

  return (
    <Modal
      open={!!batch}
      onClose={resetAndClose}
      title={batch ? `Correct a contribution — ${batch.month}` : "Correct a contribution"}
      footer={
        <>
          <Button variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Apply correction
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Member membership ID"
          placeholder="e.g. NDU-0007"
          value={membershipId}
          onChange={(e) => setMembershipId(e.target.value)}
          error={lookup.error}
        />
        {lookup.member && (
          <div className="flex items-center gap-2.5 rounded-lg border border-pine-200 bg-pine-50 px-3 py-2 dark:border-pine-800 dark:bg-pine-950/30">
            <Avatar
              firstName={lookup.member.first_name}
              lastName={lookup.member.last_name}
              size="sm"
            />
            <p className="text-sm font-medium text-pine-800 dark:text-pine-200">
              {lookup.member.first_name} {lookup.member.last_name}
            </p>
            <Icon name="check" className="ml-auto h-4 w-4 text-pine-600 dark:text-pine-400" />
          </div>
        )}
        <TextField
          label="Adjustment amount (₦)"
          type="number"
          step="0.01"
          placeholder="Positive to add, negative to subtract"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Textarea
          label="Reason"
          required
          placeholder="Why this correction is needed"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
}
