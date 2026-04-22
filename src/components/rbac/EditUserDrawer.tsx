import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mail, Info, Plus, X, Check, ChevronRight } from "lucide-react";
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
  const [hoveredGroup, setHoveredGroup] = useState<{ role: RoleName; group: ExtensionGroup } | null>(
    null,
  );

  useEffect(() => {
    if (user && open) {
      setRoles(user.roles);
      setExtensions(user.extensions);
      setHoveredGroup(null);
    }
  }, [user, open]);

  const allowed = useMemo(() => getAllowedExtensions(roles), [roles]);
  const allowedIds = useMemo(() => new Set(allowed.map((e) => e.id)), [allowed]);

  // Prune extensions when roles change
  useEffect(() => {
    setExtensions((prev) => prev.filter((id) => allowedIds.has(id)));
  }, [allowedIds]);

  // Per-role grouping (lazy)
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
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[520px] flex flex-col gap-0 p-0 bg-background"
      >
        {/* Header */}
        <SheetHeader className="space-y-1 border-b border-border p-6">
          <SheetTitle className="text-base font-semibold">Edit access</SheetTitle>
          <SheetDescription className="text-sm">
            Select roles, then add extensions for each role.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* User info */}
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

          {/* Roles — vertical list */}
          <section className="p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Roles
              </h3>
              <span className="text-xs text-muted-foreground">{roles.length} selected</span>
            </div>

            <div className="flex flex-col gap-2">
              {ROLES.map((role) => {
                const active = roles.includes(role);
                const roleData = perRoleGroups.find((p) => p.role === role);
                const groupKeys = roleData
                  ? EXTENSION_GROUP_ORDER.filter((g) => roleData.byGroup[g])
                  : [];
                const roleExtIds = groupKeys.flatMap((g) => roleData!.byGroup[g]!.map((e) => e.id));
                const selectedForRole = roleExtIds.filter((id) => extensions.includes(id));

                return (
                  <div
                    key={role}
                    className={cn(
                      "rounded-lg border transition",
                      active ? "border-border bg-surface" : "border-border bg-background",
                    )}
                  >
                    {/* Role row */}
                    <button
                      type="button"
                      onClick={() => toggleRole(role)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      aria-pressed={active}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border transition",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-background",
                          )}
                        >
                          {active && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span className="text-sm font-medium text-foreground">{role}</span>
                      </div>
                      {active && (
                        <span className="text-[11px] text-muted-foreground">
                          {selectedForRole.length} extension
                          {selectedForRole.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </button>

                    {/* Extensions for this role */}
                    {active && (
                      <div className="border-t border-border px-4 py-3">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          {selectedForRole.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              No extensions added yet.
                            </span>
                          ) : (
                            selectedForRole.map((id) => {
                              const ext = EXTENSIONS.find((e) => e.id === id);
                              if (!ext) return null;
                              return (
                                <span
                                  key={`${role}-${id}-chip`}
                                  className="inline-flex items-center gap-1 rounded-full border border-extension-border bg-extension-soft px-2 py-0.5 text-xs font-medium text-extension-soft-foreground"
                                >
                                  <span className="text-[9px] uppercase tracking-wide text-extension-soft-foreground/60">
                                    {ext.group.slice(0, 3)}
                                  </span>
                                  {ext.label}
                                  <button
                                    type="button"
                                    onClick={() => toggleExtension(id)}
                                    className="-mr-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-extension/15"
                                    aria-label={`Remove ${ext.label}`}
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>

                        {/* Add extension popover with nested group → list */}
                        <Popover
                          onOpenChange={(o) => {
                            if (!o) setHoveredGroup(null);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-extension/50 bg-background px-2.5 py-1 text-xs font-medium text-extension transition hover:bg-extension-soft"
                            >
                              <Plus className="h-3 w-3" />
                              Add extension
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            side="bottom"
                            className="w-56 p-1"
                            onMouseLeave={() => setHoveredGroup(null)}
                          >
                            <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Extension type
                            </div>
                            <div className="relative">
                              {groupKeys.map((group) => {
                                const items = roleData!.byGroup[group]!;
                                const selectedInGroup = items.filter((e) =>
                                  extensions.includes(e.id),
                                ).length;
                                const isHovered =
                                  hoveredGroup?.role === role && hoveredGroup?.group === group;
                                return (
                                  <div
                                    key={`${role}-${group}-row`}
                                    className="relative"
                                    onMouseEnter={() => setHoveredGroup({ role, group })}
                                  >
                                    <div
                                      className={cn(
                                        "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm",
                                        isHovered ? "bg-accent" : "hover:bg-accent",
                                      )}
                                    >
                                      <span className="text-foreground">{group}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-muted-foreground">
                                          {selectedInGroup}/{items.length}
                                        </span>
                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                      </div>
                                    </div>

                                    {/* Nested flyout */}
                                    {isHovered && (
                                      <div
                                        className="absolute left-full top-0 z-50 ml-1 w-56 rounded-md border border-border bg-popover p-1 shadow-md"
                                        onMouseEnter={() => setHoveredGroup({ role, group })}
                                      >
                                        <div className="flex items-center justify-between px-2 py-1.5">
                                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            {group}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const allOn = items.every((e) =>
                                                extensions.includes(e.id),
                                              );
                                              if (allOn) {
                                                items.forEach((e) => {
                                                  if (extensions.includes(e.id))
                                                    toggleExtension(e.id);
                                                });
                                              } else {
                                                items.forEach((e) => {
                                                  if (!extensions.includes(e.id))
                                                    toggleExtension(e.id);
                                                });
                                              }
                                            }}
                                            className="text-[11px] font-medium text-extension hover:underline"
                                          >
                                            {items.every((e) => extensions.includes(e.id))
                                              ? "Clear"
                                              : "All"}
                                          </button>
                                        </div>
                                        <div className="max-h-56 overflow-y-auto">
                                          {items.map((ext) => {
                                            const checked = extensions.includes(ext.id);
                                            return (
                                              <button
                                                key={`${role}-${ext.id}-flyout`}
                                                type="button"
                                                onClick={() => toggleExtension(ext.id)}
                                                className={cn(
                                                  "flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-sm transition",
                                                  checked
                                                    ? "bg-extension-soft text-extension-soft-foreground"
                                                    : "text-foreground hover:bg-accent",
                                                )}
                                              >
                                                <span className="flex items-center gap-2">
                                                  <span
                                                    className={cn(
                                                      "flex h-4 w-4 items-center justify-center rounded border",
                                                      checked
                                                        ? "border-extension bg-extension text-extension-foreground"
                                                        : "border-border",
                                                    )}
                                                  >
                                                    {checked && (
                                                      <Check className="h-3 w-3" strokeWidth={3} />
                                                    )}
                                                  </span>
                                                  {ext.label}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {roles.length === 0 && (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-dashed border-border bg-surface-elevated p-4 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Select a role to start adding extensions.</p>
              </div>
            )}
          </section>
        </div>

        {/* Actions */}
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
