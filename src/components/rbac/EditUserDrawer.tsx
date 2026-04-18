import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mail, Info, ChevronDown, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  EXTENSIONS,
  EXTENSION_GROUP_ORDER,
  ExtensionDef,
  ExtensionGroup,
  ROLES,
  RoleName,
  User,
  getAllowedExtensions,
} from "./types";
import { RoleChip } from "./RoleChip";
import { cn } from "@/lib/utils";

interface EditUserDrawerProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, roles: RoleName[], extensions: string[]) => void;
}

export function EditUserDrawer({ user, open, onOpenChange, onSave }: EditUserDrawerProps) {
  const [roles, setRoles] = useState<RoleName[]>([]);
  const [extensions, setExtensions] = useState<string[]>([]);
  const { toast } = useToast();

  // Pre-fill on open
  useEffect(() => {
    if (user && open) {
      setRoles(user.roles);
      setExtensions(user.extensions);
    }
  }, [user, open]);

  const allowed = useMemo(() => getAllowedExtensions(roles), [roles]);
  const allowedIds = useMemo(() => new Set(allowed.map((e) => e.id)), [allowed]);

  // Prune extensions when roles change — keep only still-valid ones
  useEffect(() => {
    setExtensions((prev) => prev.filter((id) => allowedIds.has(id)));
  }, [allowedIds]);

  // Per-role grouping: each selected role gets its own block, with its own type sections.
  // Lazy: only computed when roles change.
  const perRoleGroups = useMemo(() => {
    return roles.map((role) => {
      const roleExts = EXTENSIONS.filter((e) => e.roles.includes(role));
      const byGroup = {} as Record<ExtensionGroup, ExtensionDef[]>;
      EXTENSION_GROUP_ORDER.forEach((g) => {
        const items = roleExts.filter((e) => e.group === g);
        if (items.length > 0) byGroup[g] = items;
      });
      return { role, byGroup };
    });
  }, [roles]);

  const toggleRole = (role: RoleName) =>
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));

  const toggleExtension = (id: string) =>
    setExtensions((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const handleSave = () => {
    if (!user) return;
    onSave(user.id, roles, extensions);
    toast({
      title: "Access updated",
      description: `${user.name} · ${roles.length} role${roles.length === 1 ? "" : "s"}, ${extensions.length} extension${extensions.length === 1 ? "" : "s"}.`,
    });
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] flex flex-col gap-0 p-0 bg-background"
      >
        {/* Header */}
        <SheetHeader className="space-y-1 border-b border-border p-6">
          <SheetTitle className="text-base font-semibold">Edit access</SheetTitle>
          <SheetDescription className="text-sm">
            Assign roles, then choose extensions.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Section 1 — User info */}
          <section className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                {user.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 — Roles */}
          <section className="border-b border-border p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Step 1 · Roles
              </h3>
              <span className="text-xs text-muted-foreground">{roles.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => {
                const active = roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-foreground hover:border-primary/40",
                    )}
                    aria-pressed={active}
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                        active ? "border-primary-foreground bg-primary-foreground/20" : "border-muted-foreground/40",
                      )}
                    >
                      {active && (
                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-primary-foreground stroke-[2]">
                          <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {role}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3 — Extensions (progressive) */}
          <section className="p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Step 2 · Extensions
              </h3>
              {roles.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {extensions.length} of {allowed.length} enabled
                </span>
              )}
            </div>

            {roles.length === 0 ? (
              <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-surface-elevated p-5 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Select a role to configure extensions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {perRoleGroups.map(({ role, byGroup }) => {
                  const groupKeys = EXTENSION_GROUP_ORDER.filter((g) => byGroup[g]);
                  if (groupKeys.length === 0) return null;
                  const roleExtIds = groupKeys.flatMap((g) => byGroup[g]!.map((e) => e.id));
                  const selectedInRole = roleExtIds.filter((id) => extensions.includes(id)).length;
                  return (
                    <div
                      key={role}
                      className="overflow-hidden rounded-lg border border-border bg-surface"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-elevated px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                          <p className="text-sm font-semibold text-foreground">{role}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {selectedInRole} of {roleExtIds.length} enabled
                        </span>
                      </div>

                      <div className="space-y-4 p-4">
                        {groupKeys.map((group) => {
                          const items = byGroup[group]!;
                          const selected = items.filter((e) => extensions.includes(e.id));
                          const allSelected = selected.length === items.length && items.length > 0;
                          return (
                            <div key={group}>
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                                  {group}
                                </p>
                                <span className="text-[11px] text-muted-foreground">
                                  {selected.length}/{items.length}
                                </span>
                              </div>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      "flex w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-left text-sm transition",
                                      "border-border hover:border-extension/60 focus:outline-none focus:ring-2 focus:ring-extension/30",
                                    )}
                                  >
                                    <div className="flex min-h-[20px] flex-1 flex-wrap items-center gap-1.5">
                                      {selected.length === 0 ? (
                                        <span className="text-muted-foreground">
                                          Select {group.toLowerCase()}…
                                        </span>
                                      ) : (
                                        selected.map((ext) => (
                                          <span
                                            key={ext.id}
                                            className="inline-flex items-center gap-1 rounded-full border border-extension-border bg-extension-soft px-2 py-0.5 text-xs font-medium text-extension-soft-foreground"
                                          >
                                            {ext.label}
                                            <span
                                              role="button"
                                              tabIndex={-1}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExtension(ext.id);
                                              }}
                                              className="-mr-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-extension/15"
                                              aria-label={`Remove ${ext.label}`}
                                            >
                                              <X className="h-2.5 w-2.5" />
                                            </span>
                                          </span>
                                        ))
                                      )}
                                    </div>
                                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[--radix-popover-trigger-width] p-1"
                                  align="start"
                                >
                                  <div className="flex items-center justify-between px-2 py-1.5">
                                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                      {group}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (allSelected) {
                                          items.forEach((e) => {
                                            if (extensions.includes(e.id)) toggleExtension(e.id);
                                          });
                                        } else {
                                          items.forEach((e) => {
                                            if (!extensions.includes(e.id)) toggleExtension(e.id);
                                          });
                                        }
                                      }}
                                      className="text-[11px] font-medium text-extension hover:underline"
                                    >
                                      {allSelected ? "Clear" : "Select all"}
                                    </button>
                                  </div>
                                  <div className="max-h-64 overflow-y-auto">
                                    {items.map((ext) => {
                                      const checked = extensions.includes(ext.id);
                                      const exclusive = ext.roles.length === 1;
                                      return (
                                        <button
                                          key={`${role}-${ext.id}-opt`}
                                          type="button"
                                          onClick={() => toggleExtension(ext.id)}
                                          className={cn(
                                            "flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-sm transition",
                                            checked
                                              ? "bg-extension-soft text-extension-soft-foreground"
                                              : "text-foreground hover:bg-accent",
                                          )}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={cn(
                                                "flex h-4 w-4 items-center justify-center rounded border",
                                                checked
                                                  ? "border-extension bg-extension text-extension-foreground"
                                                  : "border-border",
                                              )}
                                            >
                                              {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                                            </span>
                                            {ext.label}
                                          </div>
                                          {exclusive && (
                                            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent-foreground">
                                              only
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Section 4 — Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-elevated p-4">
          <div className="flex flex-wrap items-center gap-1">
            {roles.slice(0, 3).map((r) => (
              <RoleChip key={r} role={r} />
            ))}
            {roles.length > 3 && (
              <span className="text-xs text-muted-foreground">+{roles.length - 3}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={roles.length === 0}>
              Save changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
