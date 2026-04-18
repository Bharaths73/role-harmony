import { useMemo, useState } from "react";
import { Search, Pencil } from "lucide-react";
import { MOCK_USERS } from "./mock-data";
import { RoleName, User, getExtensionById } from "./types";
import { RoleChip } from "./RoleChip";
import { EditUserDrawer } from "./EditUserDrawer";
import { Button } from "@/components/ui/button";

export function UsersTable() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roles.some((r) => r.toLowerCase().includes(q)),
    );
  }, [users, query]);

  const handleSave = (userId: string, roles: RoleName[], extensions: string[]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, roles, extensions } : u)),
    );
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setDrawerOpen(true);
  };

  const summarizeExtensions = (ids: string[]) => {
    if (ids.length === 0) return "—";
    const labels = ids.map((id) => getExtensionById(id)?.label).filter(Boolean) as string[];
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, emails, roles…"
            className="h-9 w-80 rounded-md border border-border bg-surface pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} of {users.length} users
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-muted-foreground">
            <tr className="border-b border-border text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Roles</th>
              <th className="px-4 py-3 text-left font-medium">Extensions</th>
              <th className="px-4 py-3 text-left font-medium">Last active</th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-accent/40">
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {u.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No roles</span>
                    ) : (
                      u.roles.map((r) => <RoleChip key={r} role={r} />)
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-middle text-sm text-foreground/80">
                  {summarizeExtensions(u.extensions)}
                </td>
                <td className="px-4 py-3 align-middle font-mono text-xs text-muted-foreground">
                  {u.lastActive}
                </td>
                <td className="px-4 py-3 text-right align-middle">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(u)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No users match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditUserDrawer
        user={editing}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={handleSave}
      />
    </div>
  );
}
