import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";

export function ReceiptButton({ filename }: { filename: string | null | undefined }) {
  const toast = useToast();
  if (!filename) return <span className="text-sand-300 dark:text-sand-600">—</span>;
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() =>
        toast.show({
          tone: "info",
          title: "Download started",
          description: `${filename} — this is a mock, no real file is generated yet.`,
        })
      }
    >
      <Icon name="download" className="h-4 w-4" />
      <span className="hidden sm:inline">Receipt</span>
    </Button>
  );
}
