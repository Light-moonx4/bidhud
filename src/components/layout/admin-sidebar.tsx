import Link from "next/link";

export function AdminSidebar() {
  return (
    <aside style={{ width: "220px", padding: "1.5rem", borderRight: "1px solid #e5e5e5" }}>
      <strong>Moderación</strong>
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
        <Link href="/admin">Resumen</Link>
        <Link href="/auctions">Ver catálogo</Link>
        <Link href="/dashboard">Volver a mi panel</Link>
      </nav>
    </aside>
  );
}
