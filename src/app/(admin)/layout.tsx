import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "2rem" }}>{children}</main>
    </div>
  );
}
