import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { NavbarPublic } from "@/components/layout/navbar-public";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavbarPublic />
      <main style={{ flex: 1, padding: "2rem" }}>{children}</main>
      <Footer />
    </div>
  );
}
