import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken, ACCESS_COOKIE_NAME } from '@/lib/tokens';

export async function POST(
  request: NextRequest, // <-- Cambiado a NextRequest para soportar .cookies
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auctionId } = await params;

    // 1. Verificar autenticación mediante cookie HttpOnly
    const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const amount =
      typeof body === 'object' && body !== null && 'amount' in body
        ? body.amount
        : undefined;

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Monto de puja inválido' }, { status: 400 });
    }

    // 2. Buscar la subasta y validar su estado
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      return NextResponse.json({ error: 'Subasta no encontrada' }, { status: 404 });
    }

    if (auction.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'La subasta no está activa' }, { status: 400 });
    }

    const now = new Date();
    if (now >= auction.closingDate) {
      return NextResponse.json({ error: 'La subasta ya ha finalizado' }, { status: 400 });
    }

    // Prevenir que el vendedor puje en su propia subasta.
    if (auction.sellerId === payload.userId) {
      return NextResponse.json({ error: 'No puedes pujar en tu propia subasta' }, { status: 400 });
    }

    // 3. Validar que la oferta supere el precio actual + incremento mínimo (Convertidos a Number)
    const minimumRequired = Number(auction.currentPrice) + Number(auction.minimumIncrement);
    if (amount < minimumRequired) {
      return NextResponse.json(
        { error: `La puja debe ser de al menos ${minimumRequired}` },
        { status: 400 }
      );
    }

    // 4. Regla de los 5 minutos (Extensión automática por "sniping")
    const fiveMinutesInMs = 5 * 60 * 1000;
    const timeRemaining = new Date(auction.closingDate).getTime() - now.getTime();
    let newClosingDate = auction.closingDate;

    if (timeRemaining <= fiveMinutesInMs) {
      newClosingDate = new Date(now.getTime() + fiveMinutesInMs);
    }

    // 5. Ejecutar la creación de la puja y actualización de la subasta en una transacción atómica
    const [newBid, updatedAuction] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          amount,
          auctionId,
          bidderId: payload.userId,
        },
      }),
      prisma.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: amount,
          closingDate: newClosingDate,
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: 'Puja realizada con éxito',
        bid: newBid,
        auction: updatedAuction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al procesar la puja:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
