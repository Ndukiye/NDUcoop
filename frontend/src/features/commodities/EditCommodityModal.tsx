import { type FormEvent, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { useToast } from "../../components/Toast";
import { saveCommodityType } from "./api";
import type { MockCommodityType } from "../../mocks/commodities";

export function EditCommodityModal({
  type,
  onClose,
}: {
  type: MockCommodityType | null;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: {
      costPrice: string;
      sellingPrice: string;
      stock: number;
      maxDuration: number;
    }) =>
      saveCommodityType(type!.id, {
        cost_price: input.costPrice,
        selling_price: input.sellingPrice,
        current_stock_quantity: input.stock,
        default_max_duration_months: input.maxDuration,
      }),
    onSuccess: () => {
      toast.show({ tone: "success", title: "Commodity updated" });
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      onClose();
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    mutation.mutate({
      costPrice: String(data.get("cost_price") ?? "0"),
      sellingPrice: String(data.get("selling_price") ?? "0"),
      stock: Number(data.get("stock") ?? 0),
      maxDuration: Number(data.get("max_duration") ?? 6),
    });
  }

  return (
    <Modal
      open={!!type}
      onClose={onClose}
      title={type ? `Edit ${type.name}` : "Edit item"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-commodity-form" loading={mutation.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      {type && (
        <form
          id="edit-commodity-form"
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Cost price (₦)"
              name="cost_price"
              type="number"
              step="0.01"
              defaultValue={type.cost_price}
              required
            />
            <TextField
              label="Selling price (₦)"
              name="selling_price"
              type="number"
              step="0.01"
              defaultValue={type.selling_price}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Stock quantity"
              name="stock"
              type="number"
              defaultValue={type.current_stock_quantity}
              required
            />
            <TextField
              label="Max duration (months)"
              name="max_duration"
              type="number"
              defaultValue={type.default_max_duration_months}
              required
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
