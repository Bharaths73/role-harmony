import { AddRolePopover } from "./AddRolePopover";
import { RoleName } from "./types";
import { X } from "lucide-react";

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  onBulkAdd: (role: RoleName, extension: string) => void;
}

export function BulkActionBar({ count, onClear, onBulkAdd }: BulkActionBarProps) {
  if (count === 0) return null;
  return (
    <div className="sticky bottom-4 z-20 mt-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/15 px-4 py-2.5 text-sm text-primary-foreground shadow-lg backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="font-medium">{count} user{count > 1 ? "s" : ""} selected</span>
        <span className="text-primary-foreground/60">·</span>
        <span className="text-primary-foreground/70">Apply to all selected</span>
      </div>
      <div className="flex items-center gap-2">
        <AddRolePopover onAdd={onBulkAdd} size="md" />
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-md border border-primary/30 px-2.5 py-1 text-xs text-primary-foreground/80 hover:bg-primary/20"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      </div>
    </div>
  );
}
