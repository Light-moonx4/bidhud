# BidHub

Plataforma de subastas en línea. Next.js 16 (App Router), TypeScript estricto, Prisma y PostgreSQL (Supabase).

## Puesta en marcha

```bash
npm install
cp .env.example .env      # completa DATABASE_URL, DIRECT_URL y los secretos JWT
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Notas

- `src/middleware.ts` protege `/dashboard`, `/publish`, `/admin` y `/api/moderation`.
  En Next.js 16 puedes renombrarlo a `src/proxy.ts` y cambiar la función exportada a `proxy`.
- Los Route Handlers de `src/app/api/` responden 501 hasta que se implementen.
