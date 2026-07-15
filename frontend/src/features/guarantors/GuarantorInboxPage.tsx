import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/Icon";
import { EmptyState } from "../../components/EmptyState";
import { useToast } from "../../components/Toast";
import { formatNaira } from "../../lib/format";
import {
  fetchMyGuarantorRequests,
  respondToGuarantorRequestApi,
  type GuarantorRequestWithDetail,
} from "./api";

export function GuarantorInboxPage() {
  const [confirming, setConfirming] = useState<GuarantorRequestWithDetail | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["guarantors", "mine"],
    queryFn: fetchMyGuarantorRequests,
  });

  const mutation = useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      respondToGuarantorRequestApi(id, accept),
    onSuccess: (_, vars) => {
      toast.show({
        tone: vars.accept ? "success" : "info",
        title: vars.accept ? "You accepted the guarantor request" : "You declined the guarantor request",
      });
      queryClient.invalidateQueries({ queryKey: ["guarantors"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      setConfirming(null);
    },
  });

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-sand-100 dark:bg-sand-800" />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No guarantor requests"
        description="When another member asks you to guarantee their loan, it will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((req) => (
        <Card key={req.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="font-medium text-sand-900 dark:text-sand-50">{req.applicant_name}</p>
            <p className="text-sm text-sand-500 dark:text-sand-400">
              {req.product_name} &middot; {formatNaira(req.principal)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => mutation.mutate({ id: req.id, accept: false })}
            >
              Decline
            </Button>
            <Button size="sm" onClick={() => setConfirming(req)}>
              Accept
            </Button>
          </div>
        </Card>
      ))}

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title="Accept guarantor request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button
              loading={mutation.isPending}
              onClick={() => confirming && mutation.mutate({ id: confirming.id, accept: true })}
            >
              Confirm acceptance
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-2.5 rounded-lg border border-gold-200 bg-gold-50 px-3.5 py-3 text-sm text-gold-800 dark:border-gold-800/50 dark:bg-gold-900/20 dark:text-gold-200">
          <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Guaranteeing this loan will lock your ability to withdraw for 45 minutes after you
            confirm, while the request is finalized.
          </span>
        </div>
      </Modal>
    </div>
  );
}
