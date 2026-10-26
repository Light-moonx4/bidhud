# Bitácora de BidHub

Registro cronológico de cambios y decisiones del proyecto. Las entradas nuevas se agregan al principio.

## 2026-10-26 — Correcciones de tipos en rutas de subastas

- Se unificó el identificador del usuario autenticado como `userId` en `TokenPayload` y en la creación/verificación de JWT. Se alinearon con ese tipo las rutas de subastas y la renovación de sesión.
- Se corrigió la ruta de pujas para guardar `payload.userId` en `Bid.bidderId`, que en Prisma referencia `User.id`. La suma para calcular la puja mínima convierte los `Decimal` de Prisma con `Number()`.
- Se actualizaron los tipos de `params` a `Promise<{ id: string }>` y se esperan en las rutas de detalle y pujas, según App Router de Next.js 16.
- Se validan el cuerpo recibido, los precios y la fecha antes de crear una subasta o puja.
- Archivos: `src/lib/tokens.ts`, `src/app/api/auctions/route.ts`, `src/app/api/auctions/[id]/bids/route.ts`, `src/app/api/auctions/[id]/route.ts` y `src/app/api/auth/refresh/route.ts`.
- Verificaciones: se contrastaron los cambios con `prisma/schema.prisma` y los tipos de `src/lib/tokens.ts`. No se ejecutó TypeScript ni pruebas.

## 2026-10-26 — Inicio de la bitácora

- Se creó la skill local `.agents/skills/documentar-bidhub/SKILL.md` para registrar en español los cambios, decisiones, verificaciones y pendientes de futuras sesiones en este repositorio.
- Se estableció `docs/bitacora.md` como archivo de seguimiento. Esta es la fecha de inicio; no se reconstruye aquí el trabajo previo porque no hay historial Git disponible en este entorno.
- Contexto observado: el README describe BidHub como una plataforma de subastas con Next.js App Router, TypeScript, Prisma y PostgreSQL/Supabase. `package.json` incluye dependencias para Next.js, Prisma, bcrypt y jose. Esto es una referencia inicial, no un inventario exhaustivo del estado de la aplicación.
- Verificaciones: se revisaron `README.md` y `package.json`. No se ejecutaron pruebas ni comandos de build.
