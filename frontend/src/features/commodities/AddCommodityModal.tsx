import { type FormEvent, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { useToast } from "../../components/Toast";
import { createCommodityType } from "./api";

export function AddCommodityModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCommodityType,
    onSuccess: (type) => {
      toast.show({
        tone: "success",
        title: "Commodity added",
        description: `${type.name} is now available for members to apply for.`,
      });
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      formRef.current?.reset();
      onClose();
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    mutation.mutate({
      name: String(data.get("name") ?? ""),
      unit: String(data.get("unit") ?? ""),
      cost_price: Number(data.get("cost_price") ?? 0).toFixed(2),
      selling_price: Number(data.get("selling_price") ?? 0).toFixed(2),
      current_stock_quantity: Number(data.get("stock") ?? 0),
      default_max_duration_months: Number(data.get("max_duration") ?? 6),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a commodity"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-commodity-form" loading={mutation.isPending}>
            Add to catalog
          </Button>
        </>
      }
    >
      <form
        id="add-commodity-form"
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Name" name="name" placeholder="e.g. Beans" required />
          <TextField label="Unit" name="unit" placeholder="e.g. 50kg bag" required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Cost price (₦)" name="cost_price" type="number" step="0.01" required />
          <TextField
            label="Selling price (₦)"
            name="selling_price"
            type="number"
            step="0.01"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Stock quantity" name="stock" type="number" min={0} required />
          <TextField
            label="Max duration (months)"
            name="max_duration"
            type="number"
            min={1}
            defaultValue={6}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
