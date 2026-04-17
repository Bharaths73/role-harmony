import { User } from "./types";

export const MOCK_USERS: User[] = [
  {
    id: "u_1",
    name: "Anya Petrova",
    email: "anya.p@acme.io",
    initials: "AP",
    lastActive: "2024-03-10 14:30",
    assignments: [{ id: "a1", role: "Admin", extension: "Full Access" }],
  },
  {
    id: "u_2",
    name: "Ben Miller",
    email: "ben.m@acme.io",
    initials: "BM",
    lastActive: "2024-03-09 09:15",
    assignments: [
      { id: "a2", role: "Editor", extension: "Content" },
      { id: "a3", role: "Viewer", extension: "Audits" },
    ],
  },
  {
    id: "u_3",
    name: "Chloe Lee",
    email: "chloe.l@acme.io",
    initials: "CL",
    lastActive: "2024-03-08 11:00",
    assignments: [{ id: "a4", role: "Viewer", extension: "Read-Only" }],
  },
  {
    id: "u_4",
    name: "David Rodriguez",
    email: "david.r@acme.io",
    initials: "DR",
    lastActive: "2024-03-07 18:45",
    assignments: [
      { id: "a5", role: "Admin", extension: "User Management" },
      { id: "a6", role: "Billing", extension: "Invoices" },
    ],
  },
  {
    id: "u_5",
    name: "Elena Morales",
    email: "elena.m@acme.io",
    initials: "EM",
    lastActive: "2024-03-06 16:00",
    assignments: [{ id: "a7", role: "Editor", extension: "Drafts" }],
  },
  {
    id: "u_6",
    name: "Finn Powell",
    email: "finn.p@acme.io",
    initials: "FP",
    lastActive: "2024-03-05 10:10",
    assignments: [
      { id: "a8", role: "Support", extension: "Tickets" },
      { id: "a9", role: "Viewer", extension: "Reports" },
    ],
  },
  {
    id: "u_7",
    name: "Grace Hill",
    email: "grace.h@acme.io",
    initials: "GH",
    lastActive: "2024-03-04 08:22",
    assignments: [{ id: "a10", role: "Editor", extension: "Media Library" }],
  },
];
