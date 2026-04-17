import { X } from "lucide-react";
import { Assignment } from "./types";
import { cn } from "@/lib/utils";

interface RoleChipProps {
  assignment: Assignment;
  onRemove?: (id: string) => void;
}

export function RoleChip({ assignment, onRemove }: RoleChipProps) {
  return (
    <span
      className={cn(
        "group inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary-foreground/90",
      )}
    >
      <span className="text-primary-foreground/70">{assignment.role}</span>
      <span className="text-primary-foreground/40">▸</span>
      <span>{assignment.extension}</span>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(assignment.id)}
          className="ml-0.5 rounded text-primary-foreground/50 opacity-0 transition group-hover:opacity-100 hover:text-primary-foreground"
          aria-label={`Remove ${assignment.role} ${assignment.extension}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
