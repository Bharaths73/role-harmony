export type RoleName = "Admin" | "Editor" | "Viewer" | "Billing" | "Support";

export interface Assignment {
  id: string;
  role: RoleName;
  extension: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  lastActive: string;
  assignments: Assignment[];
}

export const ROLE_CATALOG: Record<RoleName, string[]> = {
  Admin: ["Full Access", "User Management", "Billing", "Audit Logs"],
  Editor: ["Content", "Drafts", "Media Library", "Comments"],
  Viewer: ["Read-Only", "Audits", "Reports", "Dashboards"],
  Billing: ["Invoices", "Subscriptions", "Refunds"],
  Support: ["Tickets", "Live Chat", "Knowledge Base"],
};
