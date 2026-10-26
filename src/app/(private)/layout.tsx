import type { ReactNode } from "react";
import { NavbarPrivate } from "@/components/layout/navbar-private";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <NavbarPrivate />
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}
