import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";

/**
 * For system-generated receipts (loan disbursement, withdrawal payout, etc.)
 * as opposed to `ReceiptButton`, which surfaces a member-uploaded file.
 */
export function GenerateReceiptButton({
  label = "Receipt",
  iconOnlyOnMobile = true,
}: {
  label?: string;
  iconOnlyOnMobile?: boolean;
}) {
  const toast = useToast();
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() =>
        toast.show({
          tone: "info",
          title: "Download started",
          description: "This is a mock — no real file is generated yet.",
        })
      }
    >
      <Icon name="download" className="h-4 w-4" />
      <span className={iconOnlyOnMobile ? "hidden sm:inline" : undefined}>{label}</span>
    </Button>
  );
}
