import Link from "next/link";

export function NavbarPublic() {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem 2rem", borderBottom: "1px solid #e5e5e5" }}>
      <Link href="/">
        <strong>BidHub</strong>
      </Link>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link href="/auctions">Subastas</Link>
        <Link href="/login">Iniciar sesión</Link>
        <Link href="/register">Registrarse</Link>
      </nav>
    </header>
  );
}
