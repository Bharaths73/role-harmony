import { UsersTable } from "@/components/rbac/UsersTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Access control
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Users & Roles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage roles and extensions per user. Click Edit to configure access.
          </p>
        </header>
        <UsersTable />
      </div>
    </div>
  );
};

export default Index;
