import { cn } from "@/lib/utils";
import { RoleName } from "./types";

const ROLE_STYLES: Record<RoleName, string> = {
  Admin: "bg-[hsl(222_47%_96%)] text-[hsl(222_47%_25%)] border-[hsl(222_30%_85%)]",
  Editor: "bg-[hsl(210_60%_96%)] text-[hsl(210_70%_30%)] border-[hsl(210_50%_85%)]",
  Viewer: "bg-[hsl(150_40%_95%)] text-[hsl(150_50%_25%)] border-[hsl(150_30%_82%)]",
  Billing: "bg-[hsl(35_80%_95%)] text-[hsl(28_70%_30%)] border-[hsl(35_60%_82%)]",
  Support: "bg-[hsl(280_40%_96%)] text-[hsl(280_50%_30%)] border-[hsl(280_30%_85%)]",
};

interface RoleChipProps {
  role: RoleName;
  size?: "sm" | "md";
}

export function RoleChip({ role, size = "sm" }: RoleChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs",
        ROLE_STYLES[role],
      )}
    >
      {role}
    </span>
  );
}
