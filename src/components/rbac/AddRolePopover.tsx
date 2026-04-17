import { useState } from "react";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ROLE_CATALOG, RoleName } from "./types";

interface AddRolePopoverProps {
  onAdd: (role: RoleName, extension: string) => void;
  size?: "sm" | "md";
}

export function AddRolePopover({ onAdd, size = "sm" }: AddRolePopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (role: RoleName, extension: string) => {
    onAdd(role, extension);
    setOpen(false);
  };

  const dim =
    size === "sm" ? "h-5 w-5 text-[11px]" : "h-7 w-7 text-sm";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Add role"
          className={`inline-flex ${dim} items-center justify-center rounded-md border border-border bg-surface-elevated text-muted-foreground transition hover:border-primary/40 hover:text-primary-foreground`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-0 bg-popover border-border"
      >
        <Command className="bg-popover">
          <CommandInput placeholder="Search role or extension..." className="h-9" />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            {(Object.keys(ROLE_CATALOG) as RoleName[]).map((role) => (
              <CommandGroup key={role} heading={role}>
                {ROLE_CATALOG[role].map((ext) => (
                  <CommandItem
                    key={`${role}-${ext}`}
                    value={`${role} ${ext}`}
                    onSelect={() => handleSelect(role, ext)}
                    className="cursor-pointer"
                  >
                    <span className="text-muted-foreground">{role}</span>
                    <span className="mx-1.5 text-muted-foreground/50">▸</span>
                    <span>{ext}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
