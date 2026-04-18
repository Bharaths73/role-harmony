export type RoleName = "Admin" | "Editor" | "Viewer" | "Billing" | "Support";

export type ExtensionGroup = "Categories" | "Containers" | "Dimensions" | "Regions";

export const EXTENSION_GROUP_ORDER: ExtensionGroup[] = [
  "Categories",
  "Containers",
  "Dimensions",
  "Regions",
];

export interface ExtensionDef {
  id: string;
  label: string;
  group: ExtensionGroup;
  roles: RoleName[]; // which roles allow this extension
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  lastActive: string;
  roles: RoleName[];
  extensions: string[]; // extension ids
}

export const ROLES: RoleName[] = ["Admin", "Editor", "Viewer", "Billing", "Support"];

/**
 * Each extension declares which roles allow it.
 * Drawer shows the union of allowed extensions for selected roles,
 * grouped by `group`.
 */
export const EXTENSIONS: ExtensionDef[] = [
  // Categories
  { id: "cat_full", label: "Full Access", group: "Categories", roles: ["Admin"] },
  { id: "cat_user_mgmt", label: "User Management", group: "Categories", roles: ["Admin"] },
  { id: "cat_content", label: "Content", group: "Categories", roles: ["Admin", "Editor"] },
  { id: "cat_drafts", label: "Drafts", group: "Categories", roles: ["Editor"] },
  { id: "cat_readonly", label: "Read-Only", group: "Categories", roles: ["Viewer"] },
  { id: "cat_invoices", label: "Invoices", group: "Categories", roles: ["Billing"] },
  { id: "cat_refunds", label: "Refunds", group: "Categories", roles: ["Billing"] },
  { id: "cat_tickets", label: "Tickets", group: "Categories", roles: ["Support"] },

  // Containers
  { id: "con_audit", label: "Audit Logs", group: "Containers", roles: ["Admin", "Viewer"] },
  { id: "con_media", label: "Media Library", group: "Containers", roles: ["Editor"] },
  { id: "con_reports", label: "Reports", group: "Containers", roles: ["Viewer", "Billing"] },
  { id: "con_dashboards", label: "Dashboards", group: "Containers", roles: ["Viewer", "Admin"] },
  { id: "con_subs", label: "Subscriptions", group: "Containers", roles: ["Billing"] },
  { id: "con_kb", label: "Knowledge Base", group: "Containers", roles: ["Support", "Editor"] },
  { id: "con_chat", label: "Live Chat", group: "Containers", roles: ["Support"] },

  // Dimensions
  { id: "dim_revenue", label: "Revenue", group: "Dimensions", roles: ["Admin", "Billing"] },
  { id: "dim_traffic", label: "Traffic", group: "Dimensions", roles: ["Admin", "Viewer"] },
  { id: "dim_engagement", label: "Engagement", group: "Dimensions", roles: ["Editor", "Viewer"] },
  { id: "dim_support_sla", label: "Support SLA", group: "Dimensions", roles: ["Support"] },

  // Regions
  { id: "reg_na", label: "North America", group: "Regions", roles: ["Admin", "Billing", "Support"] },
  { id: "reg_emea", label: "EMEA", group: "Regions", roles: ["Admin", "Editor"] },
  { id: "reg_apac", label: "APAC", group: "Regions", roles: ["Admin", "Viewer"] },
  { id: "reg_latam", label: "LATAM", group: "Regions", roles: ["Admin", "Support"] },
];

export const getActiveGroups = (roles: RoleName[]): ExtensionGroup[] => {
  if (roles.length === 0) return [];
  const allowed = getAllowedExtensions(roles);
  const present = new Set(allowed.map((e) => e.group));
  return EXTENSION_GROUP_ORDER.filter((g) => present.has(g));
};

export const getExtensionById = (id: string) => EXTENSIONS.find((e) => e.id === id);

export const getAllowedExtensions = (roles: RoleName[]): ExtensionDef[] => {
  if (roles.length === 0) return [];
  return EXTENSIONS.filter((ext) => ext.roles.some((r) => roles.includes(r)));
};
