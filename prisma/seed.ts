import { AuctionStatus, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

const daysFromNow = (days: number): Date => new Date(Date.now() + days * DAY_MS);
const hoursAgo = (hours: number): Date => new Date(Date.now() - hours * 60 * 60 * 1000);

interface CategorySeed {
  name: string;
  slug: string;
  description: string;
}

interface BidSeed {
  amount: number;
  createdAt: Date;
}

interface AuctionSeed {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  initialPrice: number;
  minimumIncrement: number;
  currentPrice: number;
  closingDate: Date;
  status: AuctionStatus;
  cancelReason: string | null;
  categorySlug: string;
  bids: BidSeed[];
}

const categories: CategorySeed[] = [
  {
    name: "Relojes",
    slug: "relojes",
    description: "Relojes de pulsera, de bolsillo y piezas de colección.",
  },
  {
    name: "Cartas Coleccionables",
    slug: "cartas-coleccionables",
    description: "Cartas de juegos y colecciones: Pokémon, Magic, deportes y más.",
  },
  {
    name: "Vinilos",
    slug: "vinilos",
    description: "Discos de vinilo, primeras ediciones y reediciones.",
  },
];

const auctions: AuctionSeed[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Reloj Seiko 5 automático vintage",
    description:
      "Seiko 5 automático de los años 80 en excelente estado, con caja de acero y correa original.",
    imageUrl: "https://picsum.photos/seed/bidhub-seiko/800/600",
    initialPrice: 150,
    minimumIncrement: 10,
    currentPrice: 180,
    closingDate: daysFromNow(5),
    status: AuctionStatus.ACTIVE,
    cancelReason: null,
    categorySlug: "relojes",
    bids: [
      { amount: 160, createdAt: hoursAgo(30) },
      { amount: 170, createdAt: hoursAgo(20) },
      { amount: 180, createdAt: hoursAgo(5) },
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Carta Pokémon Charizard holo 1ª edición",
    description:
      "Charizard holográfico de primera edición, conservado en funda protectora rígida.",
    imageUrl: "https://picsum.photos/seed/bidhub-charizard/800/600",
    initialPrice: 500,
    minimumIncrement: 25,
    currentPrice: 500,
    closingDate: daysFromNow(3),
    status: AuctionStatus.ACTIVE,
    cancelReason: null,
    categorySlug: "cartas-coleccionables",
    bids: [],
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Vinilo Abbey Road primera edición",
    description:
      "Vinilo original de Abbey Road, portada y disco en muy buen estado, sin rayones profundos.",
    imageUrl: "https://picsum.photos/seed/bidhub-abbeyroad/800/600",
    initialPrice: 100,
    minimumIncrement: 5,
    currentPrice: 135,
    closingDate: daysFromNow(-2),
    status: AuctionStatus.CLOSED,
    cancelReason: null,
    categorySlug: "vinilos",
    bids: [
      { amount: 110, createdAt: hoursAgo(120) },
      { amount: 120, createdAt: hoursAgo(90) },
      { amount: 135, createdAt: hoursAgo(60) },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "Reloj Casio F-91W digital",
    description: "Casio F-91W clásico, funcionando perfectamente, con correa de resina nueva.",
    imageUrl: "https://picsum.photos/seed/bidhub-casio/800/600",
    initialPrice: 40,
    minimumIncrement: 5,
    currentPrice: 40,
    closingDate: daysFromNow(-1),
    status: AuctionStatus.DESERTED,
    cancelReason: null,
    categorySlug: "relojes",
    bids: [],
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    title: "Vinilo The Dark Side of the Moon",
    description: "Edición de colección del clásico de Pink Floyd, con póster y pegatinas.",
    imageUrl: "https://picsum.photos/seed/bidhub-darkside/800/600",
    initialPrice: 80,
    minimumIncrement: 5,
    currentPrice: 80,
    closingDate: daysFromNow(7),
    status: AuctionStatus.CANCELED,
    cancelReason:
      "Cancelada por moderación: la descripción no coincide con el estado real del producto.",
    categorySlug: "vinilos",
    bids: [],
  },
];

async function main(): Promise<void> {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345!";

  const [adminHash, sellerHash, bidderHash] = await Promise.all([
    bcrypt.hash(adminPassword, SALT_ROUNDS),
    bcrypt.hash("Vendedor12345!", SALT_ROUNDS),
    bcrypt.hash("Postor12345!", SALT_ROUNDS),
  ]);

  await prisma.user.upsert({
    where: { email: "admin@bidhub.com" },
    update: { passwordHash: adminHash, role: Role.ADMIN },
    create: {
      name: "Administrador BidHub",
      email: "admin@bidhub.com",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "vendedor@bidhub.com" },
    update: {},
    create: {
      name: "Vendedor Demo",
      email: "vendedor@bidhub.com",
      passwordHash: sellerHash,
      role: Role.USER,
    },
  });

  const bidder = await prisma.user.upsert({
    where: { email: "postor@bidhub.com" },
    update: {},
    create: {
      name: "Postor Demo",
      email: "postor@bidhub.com",
      passwordHash: bidderHash,
      role: Role.USER,
    },
  });

  const categoryIdBySlug = new Map<string, string>();

  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
    categoryIdBySlug.set(saved.slug, saved.id);
  }

  for (const auction of auctions) {
    const categoryId = categoryIdBySlug.get(auction.categorySlug);
    if (!categoryId) {
      throw new Error(`Categoría no encontrada: ${auction.categorySlug}`);
    }

    const data = {
      title: auction.title,
      description: auction.description,
      imageUrl: auction.imageUrl,
      initialPrice: auction.initialPrice,
      minimumIncrement: auction.minimumIncrement,
      currentPrice: auction.currentPrice,
      closingDate: auction.closingDate,
      status: auction.status,
      cancelReason: auction.cancelReason,
      sellerId: seller.id,
      categoryId,
    };

    await prisma.auction.upsert({
      where: { id: auction.id },
      update: data,
      create: { id: auction.id, ...data },
    });

    await prisma.bid.deleteMany({ where: { auctionId: auction.id } });

    if (auction.bids.length > 0) {
      await prisma.bid.createMany({
        data: auction.bids.map((bid) => ({
          amount: bid.amount,
          createdAt: bid.createdAt,
          auctionId: auction.id,
          bidderId: bidder.id,
        })),
      });
    }
  }

  console.log("Seed completado: 3 usuarios, 3 categorías y 5 subastas.");
}

main()
  .catch((error: unknown) => {
    console.error("Error ejecutando el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
