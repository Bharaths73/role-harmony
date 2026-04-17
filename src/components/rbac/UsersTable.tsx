import { useMemo, useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MOCK_USERS } from "./mock-data";
import { Assignment, RoleName, User } from "./types";
import { RoleChip } from "./RoleChip";
import { AddRolePopover } from "./AddRolePopover";
import { BulkActionBar } from "./BulkActionBar";

export function UsersTable() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.assignments.some(
          (a) =>
            a.role.toLowerCase().includes(q) ||
            a.extension.toLowerCase().includes(q),
        ),
    );
  }, [users, query]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((u) => selected.has(u.id));

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filtered.forEach((u) => next.delete(u.id));
      } else {
        filtered.forEach((u) => next.add(u.id));
      }
      return next;
    });
  };

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const addAssignment = (userId: string, role: RoleName, extension: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        if (u.assignments.some((a) => a.role === role && a.extension === extension))
          return u;
        const newA: Assignment = {
          id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          role,
          extension,
        };
        return { ...u, assignments: [...u.assignments, newA] };
      }),
    );
  };

  const removeAssignment = (userId: string, assignmentId: string) => {
    let removed: Assignment | undefined;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        removed = u.assignments.find((a) => a.id === assignmentId);
        return { ...u, assignments: u.assignments.filter((a) => a.id !== assignmentId) };
      }),
    );
    if (removed) {
      toast({
        title: "Role removed",
        description: `${removed.role} ▸ ${removed.extension}`,
      });
    }
  };

  const bulkAdd = (role: RoleName, extension: string) => {
    selected.forEach((id) => addAssignment(id, role, extension));
    toast({
      title: "Role assigned",
      description: `${role} ▸ ${extension} added to ${selected.size} user${selected.size > 1 ? "s" : ""}.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, emails, roles..."
              className="h-9 w-72 rounded-md border border-border bg-surface pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground">
            Filter
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {users.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-muted-foreground">
            <tr className="border-b border-border text-xs uppercase tracking-wider">
              <th className="w-10 px-3 py-3">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={toggleAllVisible}
                  aria-label="Select all visible"
                />
              </th>
              <th className="px-3 py-3 text-left font-medium">User</th>
              <th className="px-3 py-3 text-left font-medium">Email</th>
              <th className="px-3 py-3 text-left font-medium">Roles & Extensions</th>
              <th className="px-3 py-3 text-left font-medium">Last Active</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => {
              const isSelected = selected.has(u.id);
              return (
                <tr
                  key={u.id}
                  className={`transition-colors ${
                    isSelected ? "bg-primary/10" : "hover:bg-surface-elevated"
                  }`}
                >
                  <td className="px-3 py-3 align-middle">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(u.id)}
                      aria-label={`Select ${u.name}`}
                    />
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-xs font-semibold text-primary-foreground">
                        {u.initials}
                      </div>
                      <span className="font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-middle font-mono text-xs text-muted-foreground">
                    {u.email}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {u.assignments.map((a) => (
                        <RoleChip
                          key={a.id}
                          assignment={a}
                          onRemove={(id) => removeAssignment(u.id, id)}
                        />
                      ))}
                      <AddRolePopover
                        onAdd={(role, ext) => addAssignment(u.id, role, ext)}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3 align-middle font-mono text-xs text-muted-foreground">
                    {u.lastActive}
                  </td>
                  <td className="px-3 py-3 align-middle text-right">
                    <button
                      className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                      aria-label="Row actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-12 text-center text-sm text-muted-foreground"
                >
                  No users match "{query}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <BulkActionBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onBulkAdd={bulkAdd}
      />
    </div>
  );
}
