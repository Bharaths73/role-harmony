import { useMemo, useState } from "react";
import {
  Search,
  Pencil,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
  CheckCircle2,
  UserCog,
  UserX,
  Trash2,
  UserPlus,
  KeyRound,
} from "lucide-react";
import { MOCK_USERS } from "./mock-data";
import {
  RoleName,
  User,
  EXTENSIONS,
  ExtensionGroup,
  EXTENSION_GROUP_ORDER,
} from "./types";
import { EditUserDrawer } from "./EditUserDrawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const GROUP_PREFIX: Record<ExtensionGroup, string> = {
  Categories: "Category",
  Containers: "Container",
  Dimensions: "Dimension",
  Regions: "Region",
};

export function UsersTable() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

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

  const toggleRole = (key: string) => {
    setExpandedRoles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getRoleExtensions = (user: User, role: RoleName) => {
    // extensions assigned to user that are allowed for this role, grouped
    const userExt = EXTENSIONS.filter(
      (e) => user.extensions.includes(e.id) && e.roles.includes(role),
    );
    const grouped: { group: ExtensionGroup; items: typeof userExt }[] = [];
    EXTENSION_GROUP_ORDER.forEach((g) => {
      const items = userExt.filter((e) => e.group === g);
      if (items.length > 0) grouped.push({ group: g, items });
    });
    return grouped;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
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
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="w-24 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="w-72 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                Users
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                Roles & Extensions
              </th>
              <th className="w-28 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => (
              <tr key={u.id} className="align-top transition-colors hover:bg-accent/30">
                {/* Status */}
                <td className="px-4 py-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(150_60%_92%)]">
                    <CheckCircle2 className="h-5 w-5 text-[hsl(150_60%_35%)]" />
                  </div>
                </td>

                {/* User */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {u.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {u.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                    <MenuIcon className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </td>

                {/* Roles & Extensions */}
                <td className="px-4 py-3">
                  {u.roles.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No roles</span>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {u.roles.map((role) => {
                        const key = `${u.id}::${role}`;
                        const expanded = expandedRoles[key] ?? true;
                        const groups = getRoleExtensions(u, role);
                        return (
                          <div key={role} className="py-2 first:pt-0 last:pb-0">
                            {/* Role header row */}
                            <button
                              type="button"
                              onClick={() => toggleRole(key)}
                              className="flex w-full items-center justify-between gap-2 rounded px-1 py-1 text-left hover:bg-accent/40"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {role}
                                </span>
                                <MenuIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              {expanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>

                            {/* Extension chips */}
                            {expanded && groups.length > 0 && (
                              <div className="mt-2 flex flex-col gap-1.5 pl-1">
                                {groups.map(({ group, items }) =>
                                  items.map((ext) => (
                                    <div
                                      key={ext.id}
                                      className="inline-flex w-fit items-center gap-2 rounded-full border border-extension-border bg-extension-soft px-3 py-1 text-xs font-medium text-extension-soft-foreground"
                                    >
                                      <span>
                                        {GROUP_PREFIX[group]} {ext.label}
                                      </span>
                                      <MenuIcon className="h-3 w-3 opacity-70" />
                                    </div>
                                  )),
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(u)}
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <UserActionsMenu user={u} onEdit={() => openEdit(u)} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
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

interface UserActionsMenuProps {
  user: User;
  onEdit: () => void;
}

function UserActionsMenu({ user, onEdit }: UserActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          aria-label={`Actions for ${user.name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEdit}>
          <UserCog className="mr-2 h-4 w-4" />
          Edit user
        </DropdownMenuItem>
        <DropdownMenuItem>
          <UserX className="mr-2 h-4 w-4" />
          Disable user
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete user
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserPlus className="mr-2 h-4 w-4" />
          Create user
        </DropdownMenuItem>
        <DropdownMenuItem>
          <KeyRound className="mr-2 h-4 w-4" />
          Create access token
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
