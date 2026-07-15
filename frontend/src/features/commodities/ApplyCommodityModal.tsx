import { type FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Select } from "../../components/Select";
import { useToast } from "../../components/Toast";
import { formatNaira } from "../../lib/format";
import type { MockCommodityType } from "../../mocks/commodities";
import { applyForCommodity } from "./api";

export function ApplyCommodityModal({
  type,
  onClose,
}: {
  type: MockCommodityType | null;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(type?.default_max_duration_months ?? 6);
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: applyForCommodity,
    onSuccess: () => {
      toast.show({
        tone: "success",
        title: "Application submitted",
        description: "An admin will review your commodity request.",
      });
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      onClose();
    },
  });

  const total = type ? Number(type.selling_price) * quantity : 0;
  const monthly = duration > 0 ? total / duration : 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!type) return;
    mutation.mutate({ commodityTypeId: type.id, quantity, durationMonths: duration });
  }

  const durationOptions = Array.from(
    { length: type?.default_max_duration_months ?? 6 },
    (_, i) => ({
      value: String(i + 1),
      label: `${i + 1} month${i === 0 ? "" : "s"}`,
    }),
  );

  return (
    <Modal
      open={!!type}
      onClose={onClose}
      title={type ? `Apply for ${type.name}` : "Apply"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="apply-commodity-form" loading={mutation.isPending}>
            Submit application
          </Button>
        </>
      }
    >
      {type && (
        <form
          id="apply-commodity-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <TextField
            label={`Quantity (${type.unit})`}
            type="number"
            min={1}
            max={type.current_stock_quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          <Select
            label="Repayment duration"
            options={durationOptions}
            value={String(duration)}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
          <div className="rounded-lg border border-sand-200 bg-sand-50 p-4 text-sm dark:border-sand-700 dark:bg-sand-800">
            <div className="flex justify-between">
              <span className="text-sand-500 dark:text-sand-400">Total cost</span>
              <span className="font-medium text-sand-900 dark:text-sand-50">
                {formatNaira(total)}
              </span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-sand-500 dark:text-sand-400">Monthly repayment</span>
              <span className="font-medium text-sand-900 dark:text-sand-50">
                {formatNaira(monthly)}
              </span>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
