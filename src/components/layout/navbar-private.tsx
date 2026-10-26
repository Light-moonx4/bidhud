import Link from "next/link";

export function NavbarPrivate() {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem 2rem", borderBottom: "1px solid #e5e5e5" }}>
      <Link href="/dashboard">
        <strong>BidHub</strong>
      </Link>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link href="/dashboard">Mi panel</Link>
        <Link href="/publish">Publicar subasta</Link>
        <Link href="/auctions">Catálogo</Link>
      </nav>
    </header>
  );
}
